import { app, BrowserWindow } from 'electron'
import path from 'path'
import { DatabaseManager } from './database/schema'
import { DatabaseQueries } from './database/queries'
import { FileProcessor } from './services/fileProcessor'
import { AIService } from './services/aiService'
import { SearchEngine } from './services/searchEngine'
import { FileWatcher } from './services/fileWatcher'
import { setupIpcHandlers } from './ipc/handlers'

let mainWindow: BrowserWindow | null = null
let dbManager: DatabaseManager
let dbQueries: DatabaseQueries
let fileWatcher: FileWatcher

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a1a',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function initializeBackend(): void {
  try {
    dbManager = new DatabaseManager()
    const db = dbManager.getDatabase()
    dbQueries = new DatabaseQueries(db)

    const fileProcessor = new FileProcessor()
    const aiService = new AIService()
    const searchEngine = new SearchEngine(dbQueries, aiService)

    fileWatcher = new FileWatcher(dbQueries, fileProcessor, aiService)

    setupIpcHandlers(dbQueries, searchEngine, fileWatcher)

    const watchedFolders = dbQueries.getWatchedFolders()
    for (const folder of watchedFolders) {
      fileWatcher.startWatching(folder.path)
    }

    console.log('Backend initialized successfully')
  } catch (error) {
    console.error('Failed to initialize backend:', error)
    app.quit()
  }
}

app.whenReady().then(() => {
  initializeBackend()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (fileWatcher) {
    fileWatcher.stopAll()
  }
  if (dbManager) {
    dbManager.close()
  }
})
