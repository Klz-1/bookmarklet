import { useState, useEffect, useRef } from 'preact/hooks'
import { useSearch } from '../../search/useSearch'
import { SearchResults } from '../../search/SearchResults'

export function SearchBar() {
  const { query, setQuery, results, isSearching, performSearch, clearSearch } = useSearch()
  const [showResults, setShowResults] = useState(false)
  const [searchMode, setSearchMode] = useState<'local' | 'web'>('local')
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.trim() && searchMode === 'local') {
      debounceRef.current = window.setTimeout(() => {
        performSearch(query)
        setShowResults(true)
      }, 300)
    } else {
      setShowResults(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, searchMode, performSearch])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit(e: Event) {
    e.preventDefault()
    if (query.trim()) {
      if (searchMode === 'web') {
        // Web search via Google
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`
      } else if (results.length > 0) {
        // Open first local result
        window.open(results[0].url, '_blank')
        handleClose()
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setShowResults(false)
      clearSearch()
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Toggle search mode on Tab
      e.preventDefault()
      setSearchMode(prev => prev === 'local' ? 'web' : 'local')
    }
  }

  function handleClose() {
    setShowResults(false)
    clearSearch()
  }

  return (
    <div ref={containerRef} className="w-full max-w-xl relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && searchMode === 'local' && setShowResults(true)}
            placeholder={searchMode === 'local' ? 'Search your history & bookmarks...' : 'Search the web...'}
            className="w-full px-5 py-3 pl-12 pr-24 text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Mode Toggle */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchMode('local')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                searchMode === 'local'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Search your history (Tab to switch)"
            >
              Local
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('web')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                searchMode === 'web'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Search the web (Tab to switch)"
            >
              Web
            </button>
          </div>
        </div>
      </form>

      {/* Search Results */}
      {showResults && searchMode === 'local' && (
        <SearchResults
          results={results}
          isSearching={isSearching}
          query={query}
          onClose={handleClose}
        />
      )}

      {/* Hint */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
        Press Tab to switch modes · Enter to search
      </p>
    </div>
  )
}
