import { useMemo } from 'preact/hooks'
import type { PageVisit } from '../../shared/types'

interface ActivityHeatmapProps {
  visits: PageVisit[]
  formatDuration: (seconds: number) => string
}

// Hours of the day (0-23)
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Days of the week
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ActivityHeatmap({ visits, formatDuration }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Initialize 7x24 grid (days x hours)
    const grid: number[][] = DAYS.map(() => HOURS.map(() => 0))

    // Aggregate time by day of week and hour
    for (const visit of visits) {
      const date = new Date(visit.visitedAt)
      const day = date.getDay() // 0 = Sunday
      const hour = date.getHours()
      grid[day][hour] += visit.duration
    }

    // Find max value for scaling
    const maxValue = Math.max(...grid.flat(), 1)

    return { grid, maxValue }
  }, [visits])

  function getColor(value: number, maxValue: number): string {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-700'

    const intensity = value / maxValue

    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900'
    if (intensity < 0.5) return 'bg-blue-300 dark:bg-blue-800'
    if (intensity < 0.75) return 'bg-blue-500 dark:bg-blue-600'
    return 'bg-blue-700 dark:bg-blue-400'
  }

  function formatHour(hour: number): string {
    if (hour === 0) return '12am'
    if (hour === 12) return '12pm'
    if (hour < 12) return `${hour}am`
    return `${hour - 12}pm`
  }

  if (visits.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No activity data
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex ml-12 mb-1">
          {HOURS.filter((h) => h % 3 === 0).map((hour) => (
            <div
              key={hour}
              className="text-xs text-gray-400 dark:text-gray-500"
              style={{ width: `${100 / 8}%` }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-1">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center">
              <div className="w-12 text-xs text-gray-500 dark:text-gray-400">
                {day}
              </div>
              <div className="flex-1 flex gap-0.5">
                {HOURS.map((hour) => {
                  const value = heatmapData.grid[dayIndex][hour]
                  return (
                    <div
                      key={hour}
                      className={`flex-1 h-5 rounded-sm ${getColor(value, heatmapData.maxValue)} transition-colors hover:ring-2 hover:ring-blue-500`}
                      title={`${day} ${formatHour(hour)}: ${formatDuration(value)}`}
                      role="gridcell"
                      aria-label={`${day} ${formatHour(hour)}: ${formatDuration(value)} of activity`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-xs text-gray-400">Less</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-700" />
            <div className="w-4 h-4 rounded-sm bg-blue-200 dark:bg-blue-900" />
            <div className="w-4 h-4 rounded-sm bg-blue-300 dark:bg-blue-800" />
            <div className="w-4 h-4 rounded-sm bg-blue-500 dark:bg-blue-600" />
            <div className="w-4 h-4 rounded-sm bg-blue-700 dark:bg-blue-400" />
          </div>
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>
    </div>
  )
}
