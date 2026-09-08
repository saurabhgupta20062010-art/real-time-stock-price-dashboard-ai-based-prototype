import StockRow from './StockRow'

export default function Watchlist({ items, quotes, selectedSymbol, onSelect, onRemove }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        Your watchlist is empty. Search above for a symbol like AAPL or TSLA to add it.
      </div>
    )
  }

  return (
    <div>
      <div className="watchlist-header">
        <span>Symbol</span>
        <span>Price</span>
      </div>
      {items.map((item) => (
        <StockRow
          key={item.symbol}
          item={item}
          live={quotes[item.symbol]}
          selected={item.symbol === selectedSymbol}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
