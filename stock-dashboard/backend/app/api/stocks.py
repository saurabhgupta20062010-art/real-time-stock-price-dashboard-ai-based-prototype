from fastapi import APIRouter, Query, HTTPException

from ..services import quote_service

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/search")
async def search_stocks(q: str = Query(..., min_length=1)):
    try:
        return await quote_service.search(q)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{symbol}/quote")
async def get_quote(symbol: str):
    try:
        return await quote_service.quote(symbol.upper())
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{symbol}/profile")
async def get_profile(symbol: str):
    try:
        return await quote_service.profile(symbol.upper())
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{symbol}/candle")
async def get_candle(symbol: str, resolution: str = "D", days: int = 30):
    try:
        return await quote_service.candle(symbol.upper(), resolution, days)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
