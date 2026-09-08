import { useEffect, useRef, useState } from 'react'
import { formatChange, formatPercent, formatPrice } from '../utils/formatters'

export default function StockRow({ item, live, selected, onSelect, onRemove }) {
  const [flash, setFlash] = useState(null)
  const lastPrice = useRef(live?.price)

  useEffect(() => {
    if (live?.price === undefined) return
    if (lastPrice.current !== undefined && live.price !== lastPrice.current) {
      setFlash(live.price > lastPrice.current ? 'flash-up' : 'flash-down')
      const t = setTimeout(() => setFlash(null), 600)
      lastPrice.current = live.price
      return () => clearTimeout(t)
    }
    lastPrice.current = live.price
  }, [live?.price])

  const changePositive = (live?.change ?? 0) >= 0

  return (
    <div
      className={`stock-row ${selected ? 'selected' : ''} ${flash || ''}`}
      onClick={() => onSelect(item.symbol)}
    >
      <div className="left">
        <span className="sym">{item.symbol}</span>
        <span className="name">{item.name}</span>
      </div>
      <div className="right">
        <span className="price">{live ? formatPrice(live.price) : '···'}</span>
        {live && (
          <span className={`change ${changePositive ? 'up' : 'down'}`}>
            {formatChange(live.change)} ({formatPercent(live.changePercent)})
          </span>
        )}
      </div>
      <button
        className="remove-btn"
        title="Remove from watchlist"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(item.symbol)
        }}
      >
        ×
      </button>
    </div>
  )
}
