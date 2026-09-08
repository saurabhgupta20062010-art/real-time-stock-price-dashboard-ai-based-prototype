import { useEffect, useMemo, useState } from 'react'
import SearchBar from './components/SearchBar'
import Watchlist from './components/Watchlist'
import StockDetail from './components/StockDetail'
import { useStockQuotesWebSocket } from './hooks/useStockQuotesWebSocket'
import { api } from './services/api'

const STORAGE_KEY = 'stock-dashboard:watchlist'

const DEFAULT_WATCHLIST = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
]

function loadWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fall through to default
  }
  return DEFAULT_WATCHLIST
}

export default function App() {
  const [watchlist, setWatchlist] = useState(loadWatchlist)
  const [selectedSymbol, setSelectedSymbol] = useState(watchlist[0]?.symbol ?? null)
  const [mode, setMode] = useState(null) // 'live' | 'mock'

  const symbols = useMemo(() => watchlist.map((w) => w.symbol), [watchlist])
  const quotes = useStockQuotesWebSocket(symbols)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    api
      .health()
      .then((r) => setMode(r.mode))
      .catch(() => setMode(null))
  }, [])

  function handleAdd(result) {
    setWatchlist((prev) => {
      if (prev.some((p) => p.symbol === result.symbol)) return prev
      return [...prev, { symbol: result.symbol, name: result.description }]
    })
    setSelectedSymbol(result.symbol)
  }

  function handleRemove(symbol) {
    setWatchlist((prev) => prev.filter((p) => p.symbol !== symbol))
    setSelectedSymbol((prev) => (prev === symbol ? null : prev))
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className={`dot ${mode === 'live' ? 'live' : 'mock'}`} />
          Ticker
        </div>
        <SearchBar onAdd={handleAdd} existingSymbols={symbols} />
        {mode && (
          <span className="mode-label">{mode === 'live' ? 'Live data' : 'Simulated data'}</span>
        )}
      </header>

      <div className="main">
        <div className="watchlist-pane">
          <Watchlist
            items={watchlist}
            quotes={quotes}
            selectedSymbol={selectedSymbol}
            onSelect={setSelectedSymbol}
            onRemove={handleRemove}
          />
        </div>
        <div className="detail-pane">
          {selectedSymbol ? (
            <StockDetail symbol={selectedSymbol} live={quotes[selectedSymbol]} />
          ) : (
            <div className="placeholder">Select a stock from the watchlist to see details.</div>
          )}
        </div>
      </div>
    </div>
  )
}
