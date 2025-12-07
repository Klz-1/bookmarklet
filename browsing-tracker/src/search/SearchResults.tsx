import type { SearchableItem } from './searchIndex'

interface SearchResultsProps {
  results: SearchableItem[]
  isSearching: boolean
  query: string
  onClose: () => void
}

export function SearchResults({ results, isSearching, query, onClose }: SearchResultsProps) {
  if (!query.trim()) {
    return null
  }

  function formatDate(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + '...' : text
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
      {isSearching ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
          Searching...
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No results for "{query}"
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {results.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Icon/Avatar */}
                <div className="flex-shrink-0 w-8 h-8 mt-0.5">
                  {item.type === 'bookmark' && item.authorAvatar ? (
                    <img
                      src={item.authorAvatar}
                      alt=""
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : item.favicon ? (
                    <img
                      src={item.favicon}
                      alt=""
                      className="w-5 h-5 mt-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.domain.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.type === 'bookmark' ? (
                      <>
                        <span className="text-blue-500">@{item.authorHandle}</span>
                        {' · '}
                        {truncate(item.content || '', 60)}
                      </>
                    ) : (
                      truncate(item.title, 60)
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {item.domain}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex-shrink-0 text-right">
                  <span className={`inline-block px-1.5 py-0.5 text-xs rounded ${
                    item.type === 'bookmark'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {item.type === 'bookmark' ? 'Tweet' : 'Page'}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      {results.length > 0 && (
        <div className="p-2 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''} · Press Esc to close
          </p>
        </div>
      )}
    </div>
  )
}
