import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { createWorker } from 'tesseract.js'

export interface ProcessedFile {
  path: string
  filename: string
  extension: string
  size: number
  createdAt: number
  modifiedAt: number
  contentHash: string
  extractedText: string
}

export class FileProcessor {
  private readonly MAX_TEXT_LENGTH = 100000 // 100k characters max
  private readonly SUPPORTED_EXTENSIONS = [
    '.txt', '.md', '.pdf', '.doc', '.docx',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp'
  ]

  async processFile(filePath: string): Promise<ProcessedFile | null> {
    try {
      const stats = fs.statSync(filePath)

      if (!stats.isFile()) {
        return null
      }

      const ext = path.extname(filePath).toLowerCase()
      const filename = path.basename(filePath)

      if (!this.SUPPORTED_EXTENSIONS.includes(ext)) {
        return null
      }

      const buffer = fs.readFileSync(filePath)
      const contentHash = this.calculateHash(buffer)

      let extractedText = ''

      if (['.txt', '.md'].includes(ext)) {
        extractedText = await this.extractPlainText(buffer)
      } else if (ext === '.pdf') {
        extractedText = await this.extractPdfText(buffer)
      } else if (['.doc', '.docx'].includes(ext)) {
        extractedText = await this.extractDocxText(buffer)
      } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
        extractedText = await this.extractImageText(buffer)
      }

      extractedText = this.cleanText(extractedText)

      return {
        path: filePath,
        filename,
        extension: ext,
        size: stats.size,
        createdAt: stats.birthtimeMs,
        modifiedAt: stats.mtimeMs,
        contentHash,
        extractedText
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
      return null
    }
  }

  private calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }

  private async extractPlainText(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8')
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer)
      return data.text
    } catch (error) {
      console.error('PDF extraction error:', error)
      return ''
    }
  }

  private async extractDocxText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } catch (error) {
      console.error('DOCX extraction error:', error)
      return ''
    }
  }

  private async extractImageText(buffer: Buffer): Promise<string> {
    try {
      const worker = await createWorker('eng')
      const { data } = await worker.recognize(buffer)
      await worker.terminate()
      return data.text
    } catch (error) {
      console.error('OCR error:', error)
      return ''
    }
  }

  private cleanText(text: string): string {
    let cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    if (cleaned.length > this.MAX_TEXT_LENGTH) {
      cleaned = cleaned.substring(0, this.MAX_TEXT_LENGTH)
    }

    return cleaned
  }

  isSupported(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()
    return this.SUPPORTED_EXTENSIONS.includes(ext)
  }
}
