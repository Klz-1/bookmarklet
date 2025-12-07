import Dexie, { type Table } from 'dexie'

/**
 * Represents a single page visit tracked by the extension
 */
export interface PageVisit {
  id?: number
  url: string
  normalizedUrl: string
  domain: string
  title: string
  favicon?: string
  visitedAt: Date
  duration: number // seconds spent on page
  sessionId: string
  isBookmarked: boolean
  syncedAt?: Date // When synced to OneSpace
}

/**
 * Twitter bookmark scraped from bookmarks page
 */
export interface TwitterBookmark {
  id?: number
  tweetId: string
  authorHandle: string
  authorName: string
  authorAvatar: string
  content: string
  timestamp: string
  tweetUrl: string
  mediaUrls: string[]
  likes?: string
  retweets?: string
  replies?: string
  scrapedAt: Date
  syncedAt?: Date // When synced to OneSpace
}

/**
 * Sync queue item for offline-first sync
 */
export interface SyncQueueItem {
  id?: number
  type: 'visit' | 'twitter_bookmark'
  itemId: number // Reference to visits or twitterBookmarks
  createdAt: Date
  attempts: number
  lastAttemptAt?: Date
  error?: string
}

/**
 * Aggregated statistics for a time period
 */
export interface DailyStats {
  date: string
  totalTime: number
  pageCount: number
  domainCount: number
  bookmarkCount: number
  topDomains: { domain: string; time: number; visits: number }[]
}

/**
 * BrowsingDatabase - IndexedDB database for storing browsing history
 */
class BrowsingDatabase extends Dexie {
  visits!: Table<PageVisit, number>
  twitterBookmarks!: Table<TwitterBookmark, number>
  syncQueue!: Table<SyncQueueItem, number>

  constructor() {
    super('BrowsingTrackerDB')

    // Schema version 1
    this.version(1).stores({
      visits: '++id, url, normalizedUrl, domain, visitedAt, sessionId, isBookmarked',
    })

    // Schema version 2 - add Twitter bookmarks
    this.version(2).stores({
      visits: '++id, url, normalizedUrl, domain, visitedAt, sessionId, isBookmarked',
      twitterBookmarks: '++id, tweetId, authorHandle, timestamp, scrapedAt',
    })

    // Schema version 3 - add sync queue
    this.version(3).stores({
      visits: '++id, url, normalizedUrl, domain, visitedAt, sessionId, isBookmarked, syncedAt',
      twitterBookmarks: '++id, tweetId, authorHandle, timestamp, scrapedAt, syncedAt',
      syncQueue: '++id, type, itemId, createdAt, attempts',
    })
  }

  /**
   * Normalize a URL by removing query parameters, fragments, and trailing slashes
   */
  normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      // Keep protocol, host, and pathname, remove query and fragment
      let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}`
      // Remove trailing slash (except for root)
      if (normalized.endsWith('/') && parsed.pathname !== '/') {
        normalized = normalized.slice(0, -1)
      }
      return normalized.toLowerCase()
    } catch {
      return url.toLowerCase()
    }
  }

  /**
   * Extract domain from a URL
   */
  extractDomain(url: string): string {
    try {
      const parsed = new URL(url)
      return parsed.hostname
    } catch {
      return url
    }
  }

  /**
   * Add a new page visit
   */
  async addVisit(visit: Omit<PageVisit, 'id' | 'normalizedUrl' | 'domain'>): Promise<number> {
    const normalizedUrl = this.normalizeUrl(visit.url)
    const domain = this.extractDomain(visit.url)

    return this.visits.add({
      ...visit,
      normalizedUrl,
      domain,
    })
  }

  /**
   * Update the duration of an existing visit
   */
  async updateVisitDuration(id: number, duration: number): Promise<void> {
    await this.visits.update(id, { duration })
  }

  /**
   * Mark a visit as bookmarked
   */
  async markAsBookmarked(url: string): Promise<void> {
    const normalizedUrl = this.normalizeUrl(url)
    await this.visits
      .where('normalizedUrl')
      .equals(normalizedUrl)
      .modify({ isBookmarked: true })
  }

  /**
   * Get visits for a specific date
   */
  async getVisitsForDate(date: string): Promise<PageVisit[]> {
    const startOfDay = new Date(`${date}T00:00:00`)
    const endOfDay = new Date(`${date}T23:59:59.999`)

    return this.visits
      .where('visitedAt')
      .between(startOfDay, endOfDay, true, true)
      .toArray()
  }

  /**
   * Get visits for a date range
   */
  async getVisitsForRange(startDate: string, endDate: string): Promise<PageVisit[]> {
    const start = new Date(`${startDate}T00:00:00`)
    const end = new Date(`${endDate}T23:59:59.999`)

    return this.visits
      .where('visitedAt')
      .between(start, end, true, true)
      .toArray()
  }

  /**
   * Get recent visits, ordered by most recent first
   */
  async getRecentVisits(limit: number = 50): Promise<PageVisit[]> {
    return this.visits
      .orderBy('visitedAt')
      .reverse()
      .limit(limit)
      .toArray()
  }

  /**
   * Calculate daily statistics for a specific date
   */
  async getDailyStats(date: string): Promise<DailyStats> {
    const visits = await this.getVisitsForDate(date)
    return this.calculateStats(date, visits)
  }

  /**
   * Calculate statistics for a date range
   */
  async getStatsForRange(startDate: string, endDate: string): Promise<DailyStats> {
    const visits = await this.getVisitsForRange(startDate, endDate)
    return this.calculateStats(`${startDate} - ${endDate}`, visits)
  }

  /**
   * Calculate statistics from a list of visits
   */
  private calculateStats(dateLabel: string, visits: PageVisit[]): DailyStats {
    // Calculate totals
    const totalTime = visits.reduce((sum, v) => sum + v.duration, 0)
    const pageCount = visits.length
    const uniqueDomains = new Set(visits.map((v) => v.domain))
    const domainCount = uniqueDomains.size
    const bookmarkCount = visits.filter((v) => v.isBookmarked).length

    // Calculate time per domain
    const domainStats = new Map<string, { time: number; visits: number }>()
    for (const visit of visits) {
      const existing = domainStats.get(visit.domain) || { time: 0, visits: 0 }
      domainStats.set(visit.domain, {
        time: existing.time + visit.duration,
        visits: existing.visits + 1,
      })
    }

    // Sort by time and take top 10
    const topDomains = Array.from(domainStats.entries())
      .map(([domain, stats]) => ({ domain, ...stats }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10)

    return {
      date: dateLabel,
      totalTime,
      pageCount,
      domainCount,
      bookmarkCount,
      topDomains,
    }
  }

  /**
   * Delete visits older than a certain number of days
   */
  async cleanupOldData(retentionDays: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const oldVisits = await this.visits
      .where('visitedAt')
      .below(cutoffDate)
      .toArray()

    const idsToDelete = oldVisits.map((v) => v.id!).filter((id) => id !== undefined)
    await this.visits.bulkDelete(idsToDelete)

    return idsToDelete.length
  }

  /**
   * Delete all data
   */
  async clearAllData(): Promise<void> {
    await this.visits.clear()
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<{ visits: PageVisit[]; exportedAt: string }> {
    const visits = await this.visits.toArray()
    return {
      visits,
      exportedAt: new Date().toISOString(),
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: { visits: PageVisit[] }): Promise<number> {
    // Convert date strings back to Date objects
    const visits = data.visits.map((v) => ({
      ...v,
      visitedAt: new Date(v.visitedAt),
      id: undefined, // Let Dexie assign new IDs
    }))

    await this.visits.bulkAdd(visits as PageVisit[])
    return visits.length
  }

  /**
   * Get the last visit for the current session (for updating duration)
   */
  async getLastVisitForSession(sessionId: string): Promise<PageVisit | undefined> {
    return this.visits
      .where('sessionId')
      .equals(sessionId)
      .reverse()
      .first()
  }

  /**
   * Check if a domain should be excluded from tracking
   */
  isExcludedDomain(url: string, excludedDomains: string[]): boolean {
    const domain = this.extractDomain(url)
    return excludedDomains.some(
      (excluded) => domain === excluded || domain.endsWith(`.${excluded}`)
    )
  }

  // Twitter Bookmarks Methods

  /**
   * Add Twitter bookmarks (skips duplicates based on tweetId)
   */
  async addTwitterBookmarks(
    tweets: Omit<TwitterBookmark, 'id' | 'scrapedAt'>[]
  ): Promise<number> {
    let addedCount = 0

    for (const tweet of tweets) {
      // Check if tweet already exists
      const existing = await this.twitterBookmarks
        .where('tweetId')
        .equals(tweet.tweetId)
        .first()

      if (!existing) {
        await this.twitterBookmarks.add({
          ...tweet,
          scrapedAt: new Date(),
        })
        addedCount++
      }
    }

    return addedCount
  }

  /**
   * Get all Twitter bookmarks, ordered by most recent first
   */
  async getTwitterBookmarks(limit?: number): Promise<TwitterBookmark[]> {
    let query = this.twitterBookmarks.orderBy('scrapedAt').reverse()
    if (limit) {
      query = query.limit(limit)
    }
    return query.toArray()
  }

  /**
   * Get Twitter bookmarks count
   */
  async getTwitterBookmarksCount(): Promise<number> {
    return this.twitterBookmarks.count()
  }

  /**
   * Search Twitter bookmarks by content or author
   */
  async searchTwitterBookmarks(searchTerm: string): Promise<TwitterBookmark[]> {
    const term = searchTerm.toLowerCase()
    const all = await this.twitterBookmarks.toArray()
    return all.filter(
      (t) =>
        t.content.toLowerCase().includes(term) ||
        t.authorHandle.toLowerCase().includes(term) ||
        t.authorName.toLowerCase().includes(term)
    )
  }

  /**
   * Delete a Twitter bookmark by ID
   */
  async deleteTwitterBookmark(id: number): Promise<void> {
    await this.twitterBookmarks.delete(id)
  }

  /**
   * Clear all Twitter bookmarks
   */
  async clearTwitterBookmarks(): Promise<void> {
    await this.twitterBookmarks.clear()
  }

  // Sync Queue Methods

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(type: 'visit' | 'twitter_bookmark', itemId: number): Promise<number> {
    // Check if already in queue
    const existing = await this.syncQueue
      .where({ type, itemId })
      .first()

    if (existing) {
      return existing.id!
    }

    return this.syncQueue.add({
      type,
      itemId,
      createdAt: new Date(),
      attempts: 0,
    })
  }

  /**
   * Get pending sync items (max attempts < 5)
   */
  async getPendingSyncItems(limit = 50): Promise<SyncQueueItem[]> {
    return this.syncQueue
      .where('attempts')
      .below(5)
      .limit(limit)
      .toArray()
  }

  /**
   * Get sync queue count
   */
  async getSyncQueueCount(): Promise<number> {
    return this.syncQueue.where('attempts').below(5).count()
  }

  /**
   * Update sync item after attempt
   */
  async updateSyncAttempt(id: number, error?: string): Promise<void> {
    const item = await this.syncQueue.get(id)
    if (item) {
      await this.syncQueue.update(id, {
        attempts: item.attempts + 1,
        lastAttemptAt: new Date(),
        error,
      })
    }
  }

  /**
   * Remove item from sync queue (after successful sync)
   */
  async removeFromSyncQueue(id: number): Promise<void> {
    await this.syncQueue.delete(id)
  }

  /**
   * Mark visit as synced
   */
  async markVisitSynced(id: number): Promise<void> {
    await this.visits.update(id, { syncedAt: new Date() })
  }

  /**
   * Mark Twitter bookmark as synced
   */
  async markTwitterBookmarkSynced(id: number): Promise<void> {
    await this.twitterBookmarks.update(id, { syncedAt: new Date() })
  }

  /**
   * Get unsynced visits
   */
  async getUnsyncedVisits(limit = 100): Promise<PageVisit[]> {
    return this.visits
      .filter(v => !v.syncedAt)
      .limit(limit)
      .toArray()
  }

  /**
   * Get unsynced Twitter bookmarks
   */
  async getUnsyncedTwitterBookmarks(limit = 100): Promise<TwitterBookmark[]> {
    return this.twitterBookmarks
      .filter(b => !b.syncedAt)
      .limit(limit)
      .toArray()
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    await this.syncQueue.clear()
  }
}

// Export singleton instance
export const db = new BrowsingDatabase()
