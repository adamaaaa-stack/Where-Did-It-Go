import { ipcMain, dialog, shell } from 'electron'
import { DatabaseQueries } from '../database/queries'
import { SearchEngine } from '../services/searchEngine'
import { FileWatcher } from '../services/fileWatcher'

export function setupIpcHandlers(
  dbQueries: DatabaseQueries,
  searchEngine: SearchEngine,
  fileWatcher: FileWatcher
): void {
  ipcMain.handle('search:query', async (_, query: string) => {
    try {
      const results = await searchEngine.search(query)
      return { success: true, data: results }
    } catch (error) {
      console.error('Search query error:', error)
      return { success: false, error: 'Search failed' }
    }
  })

  ipcMain.handle('folders:add', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select folder to watch'
      })

      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0]
        dbQueries.addWatchedFolder(folderPath)
        fileWatcher.startWatching(folderPath)
        return { success: true, data: folderPath }
      }

      return { success: false, error: 'No folder selected' }
    } catch (error) {
      console.error('Add folder error:', error)
      return { success: false, error: 'Failed to add folder' }
    }
  })

  ipcMain.handle('folders:list', async () => {
    try {
      const folders = dbQueries.getWatchedFolders()
      return { success: true, data: folders }
    } catch (error) {
      console.error('List folders error:', error)
      return { success: false, error: 'Failed to list folders' }
    }
  })

  ipcMain.handle('folders:remove', async (_, folderPath: string) => {
    try {
      fileWatcher.stopWatching(folderPath)
      dbQueries.removeWatchedFolder(folderPath)
      return { success: true }
    } catch (error) {
      console.error('Remove folder error:', error)
      return { success: false, error: 'Failed to remove folder' }
    }
  })

  ipcMain.handle('file:open', async (_, filePath: string) => {
    try {
      await shell.openPath(filePath)
      return { success: true }
    } catch (error) {
      console.error('Open file error:', error)
      return { success: false, error: 'Failed to open file' }
    }
  })

  ipcMain.handle('file:reveal', async (_, filePath: string) => {
    try {
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (error) {
      console.error('Reveal file error:', error)
      return { success: false, error: 'Failed to reveal file' }
    }
  })

  ipcMain.handle('stats:get', async () => {
    try {
      const allFiles = dbQueries.getAllFiles()
      const folders = dbQueries.getWatchedFolders()

      return {
        success: true,
        data: {
          totalFiles: allFiles.length,
          watchedFolders: folders.length
        }
      }
    } catch (error) {
      console.error('Get stats error:', error)
      return { success: false, error: 'Failed to get stats' }
    }
  })
}
