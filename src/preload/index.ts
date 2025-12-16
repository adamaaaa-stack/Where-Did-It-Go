import { contextBridge, ipcRenderer } from 'electron'

export interface SearchResult {
  fileId: number
  path: string
  filename: string
  score: number
  summary: string | null
  extractedText: string
  modifiedAt: number
}

export interface WatchedFolder {
  id: number
  path: string
  enabled: boolean
}

export interface Stats {
  totalFiles: number
  watchedFolders: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const api = {
  search: {
    query: (query: string): Promise<ApiResponse<SearchResult[]>> =>
      ipcRenderer.invoke('search:query', query)
  },
  folders: {
    add: (): Promise<ApiResponse<string>> =>
      ipcRenderer.invoke('folders:add'),
    list: (): Promise<ApiResponse<WatchedFolder[]>> =>
      ipcRenderer.invoke('folders:list'),
    remove: (path: string): Promise<ApiResponse<void>> =>
      ipcRenderer.invoke('folders:remove', path)
  },
  file: {
    open: (path: string): Promise<ApiResponse<void>> =>
      ipcRenderer.invoke('file:open', path),
    reveal: (path: string): Promise<ApiResponse<void>> =>
      ipcRenderer.invoke('file:reveal', path)
  },
  stats: {
    get: (): Promise<ApiResponse<Stats>> =>
      ipcRenderer.invoke('stats:get')
  }
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: typeof api
  }
}
