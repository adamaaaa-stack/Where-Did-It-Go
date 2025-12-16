import Database from 'better-sqlite3'
import { FileRecord, FileContent, WatchedFolder } from './schema'

export class DatabaseQueries {
  constructor(private db: Database.Database) {}

  // File operations
  insertFile(file: Omit<FileRecord, 'id'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO files (path, filename, extension, size, created_at, modified_at, indexed_at, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      file.path,
      file.filename,
      file.extension,
      file.size,
      file.created_at,
      file.modified_at,
      file.indexed_at,
      file.content_hash
    )
    return result.lastInsertRowid as number
  }

  getFileByPath(path: string): FileRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM files WHERE path = ?')
    return stmt.get(path) as FileRecord | undefined
  }

  updateFile(id: number, updates: Partial<FileRecord>): void {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    const stmt = this.db.prepare(`UPDATE files SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
  }

  deleteFile(id: number): void {
    const stmt = this.db.prepare('DELETE FROM files WHERE id = ?')
    stmt.run(id)
  }

  deleteFileByPath(path: string): void {
    const stmt = this.db.prepare('DELETE FROM files WHERE path = ?')
    stmt.run(path)
  }

  // Content operations
  insertFileContent(fileId: number, text: string, summary: string | null): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO file_contents (file_id, extracted_text, summary)
      VALUES (?, ?, ?)
    `)
    stmt.run(fileId, text, summary)
  }

  getFileContent(fileId: number): FileContent | undefined {
    const stmt = this.db.prepare('SELECT * FROM file_contents WHERE file_id = ?')
    return stmt.get(fileId) as FileContent | undefined
  }

  // Embedding operations
  insertEmbedding(fileId: number, embedding: number[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO file_embeddings (file_id, embedding)
      VALUES (?, ?)
    `)
    stmt.run(fileId, JSON.stringify(embedding))
  }

  getEmbedding(fileId: number): number[] | undefined {
    const stmt = this.db.prepare('SELECT embedding FROM file_embeddings WHERE file_id = ?')
    const result = stmt.get(fileId) as { embedding: string } | undefined
    return result ? JSON.parse(result.embedding) : undefined
  }

  getAllEmbeddings(): Array<{ file_id: number; embedding: number[] }> {
    const stmt = this.db.prepare('SELECT file_id, embedding FROM file_embeddings')
    const results = stmt.all() as Array<{ file_id: number; embedding: string }>
    return results.map(r => ({ file_id: r.file_id, embedding: JSON.parse(r.embedding) }))
  }

  // Watched folders
  addWatchedFolder(path: string): void {
    const stmt = this.db.prepare('INSERT OR IGNORE INTO watched_folders (path) VALUES (?)')
    stmt.run(path)
  }

  getWatchedFolders(): WatchedFolder[] {
    const stmt = this.db.prepare('SELECT * FROM watched_folders WHERE enabled = 1')
    return stmt.all() as WatchedFolder[]
  }

  removeWatchedFolder(path: string): void {
    const stmt = this.db.prepare('DELETE FROM watched_folders WHERE path = ?')
    stmt.run(path)
  }

  // Search helpers
  getAllFiles(): FileRecord[] {
    const stmt = this.db.prepare('SELECT * FROM files ORDER BY modified_at DESC')
    return stmt.all() as FileRecord[]
  }

  getFileWithContent(fileId: number): (FileRecord & { extracted_text?: string; summary?: string }) | undefined {
    const stmt = this.db.prepare(`
      SELECT f.*, fc.extracted_text, fc.summary
      FROM files f
      LEFT JOIN file_contents fc ON f.id = fc.file_id
      WHERE f.id = ?
    `)
    return stmt.get(fileId) as any
  }
}
