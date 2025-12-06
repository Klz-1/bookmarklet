import { db } from '../storage/db'

// Session state
let currentSessionId = generateSessionId()
let _currentTabId: number | null = null
let currentVisitId: number | null = null
let lastActiveTime: number = Date.now()
let isTracking = true

// Suppress unused variable warning - used for debugging
void _currentTabId

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Initialize the extension
 */
async function initialize() {
  console.log('[BrowsingTracker] Initializing service worker')

  // Load tracking state
  const result = await chrome.storage.local.get('isTracking')
  isTracking = result.isTracking !== false

  // Set up alarm for time tracking (1 minute intervals)
  await chrome.alarms.create('trackTime', { periodInMinutes: 1 })

  // Set up alarm for daily cleanup
  await chrome.alarms.create('dailyCleanup', { periodInMinutes: 60 * 24 })

  // Track the current active tab
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (activeTab?.id && activeTab.url) {
    await handleTabActivated(activeTab.id, activeTab.url, activeTab.title)
  }
}

/**
 * Handle tab activation
 */
async function handleTabActivated(tabId: number, url: string, title?: string) {
  if (!isTracking) return
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return

  // Check if domain is excluded
  const settings = await chrome.storage.local.get('excludedDomains')
  const excludedDomains: string[] = (settings.excludedDomains as string[]) || []
  if (db.isExcludedDomain(url, excludedDomains)) return

  // Update duration of previous visit
  await updateCurrentVisitDuration()

  // Start tracking new page
  _currentTabId = tabId
  lastActiveTime = Date.now()

  try {
    // Get favicon
    let favicon: string | undefined
    try {
      const tab = await chrome.tabs.get(tabId)
      favicon = tab.favIconUrl
    } catch {
      // Tab might have been closed
    }

    currentVisitId = await db.addVisit({
      url,
      title: title || url,
      favicon,
      visitedAt: new Date(),
      duration: 0,
      sessionId: currentSessionId,
      isBookmarked: false,
    })

    console.log(`[BrowsingTracker] Started tracking: ${url}`)
  } catch (error) {
    console.error('[BrowsingTracker] Failed to add visit:', error)
  }
}

/**
 * Update the duration of the current visit
 */
async function updateCurrentVisitDuration() {
  if (!currentVisitId) return

  const now = Date.now()
  const additionalSeconds = Math.floor((now - lastActiveTime) / 1000)

  if (additionalSeconds > 0) {
    try {
      const visit = await db.visits.get(currentVisitId)
      if (visit) {
        await db.updateVisitDuration(currentVisitId, visit.duration + additionalSeconds)
      }
      lastActiveTime = now
    } catch (error) {
      console.error('[BrowsingTracker] Failed to update duration:', error)
    }
  }
}

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId)
    if (tab.url) {
      await handleTabActivated(activeInfo.tabId, tab.url, tab.title)
    }
  } catch (error) {
    console.error('[BrowsingTracker] Error handling tab activation:', error)
  }
})

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && tab.url) {
    await handleTabActivated(tabId, tab.url, tab.title)
  }
})

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus, update duration
    await updateCurrentVisitDuration()
    _currentTabId = null
  } else {
    // Browser gained focus, find active tab
    const [activeTab] = await chrome.tabs.query({ active: true, windowId })
    if (activeTab?.id && activeTab.url) {
      await handleTabActivated(activeTab.id, activeTab.url, activeTab.title)
    }
  }
})

// Listen for bookmark events
chrome.bookmarks.onCreated.addListener(async (_id, bookmark) => {
  if (bookmark.url) {
    await db.markAsBookmarked(bookmark.url)
    console.log(`[BrowsingTracker] Bookmarked: ${bookmark.url}`)
  }
})

// Listen for alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'trackTime') {
    // Update duration every minute
    if (isTracking && currentVisitId) {
      await updateCurrentVisitDuration()
    }
  } else if (alarm.name === 'dailyCleanup') {
    // Clean up old data based on retention settings
    const settings = await chrome.storage.local.get('retentionDays')
    const retentionDays = (settings.retentionDays as number) || 90
    const deletedCount = await db.cleanupOldData(retentionDays)
    if (deletedCount > 0) {
      console.log(`[BrowsingTracker] Cleaned up ${deletedCount} old visits`)
    }
  }
})

// Listen for messages from popup/dashboard
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TRACKING_STATE_CHANGED') {
    isTracking = message.isTracking
    if (!isTracking) {
      // Save current visit duration when pausing
      updateCurrentVisitDuration()
    }
    console.log(`[BrowsingTracker] Tracking ${isTracking ? 'enabled' : 'disabled'}`)
  }

  // Always return true for async responses
  sendResponse({ success: true })
  return true
})

// Listen for idle state changes
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'active') {
    // User became active, update lastActiveTime
    lastActiveTime = Date.now()
  } else {
    // User is idle or locked, save current duration
    await updateCurrentVisitDuration()
  }
})

// Initialize on install or update
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[BrowsingTracker] Extension ${details.reason}`)

  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.local.set({
      isTracking: true,
      excludedDomains: [],
      retentionDays: 90,
    })
  }

  await initialize()
})

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  currentSessionId = generateSessionId()
  await initialize()
})

// Also initialize immediately (for development)
initialize()
