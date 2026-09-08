import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_URL } from '../services/api'

/**
 * Maintains a single WebSocket connection to /ws/quotes.
 * `symbols` is the list of tickers currently on screen; the hook keeps the
 * server-side subscription in sync as that list changes, and reconnects
 * automatically if the socket drops.
 *
 * Returns a map of symbol -> { price, change, changePercent, timestamp }.
 */
export function useStockQuotesWebSocket(symbols) {
  const [quotes, setQuotes] = useState({})
  const wsRef = useRef(null)
  const subscribedRef = useRef(new Set())
  const symbolsRef = useRef(symbols)
  symbolsRef.current = symbols

  const send = useCallback((payload) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let reconnectTimer

    function connect() {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) return
        const current = symbolsRef.current
        if (current.length) {
          subscribedRef.current = new Set(current)
          send({ action: 'subscribe', symbols: current })
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setQuotes((prev) => ({ ...prev, [data.symbol]: data }))
        } catch {
          // ignore malformed frames
        }
      }

      ws.onclose = () => {
        if (cancelled) return
        reconnectTimer = setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep server-side subscription in sync when the watchlist changes.
  useEffect(() => {
    const wanted = new Set(symbols)
    const current = subscribedRef.current

    const toAdd = [...wanted].filter((s) => !current.has(s))
    const toRemove = [...current].filter((s) => !wanted.has(s))

    if (toAdd.length) send({ action: 'subscribe', symbols: toAdd })
    if (toRemove.length) send({ action: 'unsubscribe', symbols: toRemove })

    subscribedRef.current = wanted
  }, [symbols, send])

  return quotes
}
