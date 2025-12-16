import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
}

function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(handler)
  }, [query, onSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('')
    }
  }

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Search for files... (e.g., 'recipe for pasta', 'tax documents 2024')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {isSearching && <div className="search-spinner">Searching...</div>}
    </div>
  )
}

export default SearchBar
