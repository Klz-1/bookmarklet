/**
 * Sync service for Onebox integration
 */

import { db, type PageVisit, type TwitterBookmark } from '../storage/db'
import { type SyncConfig, DEFAULT_SYNC_CONFIG } from '../shared/types'
import { getStoredAuthState, refreshToken } from '../auth/authService'

const SYNC_CONFIG_KEY = 'syncConfig'

/**
 * Get sync configuration
 */
export async function getSyncConfig(): Promise<SyncConfig> {
  const result = await chrome.storage.local.get(SYNC_CONFIG_KEY)
  const stored = result[SYNC_CONFIG_KEY] as Partial<SyncConfig> | undefined
  return { ...DEFAULT_SYNC_CONFIG, ...(stored || {}) }
}

/**
 * Save sync configuration
 */
export async function saveSyncConfig(config: Partial<SyncConfig>): Promise<void> {
  const current = await getSyncConfig()
  const updated = { ...current, ...config }
  await chrome.storage.local.set({ [SYNC_CONFIG_KEY]: updated })
}

/**
 * Format visit for OneSpace API
 */
function formatVisitForSync(visit: PageVisit) {
  return {
    type: 'visit' as const,
    sourceUrl: visit.url,
    title: visit.title,
    metadata: {
      domain: visit.domain,
      duration: visit.duration,
      favicon: visit.favicon,
      isBookmarked: visit.isBookmarked,
    },
    timestamp: visit.visitedAt.toISOString(),
  }
}

/**
 * Format Twitter bookmark for OneSpace API
 */
function formatBookmarkForSync(bookmark: TwitterBookmark) {
  return {
    type: 'twitter_bookmark' as const,
    sourceUrl: bookmark.tweetUrl,
    title: `@${bookmark.authorHandle}`,
    content: bookmark.content,
    metadata: {
      tweetId: bookmark.tweetId,
      authorHandle: bookmark.authorHandle,
      authorName: bookmark.authorName,
      authorAvatar: bookmark.authorAvatar,
      mediaUrls: bookmark.mediaUrls,
      likes: bookmark.likes,
      retweets: bookmark.retweets,
      replies: bookmark.replies,
    },
    timestamp: bookmark.timestamp,
  }
}

/**
 * Sync items to OneSpace
 */
export async function syncToOneSpace(retryOnAuth = true): Promise<{
  success: boolean
  synced: number
  errors: string[]
}> {
  const config = await getSyncConfig()

  if (!config.enabled) {
    return { success: false, synced: 0, errors: ['Sync is disabled'] }
  }

  const auth = await getStoredAuthState()
  if (!auth.isAuthenticated || !auth.token) {
    return { success: false, synced: 0, errors: ['Not authenticated'] }
  }

  const errors: string[] = []
  let synced = 0

  // Collect items to sync - store references to mark the SAME items as synced later
  const items: Array<ReturnType<typeof formatVisitForSync> | ReturnType<typeof formatBookmarkForSync>> = []
  const bookmarksToSync: TwitterBookmark[] = []
  const visitsToSync: PageVisit[] = []

  // Get unsynced Twitter bookmarks
  if (config.autoSyncTwitter) {
    const bookmarks = await db.getUnsyncedTwitterBookmarks(50)
    for (const bookmark of bookmarks) {
      items.push(formatBookmarkForSync(bookmark))
      bookmarksToSync.push(bookmark)
    }
  }

  // Get unsynced visits (if enabled)
  if (config.autoSyncVisits) {
    const visits = await db.getUnsyncedVisits(50)
    for (const visit of visits) {
      items.push(formatVisitForSync(visit))
      visitsToSync.push(visit)
    }
  }

  if (items.length === 0) {
    return { success: true, synced: 0, errors: [] }
  }

  // Send to OneSpace
  try {
    const response = await fetch(`${config.oneSpaceUrl}/api/extension/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ items }),
    })

    // Handle 401 - try to refresh token and retry once
    if (response.status === 401 && retryOnAuth) {
      console.log('[Sync] Token expired, attempting refresh...')
      const newToken = await refreshToken()
      if (newToken) {
        return syncToOneSpace(false) // Retry with fresh token, but don't retry again
      }
      throw new Error('Authentication expired. Please sign in again.')
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Onebox API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    synced = result.synced || items.length

    // Mark the SAME items that were sent as synced (fixes race condition)
    for (const bookmark of bookmarksToSync) {
      if (bookmark.id) {
        await db.markTwitterBookmarkSynced(bookmark.id)
      }
    }

    for (const visit of visitsToSync) {
      if (visit.id) {
        await db.markVisitSynced(visit.id)
      }
    }

    // Update last sync time
    await saveSyncConfig({ lastSyncAt: new Date().toISOString() })

    console.log(`[Sync] Successfully synced ${synced} items to Onebox`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    errors.push(errorMsg)
    console.error('[Sync] Failed:', error)
  }

  return { success: errors.length === 0, synced, errors }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  enabled: boolean
  lastSyncAt: string | null
  pendingCount: number
  isAuthenticated: boolean
}> {
  const config = await getSyncConfig()
  const auth = await getStoredAuthState()

  let pendingCount = 0
  if (config.autoSyncTwitter) {
    const bookmarks = await db.getUnsyncedTwitterBookmarks()
    pendingCount += bookmarks.length
  }
  if (config.autoSyncVisits) {
    const visits = await db.getUnsyncedVisits()
    pendingCount += visits.length
  }

  return {
    enabled: config.enabled,
    lastSyncAt: config.lastSyncAt,
    pendingCount,
    isAuthenticated: auth.isAuthenticated,
  }
}

/**
 * Test Onebox connection
 */
export async function testOneboxConnection(): Promise<{
  success: boolean
  message: string
}> {
  const config = await getSyncConfig()
  const auth = await getStoredAuthState()

  if (!auth.isAuthenticated || !auth.token) {
    return { success: false, message: 'Not signed in with Google' }
  }

  try {
    const response = await fetch(`${config.oneSpaceUrl}/api/extension/ingest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    })

    if (response.ok) {
      return { success: true, message: 'Connected to Onebox' }
    } else {
      return { success: false, message: `Connection failed: ${response.status}` }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, message: `Connection error: ${msg}` }
  }
}
