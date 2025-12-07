import { useState } from 'preact/hooks'
import { useAuth } from '../../auth/AuthContext'
import { DEFAULT_SYNC_CONFIG } from '../../shared/types'

export function OneboxWidget() {
  const { isAuthenticated } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const oneboxUrl = DEFAULT_SYNC_CONFIG.oneSpaceUrl

  function openOnebox() {
    window.open(oneboxUrl, '_blank')
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Onebox
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in with Google to access your synced bookmarks
        </p>
      </div>
    )
  }

  if (isExpanded) {
    return (
      <div className="fixed inset-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">Onebox</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={openOnebox}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Minimize"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        <iframe
          src={oneboxUrl}
          className="flex-1 w-full border-0 rounded-b-2xl"
          title="Onebox"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Onebox
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Expand"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            onClick={openOnebox}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>
      <iframe
        src={oneboxUrl}
        className="w-full h-80 border-0"
        title="Onebox"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  )
}
