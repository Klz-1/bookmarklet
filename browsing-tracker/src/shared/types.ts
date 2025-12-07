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
}

/**
 * User settings for the extension
 */
export interface Settings {
  isTracking: boolean
  excludedDomains: string[]
  retentionDays: number
  darkMode: 'system' | 'light' | 'dark'
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
}

/**
 * Message types for communication between extension components
 */
export type ExtensionMessage =
  | { type: 'TRACKING_STATE_CHANGED'; isTracking: boolean }
  | { type: 'PAGE_VISITED'; visit: PageVisit }
  | { type: 'GET_STATS'; date: string }
  | { type: 'STATS_RESPONSE'; stats: DailyStats }
  | { type: 'TWITTER_BOOKMARKS_SCRAPED'; tweets: Omit<TwitterBookmark, 'id' | 'scrapedAt'>[] }

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: Settings = {
  isTracking: true,
  excludedDomains: [],
  retentionDays: 90,
  darkMode: 'system',
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  enabled: boolean
  autoSyncTwitter: boolean
  autoSyncVisits: boolean
  syncIntervalMinutes: number // 5, 10, 15
  lastSyncAt: string | null
  oneSpaceUrl: string
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  enabled: false,
  autoSyncTwitter: true,
  autoSyncVisits: false,
  syncIntervalMinutes: 15,
  lastSyncAt: null,
  oneSpaceUrl: 'https://onebox-yshprffwnq-el.a.run.app', // Default Onebox URL
}

/**
 * Sync status
 */
export interface SyncStatus {
  isSyncing: boolean
  lastSyncAt: string | null
  pendingCount: number
  lastError: string | null
}
