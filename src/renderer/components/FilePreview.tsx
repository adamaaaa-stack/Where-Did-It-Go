import type { SearchResult } from '../../preload'

interface FilePreviewProps {
  file: SearchResult
  onOpen: (path: string) => void
  onReveal: (path: string) => void
}

function FilePreview({ file, onOpen, onReveal }: FilePreviewProps) {
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const copyPath = () => {
    navigator.clipboard.writeText(file.path)
  }

  return (
    <div className="file-preview">
      <div className="preview-header">
        <h3>{file.filename}</h3>
      </div>

      <div className="preview-actions">
        <button onClick={() => onOpen(file.path)}>Open File</button>
        <button onClick={() => onReveal(file.path)}>Reveal in Folder</button>
        <button onClick={copyPath}>Copy Path</button>
      </div>

      <div className="preview-info">
        <div className="info-row">
          <span className="info-label">Path:</span>
          <span className="info-value">{file.path}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Modified:</span>
          <span className="info-value">
            {new Date(file.modifiedAt).toLocaleString()}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Match Score:</span>
          <span className="info-value">{Math.round(file.score * 100)}%</span>
        </div>
      </div>

      {file.summary && (
        <div className="preview-section">
          <h4>Summary</h4>
          <p>{file.summary}</p>
        </div>
      )}

      {file.extractedText && (
        <div className="preview-section">
          <h4>Content Preview</h4>
          <pre className="content-preview">
            {truncateText(file.extractedText, 2000)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default FilePreview
