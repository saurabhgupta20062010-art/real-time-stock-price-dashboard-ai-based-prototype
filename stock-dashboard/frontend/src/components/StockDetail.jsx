import { useEffect, useState } from 'react'
import { api } from '../services/api'
import StockChart from './StockChart'
import {
  formatChange,
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatVolume,
} from '../utils/formatters'

export default function StockDetail({ symbol, live }) {
  const [profile, setProfile] = useState(null)
  const [quote, setQuote] = useState(null)
  const [candle, setCandle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setProfile(null)
    setQuote(null)
    setCandle(null)

    Promise.all([api.profile(symbol), api.quote(symbol), api.candle(symbol, 'D', 30)])
      .then(([p, q, c]) => {
        if (cancelled) return
        setProfile(p)
        setQuote(q)
        setCandle(c)
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [symbol])

  if (loading) {
    return <div className="placeholder">Loading {symbol}…</div>
  }

  const price = live?.price ?? quote?.c
  const change = live?.change ?? (quote ? quote.c - quote.pc : undefined)
  const changePercent =
    live?.changePercent ?? (quote?.pc ? ((quote.c - quote.pc) / quote.pc) * 100 : undefined)
  const positive = (change ?? 0) >= 0

  return (
    <div>
      <div className="detail-header">
        <div className="detail-title">
          <div className="sym">{symbol}</div>
          <div className="name">{profile?.name || '—'}</div>
        </div>
        <div className="detail-price">
          <div className="value">${formatPrice(price)}</div>
          <div className={`delta ${positive ? 'up' : 'down'}`}>
            {formatChange(change)} ({formatPercent(changePercent)})
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCell label="Open" value={quote ? `$${formatPrice(quote.o)}` : '—'} />
        <StatCell label="High" value={quote ? `$${formatPrice(quote.h)}` : '—'} />
        <StatCell label="Low" value={quote ? `$${formatPrice(quote.l)}` : '—'} />
        <StatCell label="Prev close" value={quote ? `$${formatPrice(quote.pc)}` : '—'} />
        <StatCell
          label="Volume"
          value={candle?.v?.length ? formatVolume(candle.v[candle.v.length - 1]) : '—'}
        />
        <StatCell label="Market cap" value={formatMarketCap(profile?.marketCapitalization)} />
        <StatCell label="Sector" value={profile?.sector || '—'} />
        <StatCell label="Exchange" value={profile?.exchange || '—'} />
      </div>

      <div className="chart-wrap">
        <StockChart candle={candle} />
      </div>
    </div>
  )
}

function StatCell({ label, value }) {
  return (
    <div className="stat-cell">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}
