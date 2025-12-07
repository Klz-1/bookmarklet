import { useState, useEffect } from 'preact/hooks'

interface TopSite {
  url: string
  title: string
}

export function QuickLinks() {
  const [sites, setSites] = useState<TopSite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopSites()
  }, [])

  async function loadTopSites() {
    try {
      const topSites = await chrome.topSites.get()
      setSites(topSites.slice(0, 8))
    } catch (error) {
      console.error('Failed to load top sites:', error)
    } finally {
      setLoading(false)
    }
  }

  function getFaviconUrl(url: string): string {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return ''
    }
  }

  function getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center">
        Browse some sites to see your quick links
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {sites.map((site) => (
        <a
          key={site.url}
          href={site.url}
          className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
          title={site.title}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
            <img
              src={getFaviconUrl(site.url)}
              alt=""
              className="w-6 h-6"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-full">
            {getDomain(site.url)}
          </span>
        </a>
      ))}
    </div>
  )
}
