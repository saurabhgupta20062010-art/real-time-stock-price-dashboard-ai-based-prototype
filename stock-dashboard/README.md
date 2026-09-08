# Ticker — Real-Time Stock Dashboard

React + Chart.js frontend, FastAPI + WebSocket backend. Runs out of the box
in **mock mode** (simulated prices, no API key needed) so you can demo it
immediately, and switches to **live mode** the moment you add a free
Finnhub API key.

## What's included

- Search for a symbol, add it to a watchlist (persisted in `localStorage`)
- Live-updating prices over a WebSocket, with a green/red flash on change
- Click a stock to see a detail panel: open/high/low/prev close, volume,
  market cap, sector, and a 30-day Chart.js line chart
- Mock mode: a per-symbol random walk simulates realistic-looking price
  movement so the whole thing works without signing up for anything

This matches the Week 1–4 MVP from the PRD: search → watchlist → real-time
updates → detail + chart. Week 5–6 items (auth, DB-backed watchlist,
deployment) are intentionally left out — see "Where to go next" below.

## Running it

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # leave FINNHUB_API_KEY blank for mock mode
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/api/health` — it should report
`{"status": "ok", "mode": "mock"}`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

### Switching to live data

1. Get a free key at https://finnhub.io/register (60 calls/min free tier).
2. Put it in `backend/.env` as `FINNHUB_API_KEY=your_key_here`.
3. Restart the backend. The header dot turns green and the badge switches
   to "Live data" once it picks up the key.

Note the free Finnhub tier covers US-listed common stock only, and quotes
are slightly delayed rather than tick-by-tick — fine for a demo, worth
knowing if you present it as literally real-time.

## Project structure

```
backend/
  app/
    main.py               # FastAPI app, CORS, WebSocket endpoint
    api/stocks.py          # REST routes: search, quote, profile, candle
    services/
      finnhub.py           # Real Finnhub client (used when a key is set)
      mock.py               # Simulated data (used when no key is set)
      quote_service.py     # Picks live vs mock, runs the broadcast loop
    models/schemas.py      # Pydantic response shapes
frontend/
  src/
    App.jsx
    components/
      SearchBar.jsx
      Watchlist.jsx
      StockRow.jsx
      StockDetail.jsx
      StockChart.jsx
    hooks/useStockQuotesWebSocket.js
    services/api.js
    utils/formatters.js
```

## How the real-time piece works

The backend doesn't stream raw exchange data — it polls Finnhub (or the
mock generator) every 3 seconds for whatever symbols currently have an
active WebSocket subscriber, and broadcasts the deltas. This is the
"poll backend → push via WebSocket" pattern from the PRD: much simpler to
build and debug than true streaming, and indistinguishable from it in a
demo.

`SubscriptionManager` in `quote_service.py` tracks `symbol -> set of
websockets`, so the poll loop only fetches symbols someone is actually
watching.

## Where to go next (Week 5–6 in the original plan)

- Swap `localStorage` for a real watchlist table once you add auth (JWT +
  Postgres is the natural next step)
- Add a top gainers/losers panel using the same `quote_service`
- Deploy: Railway/Render for the FastAPI backend, Vercel/Netlify for the
  Vite frontend — just point `VITE_API_URL` at the deployed backend URL
- If you add Indian tickers, Finnhub's free WebSocket doesn't cover
  NSE/BSE well — you'll want a second data source for those
