export function formatPrice(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatChange(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatPrice(value)}`
}

export function formatPercent(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatVolume(value) {
  if (!value) return '—'
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${value}`
}

export function formatMarketCap(value) {
  // Finnhub returns market cap in millions of USD
  if (!value) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}T`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}B`
  return `$${value.toFixed(0)}M`
}
