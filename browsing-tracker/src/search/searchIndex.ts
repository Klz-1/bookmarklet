import Fuse, { type IFuseOptions } from 'fuse.js'
import { db, type PageVisit, type TwitterBookmark } from '../storage/db'

export interface SearchableItem {
  id: string
  type: 'visit' | 'bookmark'
  title: string
  url: string
  domain: string
  content?: string
  timestamp: Date
  favicon?: string
  authorHandle?: string
  authorAvatar?: string
}

const fuseOptions: IFuseOptions<SearchableItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'url', weight: 0.2 },
    { name: 'domain', weight: 0.2 },
    { name: 'content', weight: 0.2 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
}

let fuseIndex: Fuse<SearchableItem> | null = null
let lastRefresh = 0
const CACHE_TTL = 30000 // 30 seconds

/**
 * Convert PageVisit to SearchableItem
 */
function visitToSearchable(visit: PageVisit): SearchableItem {
  return {
    id: `visit-${visit.id}`,
    type: 'visit',
    title: visit.title,
    url: visit.url,
    domain: visit.domain,
    timestamp: visit.visitedAt,
    favicon: visit.favicon,
  }
}

/**
 * Convert TwitterBookmark to SearchableItem
 */
function bookmarkToSearchable(bookmark: TwitterBookmark): SearchableItem {
  return {
    id: `bookmark-${bookmark.id}`,
    type: 'bookmark',
    title: `@${bookmark.authorHandle}: ${bookmark.content.slice(0, 50)}`,
    url: bookmark.tweetUrl,
    domain: 'twitter.com',
    content: bookmark.content,
    timestamp: bookmark.scrapedAt,
    authorHandle: bookmark.authorHandle,
    authorAvatar: bookmark.authorAvatar,
  }
}

/**
 * Build or refresh the search index
 */
export async function refreshSearchIndex(): Promise<void> {
  const now = Date.now()

  // Skip if recently refreshed
  if (fuseIndex && now - lastRefresh < CACHE_TTL) {
    return
  }

  const items: SearchableItem[] = []

  // Load visits (last 1000)
  try {
    const visits = await db.visits
      .orderBy('visitedAt')
      .reverse()
      .limit(1000)
      .toArray()

    // Dedupe by URL, keep most recent
    const seenUrls = new Set<string>()
    for (const visit of visits) {
      if (!seenUrls.has(visit.normalizedUrl)) {
        seenUrls.add(visit.normalizedUrl)
        items.push(visitToSearchable(visit))
      }
    }
  } catch (error) {
    console.error('[Search] Failed to load visits:', error)
  }

  // Load Twitter bookmarks
  try {
    const bookmarks = await db.getTwitterBookmarks()
    for (const bookmark of bookmarks) {
      items.push(bookmarkToSearchable(bookmark))
    }
  } catch (error) {
    console.error('[Search] Failed to load bookmarks:', error)
  }

  fuseIndex = new Fuse(items, fuseOptions)
  lastRefresh = now

  console.log(`[Search] Index refreshed with ${items.length} items`)
}

/**
 * Search the index
 */
export async function search(query: string, limit = 20): Promise<SearchableItem[]> {
  if (!query.trim()) {
    return []
  }

  await refreshSearchIndex()

  if (!fuseIndex) {
    return []
  }

  const results = fuseIndex.search(query, { limit })
  return results.map(r => r.item)
}

/**
 * Force refresh the index
 */
export function invalidateSearchIndex(): void {
  lastRefresh = 0
}
