import type { SearchResult } from '../../preload'

interface ResultsListProps {
  results: SearchResult[]
  selectedFile: SearchResult | null
  onSelect: (result: SearchResult) => void
}

function ResultsList({ results, selectedFile, onSelect }: ResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="results-list empty">
        <p>No results yet. Try searching for something!</p>
      </div>
    )
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`
  }

  return (
    <div className="results-list">
      <div className="results-header">
        <h2>{results.length} results</h2>
      </div>
      <div className="results-items">
        {results.map((result) => (
          <div
            key={result.fileId}
            className={`result-item ${selectedFile?.fileId === result.fileId ? 'selected' : ''}`}
            onClick={() => onSelect(result)}
          >
            <div className="result-header">
              <span className="result-filename">{result.filename}</span>
              <span className="result-score">{formatScore(result.score)}</span>
            </div>
            {result.summary && (
              <p className="result-summary">{result.summary}</p>
            )}
            <div className="result-footer">
              <span className="result-path">{result.path}</span>
              <span className="result-date">{formatDate(result.modifiedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultsList
