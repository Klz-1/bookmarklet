import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../../src/storage/db'

describe('BrowsingDatabase', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.clearAllData()
  })

  describe('normalizeUrl', () => {
    it('should remove query parameters', () => {
      const url = 'https://example.com/page?utm_source=test&id=123'
      const normalized = db.normalizeUrl(url)
      expect(normalized).toBe('https://example.com/page')
    })

    it('should remove fragments', () => {
      const url = 'https://example.com/page#section'
      const normalized = db.normalizeUrl(url)
      expect(normalized).toBe('https://example.com/page')
    })

    it('should remove trailing slashes', () => {
      const url = 'https://example.com/page/'
      const normalized = db.normalizeUrl(url)
      expect(normalized).toBe('https://example.com/page')
    })

    it('should keep trailing slash for root path', () => {
      const url = 'https://example.com/'
      const normalized = db.normalizeUrl(url)
      expect(normalized).toBe('https://example.com/')
    })

    it('should convert to lowercase', () => {
      const url = 'https://EXAMPLE.COM/Page'
      const normalized = db.normalizeUrl(url)
      expect(normalized).toBe('https://example.com/page')
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      const url = 'https://www.example.com/page'
      const domain = db.extractDomain(url)
      expect(domain).toBe('www.example.com')
    })

    it('should handle URLs with ports', () => {
      const url = 'https://localhost:3000/api'
      const domain = db.extractDomain(url)
      expect(domain).toBe('localhost')
    })
  })

  describe('addVisit', () => {
    it('should add a visit and return an ID', async () => {
      const id = await db.addVisit({
        url: 'https://example.com/page',
        title: 'Example Page',
        visitedAt: new Date(),
        duration: 0,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      expect(id).toBeGreaterThan(0)
    })

    it('should automatically normalize URL and extract domain', async () => {
      const id = await db.addVisit({
        url: 'https://example.com/page?query=1',
        title: 'Example Page',
        visitedAt: new Date(),
        duration: 0,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      const visit = await db.visits.get(id)
      expect(visit?.normalizedUrl).toBe('https://example.com/page')
      expect(visit?.domain).toBe('example.com')
    })
  })

  describe('updateVisitDuration', () => {
    it('should update the duration of a visit', async () => {
      const id = await db.addVisit({
        url: 'https://example.com',
        title: 'Example',
        visitedAt: new Date(),
        duration: 0,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      await db.updateVisitDuration(id, 120)

      const visit = await db.visits.get(id)
      expect(visit?.duration).toBe(120)
    })
  })

  describe('markAsBookmarked', () => {
    it('should mark visits with matching URL as bookmarked', async () => {
      const id = await db.addVisit({
        url: 'https://example.com/article',
        title: 'Article',
        visitedAt: new Date(),
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      await db.markAsBookmarked('https://example.com/article')

      const visit = await db.visits.get(id)
      expect(visit?.isBookmarked).toBe(true)
    })
  })

  describe('getVisitsForDate', () => {
    it('should return visits for a specific date', async () => {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      await db.addVisit({
        url: 'https://example.com',
        title: 'Today Visit',
        visitedAt: today,
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      const visits = await db.getVisitsForDate(todayStr)
      expect(visits.length).toBe(1)
      expect(visits[0].title).toBe('Today Visit')
    })

    it('should not return visits from other dates', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      await db.addVisit({
        url: 'https://example.com',
        title: 'Yesterday Visit',
        visitedAt: yesterday,
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      const today = new Date().toISOString().split('T')[0]
      const visits = await db.getVisitsForDate(today)
      expect(visits.length).toBe(0)
    })
  })

  describe('getDailyStats', () => {
    it('should calculate correct statistics', async () => {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      // Add visits from different domains
      await db.addVisit({
        url: 'https://example.com/page1',
        title: 'Page 1',
        visitedAt: today,
        duration: 120,
        sessionId: 'test-session',
        isBookmarked: true,
      })

      await db.addVisit({
        url: 'https://example.com/page2',
        title: 'Page 2',
        visitedAt: today,
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      await db.addVisit({
        url: 'https://other.com',
        title: 'Other Site',
        visitedAt: today,
        duration: 180,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      const stats = await db.getDailyStats(todayStr)

      expect(stats.pageCount).toBe(3)
      expect(stats.domainCount).toBe(2)
      expect(stats.totalTime).toBe(360) // 120 + 60 + 180
      expect(stats.bookmarkCount).toBe(1)
      expect(stats.topDomains.length).toBe(2)
    })
  })

  describe('getRecentVisits', () => {
    it('should return visits in reverse chronological order', async () => {
      const now = Date.now()

      await db.addVisit({
        url: 'https://first.com',
        title: 'First',
        visitedAt: new Date(now - 2000),
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      await db.addVisit({
        url: 'https://second.com',
        title: 'Second',
        visitedAt: new Date(now - 1000),
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      await db.addVisit({
        url: 'https://third.com',
        title: 'Third',
        visitedAt: new Date(now),
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      const visits = await db.getRecentVisits(3)
      expect(visits[0].title).toBe('Third')
      expect(visits[1].title).toBe('Second')
      expect(visits[2].title).toBe('First')
    })

    it('should respect the limit parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await db.addVisit({
          url: `https://site${i}.com`,
          title: `Site ${i}`,
          visitedAt: new Date(),
          duration: 60,
          sessionId: 'test-session',
          isBookmarked: false,
        })
      }

      const visits = await db.getRecentVisits(5)
      expect(visits.length).toBe(5)
    })
  })

  describe('cleanupOldData', () => {
    it('should delete visits older than retention period', async () => {
      const now = new Date()
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 100)

      await db.addVisit({
        url: 'https://old.com',
        title: 'Old Visit',
        visitedAt: oldDate,
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      await db.addVisit({
        url: 'https://new.com',
        title: 'New Visit',
        visitedAt: now,
        duration: 60,
        sessionId: 'test-session',
        isBookmarked: false,
      })

      const deletedCount = await db.cleanupOldData(90)
      expect(deletedCount).toBe(1)

      const remainingVisits = await db.visits.toArray()
      expect(remainingVisits.length).toBe(1)
      expect(remainingVisits[0].title).toBe('New Visit')
    })
  })

  describe('exportData and importData', () => {
    it('should export and import data correctly', async () => {
      await db.addVisit({
        url: 'https://example.com',
        title: 'Example',
        visitedAt: new Date(),
        duration: 120,
        sessionId: 'test-session',
        isBookmarked: true,
      })

      const exported = await db.exportData()
      expect(exported.visits.length).toBe(1)
      expect(exported.exportedAt).toBeDefined()

      await db.clearAllData()

      const importedCount = await db.importData(exported)
      expect(importedCount).toBe(1)

      const visits = await db.visits.toArray()
      expect(visits.length).toBe(1)
      expect(visits[0].title).toBe('Example')
    })
  })

  describe('isExcludedDomain', () => {
    it('should return true for exact domain match', () => {
      const excluded = ['example.com', 'test.org']
      expect(db.isExcludedDomain('https://example.com/page', excluded)).toBe(true)
    })

    it('should return true for subdomain of excluded domain', () => {
      const excluded = ['example.com']
      expect(db.isExcludedDomain('https://www.example.com/page', excluded)).toBe(true)
      expect(db.isExcludedDomain('https://sub.example.com/page', excluded)).toBe(true)
    })

    it('should return false for non-excluded domains', () => {
      const excluded = ['example.com']
      expect(db.isExcludedDomain('https://other.com/page', excluded)).toBe(false)
    })
  })
})
