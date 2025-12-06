/**
 * Content script to scrape Twitter/X bookmarks
 * Runs on twitter.com/i/bookmarks and x.com/i/bookmarks
 */

interface ScrapedTweet {
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
}

// Track already scraped tweets to avoid duplicates
const scrapedTweetIds = new Set<string>()

// Auto-scroll state
let isAutoScrolling = false
let autoScrollAborted = false

/**
 * Extract tweet data from a tweet article element
 */
function extractTweetData(article: Element): ScrapedTweet | null {
  try {
    // Find the tweet link to get ID
    const tweetLink = article.querySelector('a[href*="/status/"]') as HTMLAnchorElement
    if (!tweetLink) return null

    const hrefMatch = tweetLink.href.match(/\/status\/(\d+)/)
    if (!hrefMatch) return null

    const tweetId = hrefMatch[1]
    if (scrapedTweetIds.has(tweetId)) return null

    // Author info
    const authorLink = article.querySelector('a[href^="/"][role="link"]') as HTMLAnchorElement
    const authorHandle = authorLink?.href.split('/').pop() || ''

    const authorNameEl = article.querySelector('[data-testid="User-Name"]')
    const authorName = authorNameEl?.querySelector('span')?.textContent || authorHandle

    const avatarImg = article.querySelector('img[src*="profile_images"]') as HTMLImageElement
    const authorAvatar = avatarImg?.src || ''

    // Tweet content
    const tweetTextEl = article.querySelector('[data-testid="tweetText"]')
    const content = tweetTextEl?.textContent || ''

    // Timestamp
    const timeEl = article.querySelector('time')
    const timestamp = timeEl?.getAttribute('datetime') || new Date().toISOString()

    // Tweet URL
    const tweetUrl = `https://twitter.com/${authorHandle}/status/${tweetId}`

    // Media
    const mediaUrls: string[] = []
    const mediaImages = article.querySelectorAll('[data-testid="tweetPhoto"] img')
    mediaImages.forEach((img) => {
      const src = (img as HTMLImageElement).src
      if (src && !src.includes('profile_images')) {
        mediaUrls.push(src)
      }
    })

    // Engagement metrics (optional, may not always be visible)
    const metricsGroup = article.querySelector('[role="group"]')
    let likes, retweets, replies
    if (metricsGroup) {
      const buttons = metricsGroup.querySelectorAll('[data-testid]')
      buttons.forEach((btn) => {
        const testId = btn.getAttribute('data-testid')
        const value = btn.querySelector('span')?.textContent || ''
        if (testId?.includes('like')) likes = value
        if (testId?.includes('retweet')) retweets = value
        if (testId?.includes('reply')) replies = value
      })
    }

    scrapedTweetIds.add(tweetId)

    return {
      tweetId,
      authorHandle,
      authorName,
      authorAvatar,
      content,
      timestamp,
      tweetUrl,
      mediaUrls,
      likes,
      retweets,
      replies,
    }
  } catch (error) {
    console.error('[BrowsingTracker] Error extracting tweet:', error)
    return null
  }
}

/**
 * Scrape all visible tweets on the page
 */
function scrapeVisibleTweets(): ScrapedTweet[] {
  const tweets: ScrapedTweet[] = []
  const articles = document.querySelectorAll('article[data-testid="tweet"]')

  articles.forEach((article) => {
    const tweet = extractTweetData(article)
    if (tweet) {
      tweets.push(tweet)
    }
  })

  return tweets
}

/**
 * Send scraped tweets to the service worker
 */
function sendTweetsToBackground(tweets: ScrapedTweet[]) {
  if (tweets.length === 0) return

  chrome.runtime.sendMessage({
    type: 'TWITTER_BOOKMARKS_SCRAPED',
    tweets,
  })

  console.log(`[BrowsingTracker] Sent ${tweets.length} bookmarked tweets`)
}

/**
 * Create and show the floating status indicator using safe DOM methods
 */
function createStatusIndicator(): HTMLElement {
  const existing = document.getElementById('bt-twitter-indicator')
  if (existing) return existing

  const indicator = document.createElement('div')
  indicator.id = 'bt-twitter-indicator'

  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1d9bf0;
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `

  // Top row with count
  const topRow = document.createElement('div')
  topRow.style.cssText = 'display: flex; align-items: center; gap: 8px;'

  const countSpan = document.createElement('span')
  countSpan.id = 'bt-count'
  countSpan.textContent = '0'

  const textSpan = document.createElement('span')
  textSpan.textContent = ' bookmarks captured'

  const closeBtn = document.createElement('button')
  closeBtn.id = 'bt-close'
  closeBtn.textContent = 'X'
  closeBtn.style.cssText = `
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: auto;
    font-size: 12px;
  `
  closeBtn.addEventListener('click', () => {
    indicator.style.display = 'none'
  })

  topRow.appendChild(countSpan)
  topRow.appendChild(textSpan)
  topRow.appendChild(closeBtn)

  // Bottom row with auto-scroll button and status
  const bottomRow = document.createElement('div')
  bottomRow.style.cssText = 'display: flex; align-items: center; gap: 8px;'

  const autoScrollBtn = document.createElement('button')
  autoScrollBtn.id = 'bt-autoscroll'
  autoScrollBtn.textContent = 'Auto-scroll'
  autoScrollBtn.style.cssText = `
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  `
  autoScrollBtn.addEventListener('click', autoScroll)

  const statusSpan = document.createElement('span')
  statusSpan.id = 'bt-status'
  statusSpan.style.cssText = 'font-size: 12px; opacity: 0.9;'
  statusSpan.textContent = ''

  bottomRow.appendChild(autoScrollBtn)
  bottomRow.appendChild(statusSpan)

  container.appendChild(topRow)
  container.appendChild(bottomRow)
  indicator.appendChild(container)
  document.body.appendChild(indicator)

  return indicator
}

/**
 * Update the status indicator count
 */
function updateIndicatorCount() {
  const countEl = document.getElementById('bt-count')
  if (countEl) {
    countEl.textContent = scrapedTweetIds.size.toString()
  }
}

/**
 * Update auto-scroll button state
 */
function updateAutoScrollButton(status: 'idle' | 'scrolling' | 'done') {
  const btn = document.getElementById('bt-autoscroll') as HTMLButtonElement
  const statusEl = document.getElementById('bt-status')
  if (!btn || !statusEl) return

  if (status === 'scrolling') {
    btn.textContent = 'Stop'
    btn.style.background = '#ef4444'
    statusEl.textContent = 'Auto-scrolling...'
  } else if (status === 'done') {
    btn.textContent = 'Auto-scroll'
    btn.style.background = 'rgba(255,255,255,0.2)'
    statusEl.textContent = 'Done!'
    setTimeout(() => {
      statusEl.textContent = ''
    }, 3000)
  } else {
    btn.textContent = 'Auto-scroll'
    btn.style.background = 'rgba(255,255,255,0.2)'
    statusEl.textContent = ''
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Auto-scroll through the bookmarks page
 */
async function autoScroll() {
  if (isAutoScrolling) {
    // Stop auto-scrolling
    autoScrollAborted = true
    isAutoScrolling = false
    updateAutoScrollButton('idle')
    return
  }

  isAutoScrolling = true
  autoScrollAborted = false
  updateAutoScrollButton('scrolling')

  let lastHeight = document.body.scrollHeight
  let noNewContentCount = 0
  const maxNoNewContent = 5 // Stop after 5 scrolls with no new content

  while (!autoScrollAborted && noNewContentCount < maxNoNewContent) {
    // Scroll to bottom
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })

    // Wait for content to load
    await sleep(1500)

    // Scrape new tweets
    const newTweets = scrapeVisibleTweets()
    if (newTweets.length > 0) {
      sendTweetsToBackground(newTweets)
      updateIndicatorCount()
    }

    // Check if we got new content
    const newHeight = document.body.scrollHeight
    if (newHeight === lastHeight) {
      noNewContentCount++
    } else {
      noNewContentCount = 0
      lastHeight = newHeight
    }

    // Update status
    const statusEl = document.getElementById('bt-status')
    if (statusEl && !autoScrollAborted) {
      statusEl.textContent = `Scrolling... (${scrapedTweetIds.size} found)`
    }
  }

  isAutoScrolling = false
  if (!autoScrollAborted) {
    updateAutoScrollButton('done')
  }
}

/**
 * Main initialization
 */
function init() {
  console.log('[BrowsingTracker] Twitter bookmarks scraper initialized')

  createStatusIndicator()

  // Initial scrape
  const initialTweets = scrapeVisibleTweets()
  sendTweetsToBackground(initialTweets)
  updateIndicatorCount()

  // Set up scroll observer to scrape new tweets as user scrolls
  let scrollTimeout: ReturnType<typeof setTimeout>
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      const newTweets = scrapeVisibleTweets()
      sendTweetsToBackground(newTweets)
      updateIndicatorCount()
    }, 500) // Debounce scroll events
  })

  // Also observe DOM mutations for dynamically loaded tweets
  const observer = new MutationObserver(() => {
    const newTweets = scrapeVisibleTweets()
    if (newTweets.length > 0) {
      sendTweetsToBackground(newTweets)
      updateIndicatorCount()
    }
  })

  // Start observing the main content area
  const mainContent = document.querySelector('main') || document.body
  observer.observe(mainContent, {
    childList: true,
    subtree: true,
  })
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
