import { useState, useEffect } from 'preact/hooks'
import { db, type DailyStats } from '../../storage/db'

export function TodayStats() {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const dailyStats = await db.getDailyStats(today)
        if (isMounted) setStats(dailyStats)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadStats()
    return () => { isMounted = false }
  }, [])

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
        Today's Activity
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-2xl font-semibold">
            {stats ? formatDuration(stats.totalTime) : '0m'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{stats?.pageCount ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pages</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{stats?.domainCount ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sites</p>
        </div>
      </div>

      {stats && stats.topDomains.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Top Sites</p>
          <ul className="space-y-1.5">
            {stats.topDomains.slice(0, 3).map((domain) => (
              <li key={domain.domain} className="flex justify-between text-sm">
                <span className="truncate mr-2 text-gray-700 dark:text-gray-300">
                  {domain.domain}
                </span>
                <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatDuration(domain.time)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
