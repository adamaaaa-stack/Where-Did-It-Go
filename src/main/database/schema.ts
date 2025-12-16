import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

export interface FileRecord {
  id: number
  path: string
  filename: string
  extension: string
  size: number
  created_at: number
  modified_at: number
  indexed_at: number
  content_hash: string
}

export interface FileContent {
  id: number
  file_id: number
  extracted_text: string
  summary: string | null
}

export interface FileEmbedding {
  id: number
  file_id: number
  embedding: string // JSON array stored as string
}

export interface WatchedFolder {
  id: number
  path: string
  enabled: boolean
}

export class DatabaseManager {
  private db: Database.Database

  constructor() {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'file-memory.db')

    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.initializeSchema()
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE,
        filename TEXT NOT NULL,
        extension TEXT,
        size INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        modified_at INTEGER NOT NULL,
        indexed_at INTEGER NOT NULL,
        content_hash TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
      CREATE INDEX IF NOT EXISTS idx_files_modified ON files(modified_at);
      CREATE INDEX IF NOT EXISTS idx_files_extension ON files(extension);

      CREATE TABLE IF NOT EXISTS file_contents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER NOT NULL UNIQUE,
        extracted_text TEXT,
        summary TEXT,
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS file_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER NOT NULL UNIQUE,
        embedding TEXT NOT NULL,
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS watched_folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE,
        enabled INTEGER DEFAULT 1
      );
    `)
  }

  getDatabase(): Database.Database {
    return this.db
  }

  close(): void {
    this.db.close()
  }
}
