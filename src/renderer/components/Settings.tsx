import { useState, useEffect } from 'react'
import type { WatchedFolder } from '../../preload'

interface SettingsProps {
  onUpdate: () => void
}

function Settings({ onUpdate }: SettingsProps) {
  const [folders, setFolders] = useState<WatchedFolder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    setIsLoading(true)
    const response = await window.api.folders.list()
    if (response.success && response.data) {
      setFolders(response.data)
    }
    setIsLoading(false)
  }

  const handleAddFolder = async () => {
    const response = await window.api.folders.add()
    if (response.success) {
      await loadFolders()
      onUpdate()
    }
  }

  const handleRemoveFolder = async (path: string) => {
    if (confirm(`Stop watching "${path}"?`)) {
      const response = await window.api.folders.remove(path)
      if (response.success) {
        await loadFolders()
        onUpdate()
      }
    }
  }

  return (
    <div className="settings">
      <div className="settings-section">
        <h2>Watched Folders</h2>
        <p className="settings-description">
          Select folders to monitor for file changes. Files in these folders will be
          automatically indexed and made searchable.
        </p>

        <button className="add-folder-button" onClick={handleAddFolder}>
          Add Folder
        </button>

        {isLoading ? (
          <p>Loading...</p>
        ) : folders.length === 0 ? (
          <p className="empty-state">
            No folders are being watched. Click "Add Folder" to get started.
          </p>
        ) : (
          <div className="folders-list">
            {folders.map((folder) => (
              <div key={folder.id} className="folder-item">
                <span className="folder-path">{folder.path}</span>
                <button
                  className="remove-button"
                  onClick={() => handleRemoveFolder(folder.path)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <p>Where Did I Put That? v1.0.0</p>
        <p>Local-first semantic file memory engine</p>
        <p>Powered by GLM-4.6</p>
      </div>
    </div>
  )
}

export default Settings
