import { useState, useEffect } from 'preact/hooks'
import { db, type DailyStats } from '../storage/db'

export function Popup() {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [isTracking, setIsTracking] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodayStats()
    loadTrackingState()
  }, [])

  async function loadTodayStats() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const dailyStats = await db.getDailyStats(today)
      setStats(dailyStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTrackingState() {
    const result = await chrome.storage.local.get('isTracking')
    setIsTracking(result.isTracking !== false)
  }

  async function toggleTracking() {
    const newState = !isTracking
    setIsTracking(newState)
    await chrome.storage.local.set({ isTracking: newState })

    // Notify background script
    chrome.runtime.sendMessage({ type: 'TRACKING_STATE_CHANGED', isTracking: newState })
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') })
  }

  if (loading) {
    return (
      <div className="w-80 p-4 bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="w-80 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Browsing Tracker</h1>
        <button
          onClick={toggleTracking}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            isTracking
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
          aria-label={isTracking ? 'Pause tracking' : 'Resume tracking'}
        >
          {isTracking ? 'Tracking' : 'Paused'}
        </button>
      </div>

      {/* Today's Stats */}
      <div className="space-y-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Time Today</p>
          <p className="text-2xl font-bold">
            {stats ? formatDuration(stats.totalTime) : '0m'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pages</p>
            <p className="text-xl font-semibold">{stats?.pageCount ?? 0}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Domains</p>
            <p className="text-xl font-semibold">{stats?.domainCount ?? 0}</p>
          </div>
        </div>

        {stats && stats.topDomains.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Sites</p>
            <ul className="space-y-1">
              {stats.topDomains.slice(0, 3).map((domain) => (
                <li key={domain.domain} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{domain.domain}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDuration(domain.time)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <button
        onClick={openDashboard}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        View Full Dashboard
      </button>
    </div>
  )
}
