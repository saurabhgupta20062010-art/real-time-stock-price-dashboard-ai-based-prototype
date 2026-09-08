import asyncio
import time
from fastapi import WebSocket

from . import finnhub, mock

POLL_INTERVAL_SECONDS = 3


async def search(query: str) -> list[dict]:
    if finnhub.is_live():
        return await finnhub.search(query)
    return mock.search(query)


async def quote(symbol: str) -> dict:
    if finnhub.is_live():
        return await finnhub.quote(symbol)
    return mock.quote(symbol)


async def profile(symbol: str) -> dict:
    if finnhub.is_live():
        return await finnhub.profile(symbol)
    return mock.profile(symbol)


async def candle(symbol: str, resolution: str, days: int) -> dict:
    if finnhub.is_live():
        return await finnhub.candle(symbol, resolution, days)
    return mock.candle(symbol, resolution, days)


class SubscriptionManager:
    """Tracks which websockets are subscribed to which symbols and
    broadcasts fresh quotes to them on a fixed interval."""

    def __init__(self):
        # symbol -> set of websockets
        self._subs: dict[str, set[WebSocket]] = {}
        self._prev_price: dict[str, float] = {}
        self._loop_task: asyncio.Task | None = None

    def subscribe(self, ws: WebSocket, symbols: list[str]):
        for symbol in symbols:
            self._subs.setdefault(symbol.upper(), set()).add(ws)

    def unsubscribe(self, ws: WebSocket, symbols: list[str]):
        for symbol in symbols:
            if symbol.upper() in self._subs:
                self._subs[symbol.upper()].discard(ws)

    def remove_all(self, ws: WebSocket):
        for symbol in list(self._subs.keys()):
            self._subs[symbol].discard(ws)

    def start(self):
        if self._loop_task is None:
            self._loop_task = asyncio.create_task(self._broadcast_loop())

    async def _broadcast_loop(self):
        while True:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            symbols = [s for s, subs in self._subs.items() if subs]
            for symbol in symbols:
                try:
                    q = await quote(symbol)
                except Exception:
                    continue
                prev = self._prev_price.get(symbol, q["pc"])
                change = round(q["c"] - q["pc"], 2)
                change_pct = round((change / q["pc"]) * 100, 2) if q["pc"] else 0.0
                self._prev_price[symbol] = q["c"]
                payload = {
                    "symbol": symbol,
                    "price": q["c"],
                    "change": change,
                    "changePercent": change_pct,
                    "timestamp": int(time.time()),
                }
                dead = []
                for ws in self._subs.get(symbol, set()):
                    try:
                        await ws.send_json(payload)
                    except Exception:
                        dead.append(ws)
                for ws in dead:
                    self._subs[symbol].discard(ws)


manager = SubscriptionManager()
