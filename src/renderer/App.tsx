import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import ResultsList from './components/ResultsList'
import FilePreview from './components/FilePreview'
import Settings from './components/Settings'
import type { SearchResult } from '../preload'

function App() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedFile, setSelectedFile] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [stats, setStats] = useState({ totalFiles: 0, watchedFolders: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const response = await window.api.stats.get()
    if (response.success && response.data) {
      setStats(response.data)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setSelectedFile(null)
      return
    }

    setIsSearching(true)
    const response = await window.api.search.query(query)
    setIsSearching(false)

    if (response.success && response.data) {
      setResults(response.data)
      if (response.data.length > 0) {
        setSelectedFile(response.data[0])
      } else {
        setSelectedFile(null)
      }
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    setSelectedFile(result)
  }

  const handleOpenFile = async (path: string) => {
    await window.api.file.open(path)
  }

  const handleRevealFile = async (path: string) => {
    await window.api.file.reveal(path)
  }

  const handleSettingsUpdate = () => {
    loadStats()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Where Did I Put That?</h1>
        <div className="app-stats">
          <span>{stats.totalFiles} files indexed</span>
          <span>{stats.watchedFolders} folders watched</span>
          <button
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? 'Close Settings' : 'Settings'}
          </button>
        </div>
      </header>

      {showSettings ? (
        <Settings onUpdate={handleSettingsUpdate} />
      ) : (
        <div className="main-content">
          <SearchBar onSearch={handleSearch} isSearching={isSearching} />

          <div className="content-grid">
            <ResultsList
              results={results}
              selectedFile={selectedFile}
              onSelect={handleSelectResult}
            />

            {selectedFile && (
              <FilePreview
                file={selectedFile}
                onOpen={handleOpenFile}
                onReveal={handleRevealFile}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
