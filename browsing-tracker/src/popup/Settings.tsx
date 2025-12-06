import { useState, useEffect } from 'preact/hooks'
import type { Settings as SettingsType } from '../shared/types'
import { DEFAULT_SETTINGS } from '../shared/types'
import { useDarkMode, type DarkModePreference } from '../shared/useDarkMode'

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
  const [newDomain, setNewDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const { preference, setDarkMode } = useDarkMode()

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const result = await chrome.storage.local.get([
      'isTracking',
      'excludedDomains',
      'retentionDays',
      'darkMode',
    ])
    setSettings({
      isTracking: result.isTracking !== false,
      excludedDomains: (result.excludedDomains as string[]) || [],
      retentionDays: (result.retentionDays as number) || 90,
      darkMode: (result.darkMode as DarkModePreference) || 'system',
    })
  }

  async function saveSettings(updates: Partial<SettingsType>) {
    setSaving(true)
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    await chrome.storage.local.set({
      excludedDomains: newSettings.excludedDomains,
      retentionDays: newSettings.retentionDays,
    })
    setSaving(false)
  }

  function addDomain() {
    const domain = newDomain.trim().toLowerCase()
    if (!domain) return
    if (settings.excludedDomains.includes(domain)) {
      setNewDomain('')
      return
    }
    saveSettings({
      excludedDomains: [...settings.excludedDomains, domain],
    })
    setNewDomain('')
  }

  function removeDomain(domain: string) {
    saveSettings({
      excludedDomains: settings.excludedDomains.filter((d) => d !== domain),
    })
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDomain()
    }
  }

  return (
    <div className="w-80 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Settings</h1>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Close settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Dark Mode */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Appearance
        </label>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg" role="radiogroup" aria-label="Theme selection">
          {(['system', 'light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDarkMode(mode)}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                preference === mode
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              role="radio"
              aria-checked={preference === mode}
            >
              {mode === 'system' ? 'Auto' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Excluded Domains */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Excluded Domains
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Sites that won't be tracked (e.g., banking, health sites)
        </p>

        {/* Add domain input */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            placeholder="example.com"
            aria-label="Domain to exclude"
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addDomain}
            disabled={!newDomain.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {/* Domain list */}
        {settings.excludedDomains.length > 0 ? (
          <ul className="space-y-1 max-h-32 overflow-y-auto" aria-label="Excluded domains list">
            {settings.excludedDomains.map((domain) => (
              <li
                key={domain}
                className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded text-sm"
              >
                <span className="truncate">{domain}</span>
                <button
                  onClick={() => removeDomain(domain)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${domain} from excluded list`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">No excluded domains</p>
        )}
      </div>

      {/* Data Retention */}
      <div className="mb-4">
        <label htmlFor="retention-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data Retention
        </label>
        <select
          id="retention-select"
          value={settings.retentionDays}
          onChange={(e) => saveSettings({ retentionDays: parseInt((e.target as HTMLSelectElement).value) })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
          <option value={180}>6 months</option>
          <option value={365}>1 year</option>
        </select>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</p>
        <button
          onClick={async () => {
            if (confirm('Are you sure you want to delete all browsing data? This cannot be undone.')) {
              const { db } = await import('../storage/db')
              await db.clearAllData()
              onClose()
            }
          }}
          className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Delete All Data
        </button>
      </div>

      {/* Saving indicator */}
      {saving && (
        <p className="mt-2 text-xs text-gray-400 text-center" role="status" aria-live="polite">Saving...</p>
      )}
    </div>
  )
}
