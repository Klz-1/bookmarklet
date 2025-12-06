import { useState, useEffect } from 'preact/hooks'

export type DarkModePreference = 'system' | 'light' | 'dark'

export function useDarkMode() {
  const [preference, setPreference] = useState<DarkModePreference>('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load saved preference
    chrome.storage.local.get('darkMode').then((result) => {
      if (result.darkMode) {
        setPreference(result.darkMode as DarkModePreference)
      }
    })
  }, [])

  useEffect(() => {
    // Determine if dark mode should be active
    if (preference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setIsDark(preference === 'dark')
    }
  }, [preference])

  useEffect(() => {
    // Apply dark mode class to document
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  async function setDarkMode(pref: DarkModePreference) {
    setPreference(pref)
    await chrome.storage.local.set({ darkMode: pref })
  }

  return { isDark, preference, setDarkMode }
}
