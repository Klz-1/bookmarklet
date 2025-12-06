import { useState, useEffect } from 'preact/hooks'
import { db, type PageVisit, type DailyStats } from '../storage/db'

export function Dashboard() {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [recentVisits, setRecentVisits] = useState<PageVisit[]>([])
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today')
  const [loading, setLoading] = useState(true)

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

      // Load recent visits
      const visits = await db.getRecentVisits(50)
      setRecentVisits(visits)
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
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `browsing-history-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
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
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Export Data
            </button>
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

        {/* Top Domains */}
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
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatDuration(domain.time)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
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
          <h2 className="text-lg font-semibold mb-4">Recent History</h2>
          {recentVisits.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No browsing history yet</p>
          ) : (
            <div className="space-y-2">
              {recentVisits.map((visit) => (
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
                  <div className="ml-4 text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDuration(visit.duration)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(visit.visitedAt)}
                    </p>
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
