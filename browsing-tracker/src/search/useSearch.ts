import { useState, useCallback } from 'preact/hooks'
import { search, type SearchableItem } from './searchIndex'

interface UseSearchResult {
  query: string
  setQuery: (query: string) => void
  results: SearchableItem[]
  isSearching: boolean
  error: string | null
  performSearch: (query: string) => Promise<void>
  clearSearch: () => void
}

export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchableItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const searchResults = await search(searchQuery)
      setResults(searchResults)
    } catch (err) {
      console.error('[Search] Error:', err)
      setError('Search failed')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    performSearch,
    clearSearch,
  }
}
