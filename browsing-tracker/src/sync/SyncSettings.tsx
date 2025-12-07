import { useState, useEffect } from 'preact/hooks'
import { useAuth } from '../auth/AuthContext'
import { GoogleSignIn } from '../auth/GoogleSignIn'
import {
  getSyncConfig,
  saveSyncConfig,
  getSyncStatus,
  syncToOneSpace,
  testOneboxConnection,
} from './syncService'
import { type SyncConfig, DEFAULT_SYNC_CONFIG } from '../shared/types'

interface SyncSettingsProps {
  onClose?: () => void
}

export function SyncSettings({ onClose }: SyncSettingsProps) {
  const { isAuthenticated } = useAuth()
  const [config, setConfig] = useState<SyncConfig>(DEFAULT_SYNC_CONFIG)
  const [status, setStatus] = useState({
    pendingCount: 0,
    lastSyncAt: null as string | null,
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadConfig()
    loadStatus()
  }, [])

  async function loadConfig() {
    const cfg = await getSyncConfig()
    setConfig(cfg)
  }

  async function loadStatus() {
    const s = await getSyncStatus()
    setStatus({
      pendingCount: s.pendingCount,
      lastSyncAt: s.lastSyncAt,
    })
  }

  async function handleToggleSync(enabled: boolean) {
    const updated = { ...config, enabled }
    setConfig(updated)
    await saveSyncConfig({ enabled })
    setMessage({ type: 'success', text: enabled ? 'Sync enabled' : 'Sync disabled' })
  }

  async function handleToggleTwitter(autoSyncTwitter: boolean) {
    const updated = { ...config, autoSyncTwitter }
    setConfig(updated)
    await saveSyncConfig({ autoSyncTwitter })
  }

  async function handleToggleVisits(autoSyncVisits: boolean) {
    const updated = { ...config, autoSyncVisits }
    setConfig(updated)
    await saveSyncConfig({ autoSyncVisits })
  }

  async function handleIntervalChange(minutes: number) {
    const updated = { ...config, syncIntervalMinutes: minutes }
    setConfig(updated)
    await saveSyncConfig({ syncIntervalMinutes: minutes })
  }

  async function handleUrlChange(url: string) {
    const updated = { ...config, oneSpaceUrl: url }
    setConfig(updated)
    await saveSyncConfig({ oneSpaceUrl: url })
  }

  async function handleSyncNow() {
    setIsSyncing(true)
    setMessage(null)

    try {
      const result = await syncToOneSpace()
      if (result.success) {
        setMessage({ type: 'success', text: `Synced ${result.synced} items` })
      } else {
        setMessage({ type: 'error', text: result.errors.join(', ') })
      }
      await loadStatus()
    } catch (error) {
      setMessage({ type: 'error', text: String(error) })
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleTestConnection() {
    setIsTesting(true)
    setMessage(null)

    try {
      const result = await testOneboxConnection()
      setMessage({ type: result.success ? 'success' : 'error', text: result.message })
    } catch (error) {
      setMessage({ type: 'error', text: String(error) })
    } finally {
      setIsTesting(false)
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Onebox Sync
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Auth Section */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            Sign in with Google to enable sync
          </p>
          <GoogleSignIn compact />
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Enable Sync Toggle */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">Enable Sync</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sync data to Onebox cloud
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleToggleSync((e.target as HTMLInputElement).checked)}
            disabled={!isAuthenticated}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
        </label>
      </div>

      {/* Sync Options */}
      {config.enabled && (
        <>
          <div className="py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">What to sync</p>

            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSyncTwitter}
                onChange={(e) => handleToggleTwitter((e.target as HTMLInputElement).checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Twitter Bookmarks</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSyncVisits}
                onChange={(e) => handleToggleVisits((e.target as HTMLInputElement).checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Browsing History</span>
            </label>
          </div>

          {/* Sync Interval */}
          <div className="py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Sync Interval</p>
            <select
              value={config.syncIntervalMinutes}
              onChange={(e) => handleIntervalChange(Number((e.target as HTMLSelectElement).value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value={5}>Every 5 minutes</option>
              <option value={10}>Every 10 minutes</option>
              <option value={15}>Every 15 minutes</option>
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every hour</option>
            </select>
          </div>

          {/* Onebox URL */}
          <div className="py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Onebox URL</p>
            <input
              type="url"
              value={config.oneSpaceUrl}
              onChange={(e) => handleUrlChange((e.target as HTMLInputElement).value)}
              placeholder="https://onebox-yshprffwnq-el.a.run.app"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            />
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test connection'}
            </button>
          </div>
        </>
      )}

      {/* Status */}
      <div className="py-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 dark:text-gray-400">Last sync:</span>
          <span className="text-gray-700 dark:text-gray-300">{formatDate(status.lastSyncAt)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Pending items:</span>
          <span className="text-gray-700 dark:text-gray-300">{status.pendingCount}</span>
        </div>
      </div>

      {/* Actions */}
      {config.enabled && (
        <button
          onClick={handleSyncNow}
          disabled={isSyncing || status.pendingCount === 0}
          className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {isSyncing ? 'Syncing...' : `Sync Now (${status.pendingCount} pending)`}
        </button>
      )}
    </div>
  )
}
