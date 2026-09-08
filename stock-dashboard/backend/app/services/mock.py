"""Simulated market data so the app is fully demoable without any API key.

Prices follow a small random walk per symbol, seeded from a base price so
repeated calls for the same symbol stay internally consistent within one
server run.
"""
import random
import time

_COMPANY_NAMES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com, Inc.",
    "TSLA": "Tesla, Inc.",
    "NVDA": "NVIDIA Corporation",
    "META": "Meta Platforms, Inc.",
    "NFLX": "Netflix, Inc.",
    "AMD": "Advanced Micro Devices, Inc.",
    "INTC": "Intel Corporation",
}

_SECTORS = ["Technology", "Consumer Cyclical", "Communication Services", "Semiconductors"]

# in-memory state: symbol -> current price
_state: dict[str, float] = {}
# in-memory state: symbol -> today's open/high/low
_day_state: dict[str, dict] = {}


def _base_price(symbol: str) -> float:
    # Deterministic-ish base price derived from the symbol so it looks sane.
    seed = sum(ord(c) for c in symbol)
    random.seed(seed)
    return round(random.uniform(20, 450), 2)


def _ensure(symbol: str) -> float:
    if symbol not in _state:
        base = _base_price(symbol)
        _state[symbol] = base
        _day_state[symbol] = {"o": base, "h": base, "l": base, "pc": base * random.uniform(0.97, 1.03)}
    return _state[symbol]


def step(symbol: str) -> float:
    """Advance the random walk one tick and return the new price."""
    _ensure(symbol)
    price = _state[symbol]
    pct_move = random.uniform(-0.006, 0.006)
    price = max(0.5, round(price * (1 + pct_move), 2))
    _state[symbol] = price
    day = _day_state[symbol]
    day["h"] = max(day["h"], price)
    day["l"] = min(day["l"], price)
    return price


def search(query: str) -> list[dict]:
    query = query.strip().upper()
    results = []
    for symbol, name in _COMPANY_NAMES.items():
        if query in symbol or query.lower() in name.lower():
            results.append({"symbol": symbol, "description": name, "type": "Common Stock", "region": "US"})
    if not results and query:
        # Unknown ticker typed directly - still let the demo work.
        results.append({"symbol": query, "description": f"{query} (simulated)", "type": "Common Stock", "region": "US"})
    return results[:10]


def quote(symbol: str) -> dict:
    price = step(symbol)
    day = _day_state[symbol]
    return {
        "symbol": symbol,
        "c": price,
        "h": round(day["h"], 2),
        "l": round(day["l"], 2),
        "o": round(day["o"], 2),
        "pc": round(day["pc"], 2),
        "t": int(time.time()),
    }


def profile(symbol: str) -> dict:
    seed = sum(ord(c) for c in symbol)
    random.seed(seed + 1)
    return {
        "symbol": symbol,
        "name": _COMPANY_NAMES.get(symbol, f"{symbol} (simulated)"),
        "sector": random.choice(_SECTORS),
        "country": "US",
        "exchange": "NASDAQ (simulated)",
        "marketCapitalization": round(random.uniform(5000, 3000000), 0),
        "logo": None,
    }


def candle(symbol: str, resolution: str, days: int) -> dict:
    _ensure(symbol)
    base = _state[symbol]
    seed = sum(ord(c) for c in symbol)
    random.seed(seed + 2)
    points = max(days, 5)
    now = int(time.time())
    day_seconds = 24 * 60 * 60
    ts, opens, highs, lows, closes, vols = [], [], [], [], [], []
    price = base * random.uniform(0.85, 1.15)
    for i in range(points):
        t = now - (points - i) * day_seconds
        o = price
        pct = random.uniform(-0.02, 0.02)
        c = max(0.5, round(o * (1 + pct), 2))
        h = round(max(o, c) * random.uniform(1.0, 1.01), 2)
        l = round(min(o, c) * random.uniform(0.99, 1.0), 2)
        v = random.randint(1_000_000, 80_000_000)
        ts.append(t)
        opens.append(round(o, 2))
        highs.append(h)
        lows.append(l)
        closes.append(c)
        vols.append(v)
        price = c
    return {"t": ts, "o": opens, "h": highs, "l": lows, "c": closes, "v": vols, "s": "ok"}
