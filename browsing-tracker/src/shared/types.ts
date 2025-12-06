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
 * Message types for communication between extension components
 */
export type ExtensionMessage =
  | { type: 'TRACKING_STATE_CHANGED'; isTracking: boolean }
  | { type: 'PAGE_VISITED'; visit: PageVisit }
  | { type: 'GET_STATS'; date: string }
  | { type: 'STATS_RESPONSE'; stats: DailyStats }

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: Settings = {
  isTracking: true,
  excludedDomains: [],
  retentionDays: 90,
  darkMode: 'system',
}
