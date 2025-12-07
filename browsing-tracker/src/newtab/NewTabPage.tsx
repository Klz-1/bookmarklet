import { useState, useEffect } from 'preact/hooks'
import { useDarkMode } from '../shared/useDarkMode'
import { GoogleSignIn } from '../auth/GoogleSignIn'
import { SyncSettings } from '../sync/SyncSettings'
import { Clock } from './components/Clock'
import { SearchBar } from './components/SearchBar'
import { QuickLinks } from './components/QuickLinks'
import { TodayStats } from './components/TodayStats'
import { RecentBookmarks } from './components/RecentBookmarks'

export interface WidgetConfig {
  id: string
  visible: boolean
  position: number
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'clock', visible: true, position: 0 },
  { id: 'search', visible: true, position: 1 },
  { id: 'quicklinks', visible: true, position: 2 },
  { id: 'stats', visible: true, position: 3 },
  { id: 'bookmarks', visible: true, position: 4 },
]

export function NewTabPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS)
  const [showSettings, setShowSettings] = useState(false)
  const [showSyncSettings, setShowSyncSettings] = useState(false)

  useDarkMode()

  useEffect(() => {
    loadWidgetConfig()
  }, [])

  async function loadWidgetConfig() {
    const result = await chrome.storage.local.get('widgetConfig')
    if (result.widgetConfig && Array.isArray(result.widgetConfig)) {
      setWidgets(result.widgetConfig as WidgetConfig[])
    }
  }

  async function toggleWidget(id: string) {
    const updated = widgets.map(w =>
      w.id === id ? { ...w, visible: !w.visible } : w
    )
    setWidgets(updated)
    await chrome.storage.local.set({ widgetConfig: updated })
  }

  function isVisible(id: string): boolean {
    return widgets.find(w => w.id === id)?.visible ?? true
  }

  function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Top Bar */}
        <div className="absolute top-4 left-4">
          <GoogleSignIn />
        </div>

        {/* Settings Toggle */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setShowSyncSettings(true)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Sync Settings"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
          <button
            onClick={openDashboard}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Open Dashboard"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Widget Settings"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Widget Settings Panel */}
        {showSettings && (
          <div className="absolute top-14 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 min-w-48">
            <h3 className="font-medium mb-3 text-sm">Show Widgets</h3>
            <div className="space-y-2">
              {widgets.map(widget => (
                <label key={widget.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widget.visible}
                    onChange={() => toggleWidget(widget.id)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="capitalize">{widget.id}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col items-center gap-8 pt-12">
          {/* Clock & Greeting */}
          {isVisible('clock') && <Clock />}

          {/* Search Bar */}
          {isVisible('search') && <SearchBar />}

          {/* Quick Links */}
          {isVisible('quicklinks') && <QuickLinks />}

          {/* Stats & Bookmarks Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {isVisible('stats') && <TodayStats />}
            {isVisible('bookmarks') && <RecentBookmarks />}
          </div>
        </div>

        {/* Sync Settings Modal */}
        {showSyncSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <SyncSettings onClose={() => setShowSyncSettings(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
