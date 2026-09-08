"""Thin async client around the Finnhub REST API.

Only used when FINNHUB_API_KEY is set. If it's not set, app/services/mock.py
is used instead so the app runs out of the box for demos.
"""
import os
import httpx

BASE_URL = "https://finnhub.io/api/v1"


def get_api_key() -> str | None:
    return os.getenv("FINNHUB_API_KEY") or None


def is_live() -> bool:
    return get_api_key() is not None


async def _get(path: str, params: dict) -> dict:
    params = {**params, "token": get_api_key()}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{BASE_URL}{path}", params=params)
        resp.raise_for_status()
        return resp.json()


async def search(query: str) -> list[dict]:
    data = await _get("/search", {"q": query})
    results = []
    for item in data.get("result", [])[:10]:
        results.append(
            {
                "symbol": item.get("symbol"),
                "description": item.get("description"),
                "type": item.get("type"),
                "region": "US",
            }
        )
    return results


async def quote(symbol: str) -> dict:
    data = await _get("/quote", {"symbol": symbol})
    data["symbol"] = symbol
    return data


async def profile(symbol: str) -> dict:
    data = await _get("/stock/profile2", {"symbol": symbol})
    return {
        "symbol": symbol,
        "name": data.get("name"),
        "sector": data.get("finnhubIndustry"),
        "country": data.get("country"),
        "exchange": data.get("exchange"),
        "marketCapitalization": data.get("marketCapitalization"),
        "logo": data.get("logo"),
    }


async def candle(symbol: str, resolution: str, days: int) -> dict:
    import time

    now = int(time.time())
    frm = now - days * 24 * 60 * 60
    data = await _get(
        "/stock/candle",
        {"symbol": symbol, "resolution": resolution, "from": frm, "to": now},
    )
    return data
