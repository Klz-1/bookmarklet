import { useState, useEffect } from 'preact/hooks'
import { db, type PageVisit, type DailyStats, type TwitterBookmark } from '../storage/db'
import { DomainChart } from './charts/DomainChart'
import { ActivityHeatmap } from './charts/ActivityHeatmap'
import { useDarkMode } from '../shared/useDarkMode'

export function Dashboard() {
  // Initialize dark mode
  useDarkMode()
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [recentVisits, setRecentVisits] = useState<PageVisit[]>([])
  const [allVisits, setAllVisits] = useState<PageVisit[]>([])
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [historyFilter, setHistoryFilter] = useState<'all' | 'bookmarked'>('all')
  const [twitterBookmarks, setTwitterBookmarks] = useState<TwitterBookmark[]>([])
  const [twitterSearch, setTwitterSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [dateRange])

  async function loadData() {
    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange(dateRange)

      // Load stats
      const dailyStats = await db.getStatsForRange(startDate, endDate)
      setStats(dailyStats)

      // Load visits for the date range (for heatmap)
      const visits = await db.getVisitsForRange(startDate, endDate)
      setAllVisits(visits)

      // Load recent visits
      const recent = await db.getRecentVisits(50)
      setRecentVisits(recent)

      // Load Twitter bookmarks (no limit)
      const tweets = await db.getTwitterBookmarks()
      setTwitterBookmarks(tweets)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDateRange(range: 'today' | 'week' | 'month') {
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]

    let startDate: string
    if (range === 'today') {
      startDate = endDate
    } else if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      startDate = weekAgo.toISOString().split('T')[0]
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      startDate = monthAgo.toISOString().split('T')[0]
    }

    return { startDate, endDate }
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  async function handleExport() {
    try {
      const data = await db.exportData()

      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        downloadBlob(blob, `browsing-history-${new Date().toISOString().split('T')[0]}.json`)
      } else {
        // CSV export
        const headers = ['URL', 'Title', 'Domain', 'Duration (s)', 'Visited At', 'Bookmarked']
        const rows = data.visits.map((v) => [
          v.url,
          v.title.replace(/"/g, '""'),
          v.domain,
          v.duration,
          new Date(v.visitedAt).toISOString(),
          v.isBookmarked ? 'Yes' : 'No',
        ])

        const csv = [
          headers.join(','),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        downloadBlob(blob, `browsing-history-${new Date().toISOString().split('T')[0]}.csv`)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Browsing Tracker</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <svg
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat((e.target as HTMLSelectElement).value as 'json' | 'csv')}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Date Range Selector */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1" role="group">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-pressed={dateRange === range}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Time</p>
            <p className="text-3xl font-bold mt-1">
              {stats ? formatDuration(stats.totalTime) : '0m'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pages Visited</p>
            <p className="text-3xl font-bold mt-1">{stats?.pageCount ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Unique Domains</p>
            <p className="text-3xl font-bold mt-1">{stats?.domainCount ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bookmarks Added</p>
            <p className="text-3xl font-bold mt-1">{stats?.bookmarkCount ?? 0}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Domain Doughnut Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Time by Domain</h2>
            <DomainChart
              data={stats?.topDomains ?? []}
              formatDuration={formatDuration}
            />
          </div>

          {/* Activity Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Activity Patterns</h2>
            <ActivityHeatmap
              visits={allVisits}
              formatDuration={formatDuration}
            />
          </div>
        </div>

        {/* Top Domains List */}
        {stats && stats.topDomains.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Top Sites by Time</h2>
            <div className="space-y-3">
              {stats.topDomains.map((domain, index) => (
                <div key={domain.domain} className="flex items-center">
                  <span className="w-6 text-gray-400 text-sm">{index + 1}</span>
                  <div className="flex-1 ml-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{domain.domain}</span>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{domain.visits} visits</span>
                        <span>{formatDuration(domain.time)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${(domain.time / stats.topDomains[0].time) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent History</h2>
            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1" role="group">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  historyFilter === 'all'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setHistoryFilter('bookmarked')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                  historyFilter === 'bookmarked'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Bookmarked
              </button>
            </div>
          </div>
          {recentVisits.filter(v => historyFilter === 'all' || v.isBookmarked).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No browsing history yet</p>
          ) : (
            <div className="space-y-2">
              {recentVisits.filter(v => historyFilter === 'all' || v.isBookmarked).map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <img
                    src={visit.favicon || `https://www.google.com/s2/favicons?domain=${visit.domain}`}
                    alt=""
                    className="w-4 h-4 mr-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{visit.title || visit.url}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {visit.domain}
                    </p>
                  </div>
                  <div className="ml-4 text-right flex items-center gap-2">
                    {visit.isBookmarked && (
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(visit.duration)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(visit.visitedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Twitter Bookmarks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <h2 className="text-lg font-semibold">Twitter Bookmarks</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({twitterBookmarks.length} saved)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={twitterSearch}
                onChange={(e) => setTwitterSearch((e.target as HTMLInputElement).value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 w-48"
              />
              <a
                href="https://twitter.com/i/bookmarks"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Sync Bookmarks
              </a>
            </div>
          </div>

          {twitterBookmarks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-2">No Twitter bookmarks captured yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Visit{' '}
                <a
                  href="https://twitter.com/i/bookmarks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  twitter.com/i/bookmarks
                </a>
                {' '}and scroll to capture your bookmarks
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {twitterBookmarks
                .filter(
                  (t) =>
                    !twitterSearch ||
                    t.content.toLowerCase().includes(twitterSearch.toLowerCase()) ||
                    t.authorHandle.toLowerCase().includes(twitterSearch.toLowerCase()) ||
                    t.authorName.toLowerCase().includes(twitterSearch.toLowerCase())
                )
                .map((tweet) => (
                  <div
                    key={tweet.id}
                    className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={tweet.authorAvatar || `https://unavatar.io/twitter/${tweet.authorHandle}`}
                        alt=""
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${tweet.authorName}&background=1d9bf0&color=fff`
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{tweet.authorName}</span>
                          <span className="text-gray-500 dark:text-gray-400">@{tweet.authorHandle}</span>
                        </div>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{tweet.content}</p>
                        {tweet.mediaUrls.length > 0 && (
                          <div className="mt-2 flex gap-2 overflow-x-auto">
                            {tweet.mediaUrls.slice(0, 4).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt=""
                                className="h-32 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {tweet.replies && <span>{tweet.replies} replies</span>}
                          {tweet.retweets && <span>{tweet.retweets} retweets</span>}
                          {tweet.likes && <span>{tweet.likes} likes</span>}
                          <a
                            href={tweet.tweetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline ml-auto"
                          >
                            View on Twitter
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
