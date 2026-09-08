import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function StockChart({ candle }) {
  const { labels, data, isUp } = useMemo(() => {
    if (!candle || candle.s !== 'ok' || !candle.c?.length) {
      return { labels: [], data: [], isUp: true }
    }
    const labels = candle.t.map((t) =>
      new Date(t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )
    const data = candle.c
    const isUp = data[data.length - 1] >= data[0]
    return { labels, data, isUp }
  }, [candle])

  if (!data.length) {
    return <div className="placeholder">No historical data available for this symbol yet.</div>
  }

  const lineColor = isUp ? '#2fbf71' : '#f2545b'

  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: lineColor,
        backgroundColor: (ctx) => {
          const { chart } = ctx
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return 'transparent'
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, isUp ? 'rgba(47,191,113,0.25)' : 'rgba(242,84,91,0.25)')
          gradient.addColorStop(1, 'rgba(0,0,0,0)')
          return gradient
        },
        borderWidth: 1.75,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.15,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#141b25',
        borderColor: '#212b38',
        borderWidth: 1,
        titleFont: { family: 'IBM Plex Mono', size: 11 },
        bodyFont: { family: 'IBM Plex Mono', size: 12 },
        padding: 8,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7785', font: { family: 'IBM Plex Mono', size: 10 }, maxTicksLimit: 6 },
      },
      y: {
        position: 'right',
        grid: { color: '#1a222c' },
        ticks: {
          color: '#6b7785',
          font: { family: 'IBM Plex Mono', size: 10 },
          callback: (v) => `$${v}`,
        },
      },
    },
    interaction: { mode: 'index', intersect: false },
  }

  return <Line data={chartData} options={options} />
}
