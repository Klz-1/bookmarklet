import { useState, useEffect } from 'preact/hooks'
import { db, type PageVisit, type DailyStats } from '../storage/db'
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
      </main>
    </div>
  )
}
