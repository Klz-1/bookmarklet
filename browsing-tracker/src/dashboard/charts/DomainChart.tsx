import { useEffect, useRef } from 'preact/hooks'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

interface DomainData {
  domain: string
  time: number
  visits: number
}

interface DomainChartProps {
  data: DomainData[]
  formatDuration: (seconds: number) => string
}

// Color palette that's accessible and distinct
const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#84cc16', // lime
  '#6366f1', // indigo
]

export function DomainChart({ data, formatDuration }: DomainChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Take top 10 domains
    const topDomains = data.slice(0, 10)

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: topDomains.map((d) => d.domain),
        datasets: [
          {
            data: topDomains.map((d) => d.time),
            backgroundColor: CHART_COLORS.slice(0, topDomains.length),
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 12,
              font: {
                size: 12,
              },
              generateLabels: (chart) => {
                return chart.data.labels?.map((label, i) => ({
                  text: `${label}`,
                  fillStyle: CHART_COLORS[i],
                  strokeStyle: CHART_COLORS[i],
                  lineWidth: 0,
                  hidden: false,
                  index: i,
                })) || []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const domain = topDomains[context.dataIndex]
                return [
                  `Time: ${formatDuration(domain.time)}`,
                  `Visits: ${domain.visits}`,
                ]
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, formatDuration])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data to display
      </div>
    )
  }

  return (
    <div className="relative" style={{ height: '280px' }}>
      <canvas ref={chartRef} aria-label="Time spent by domain chart" role="img" />
    </div>
  )
}
