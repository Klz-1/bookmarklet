import { useState, useEffect } from 'preact/hooks'
import { db, type TwitterBookmark } from '../../storage/db'

export function RecentBookmarks() {
  const [bookmarks, setBookmarks] = useState<TwitterBookmark[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookmarks()
  }, [])

  async function loadBookmarks() {
    try {
      const recent = await db.getTwitterBookmarks(5)
      setBookmarks(recent)
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    } finally {
      setLoading(false)
    }
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

  function openTwitterBookmarks() {
    chrome.tabs.create({ url: 'https://twitter.com/i/bookmarks' })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Twitter Bookmarks
        </h2>
        <button
          onClick={openTwitterBookmarks}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sync more
        </button>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No bookmarks synced yet
          </p>
          <button
            onClick={openTwitterBookmarks}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Open Twitter Bookmarks to sync
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.tweetId}>
              <a
                href={bookmark.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start gap-2">
                  <img
                    src={bookmark.authorAvatar}
                    alt=""
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                      {truncate(bookmark.content, 100)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      @{bookmark.authorHandle} · {formatDate(bookmark.scrapedAt)}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
