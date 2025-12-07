import { useState, useEffect } from 'preact/hooks'

export function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  function getGreeting(): string {
    const hour = time.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  function formatTime(): string {
    return time.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  function formatDate(): string {
    return time.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="text-center">
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
        {getGreeting()}
      </p>
      <p className="text-6xl font-light tracking-tight mb-2">
        {formatTime()}
      </p>
      <p className="text-gray-500 dark:text-gray-500">
        {formatDate()}
      </p>
    </div>
  )
}
