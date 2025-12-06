import { useState, useEffect } from 'preact/hooks'
import { db, type DailyStats } from '../storage/db'
import { Settings } from './Settings'
import { Onboarding } from './Onboarding'
import { useDarkMode } from '../shared/useDarkMode'

export function Popup() {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [isTracking, setIsTracking] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Initialize dark mode
  useDarkMode()

  useEffect(() => {
    checkOnboarding()
    loadTodayStats()
    loadTrackingState()
  }, [])

  async function checkOnboarding() {
    const result = await chrome.storage.local.get('onboardingComplete')
    if (!result.onboardingComplete) {
      setShowOnboarding(true)
    }
  }

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

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  if (showSettings) {
    return <Settings onClose={() => setShowSettings(false)} />
  }

  if (loading) {
    return (
      <div className="w-80 p-4 bg-white dark:bg-gray-900" role="status" aria-label="Loading">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="w-80 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" role="main">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Browsing Tracker</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open settings"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={toggleTracking}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              isTracking
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
            aria-label={isTracking ? 'Click to pause tracking' : 'Click to resume tracking'}
            aria-pressed={isTracking}
          >
            {isTracking ? 'Tracking' : 'Paused'}
          </button>
        </div>
      </header>

      {/* Today's Stats */}
      <section aria-label="Today's statistics" className="space-y-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-500 dark:text-gray-400" id="time-label">Time Today</p>
          <p className="text-2xl font-bold" aria-labelledby="time-label">
            {stats ? formatDuration(stats.totalTime) : '0m'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400" id="pages-label">Pages</p>
            <p className="text-xl font-semibold" aria-labelledby="pages-label">{stats?.pageCount ?? 0}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400" id="domains-label">Domains</p>
            <p className="text-xl font-semibold" aria-labelledby="domains-label">{stats?.domainCount ?? 0}</p>
          </div>
        </div>

        {stats && stats.topDomains.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Top Sites</p>
            <ul className="space-y-1" aria-label="Top sites by time spent">
              {stats.topDomains.slice(0, 3).map((domain) => (
                <li key={domain.domain} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{domain.domain}</span>
                  <span className="text-gray-500 dark:text-gray-400" aria-label={`${formatDuration(domain.time)} spent`}>
                    {formatDuration(domain.time)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

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
