import chokidar from 'chokidar'
import { FileProcessor } from './fileProcessor'
import { AIService } from './aiService'
import { DatabaseQueries } from '../database/queries'

export class FileWatcher {
  private watchers: Map<string, chokidar.FSWatcher> = new Map()
  private processingQueue: Set<string> = new Set()
  private isProcessing = false

  constructor(
    private dbQueries: DatabaseQueries,
    private fileProcessor: FileProcessor,
    private aiService: AIService
  ) {}

  startWatching(folderPath: string): void {
    if (this.watchers.has(folderPath)) {
      console.log(`Already watching: ${folderPath}`)
      return
    }

    const watcher = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: false,
      depth: 10,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    })

    watcher
      .on('add', (path) => this.handleFileAdded(path))
      .on('change', (path) => this.handleFileChanged(path))
      .on('unlink', (path) => this.handleFileDeleted(path))
      .on('error', (error) => console.error(`Watcher error:`, error))

    this.watchers.set(folderPath, watcher)
    console.log(`Started watching: ${folderPath}`)
  }

  stopWatching(folderPath: string): void {
    const watcher = this.watchers.get(folderPath)
    if (watcher) {
      watcher.close()
      this.watchers.delete(folderPath)
      console.log(`Stopped watching: ${folderPath}`)
    }
  }

  stopAll(): void {
    for (const [, watcher] of this.watchers) {
      watcher.close()
    }
    this.watchers.clear()
  }

  private async handleFileAdded(filePath: string): Promise<void> {
    if (!this.fileProcessor.isSupported(filePath)) {
      return
    }

    this.processingQueue.add(filePath)
    this.processQueue()
  }

  private async handleFileChanged(filePath: string): Promise<void> {
    if (!this.fileProcessor.isSupported(filePath)) {
      return
    }

    const existingFile = this.dbQueries.getFileByPath(filePath)
    if (existingFile) {
      this.processingQueue.add(filePath)
      this.processQueue()
    }
  }

  private handleFileDeleted(filePath: string): void {
    try {
      this.dbQueries.deleteFileByPath(filePath)
      console.log(`Deleted from index: ${filePath}`)
    } catch (error) {
      console.error(`Error deleting file record: ${filePath}`, error)
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.size === 0) {
      return
    }

    this.isProcessing = true

    const iterator = this.processingQueue.values().next()
    if (iterator.done || !iterator.value) {
      this.isProcessing = false
      return
    }

    const filePath = iterator.value
    this.processingQueue.delete(filePath)

    try {
      await this.indexFile(filePath)
    } catch (error) {
      console.error(`Error indexing file: ${filePath}`, error)
    }

    this.isProcessing = false

    if (this.processingQueue.size > 0) {
      setTimeout(() => this.processQueue(), 100)
    }
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      console.log(`Indexing: ${filePath}`)

      const processedFile = await this.fileProcessor.processFile(filePath)

      if (!processedFile) {
        return
      }

      const existingFile = this.dbQueries.getFileByPath(filePath)

      if (existingFile && existingFile.content_hash === processedFile.contentHash) {
        console.log(`File unchanged, skipping: ${filePath}`)
        return
      }

      let fileId: number

      if (existingFile) {
        this.dbQueries.updateFile(existingFile.id, {
          size: processedFile.size,
          modified_at: processedFile.modifiedAt,
          indexed_at: Date.now(),
          content_hash: processedFile.contentHash
        })
        fileId = existingFile.id
      } else {
        fileId = this.dbQueries.insertFile({
          path: processedFile.path,
          filename: processedFile.filename,
          extension: processedFile.extension,
          size: processedFile.size,
          created_at: processedFile.createdAt,
          modified_at: processedFile.modifiedAt,
          indexed_at: Date.now(),
          content_hash: processedFile.contentHash
        })
      }

      if (processedFile.extractedText.length > 0) {
        const summary = await this.aiService.generateSummary(
          processedFile.extractedText,
          processedFile.filename
        )

        this.dbQueries.insertFileContent(fileId, processedFile.extractedText, summary)

        const embedding = await this.aiService.generateEmbedding(processedFile.extractedText)
        this.dbQueries.insertEmbedding(fileId, embedding)

        console.log(`Successfully indexed: ${filePath}`)
      } else {
        console.log(`No text extracted from: ${filePath}`)
      }
    } catch (error) {
      console.error(`Failed to index file: ${filePath}`, error)
    }
  }

  async indexExistingFiles(folderPath: string): Promise<void> {
    console.log(`Indexing existing files in: ${folderPath}`)
  }
}
