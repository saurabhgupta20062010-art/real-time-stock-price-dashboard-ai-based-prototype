from pydantic import BaseModel
from typing import Optional, List


class SearchResult(BaseModel):
    symbol: str
    description: str
    type: Optional[str] = None
    region: Optional[str] = None


class Quote(BaseModel):
    symbol: str
    c: float  # current price
    h: float  # high of the day
    l: float  # low of the day
    o: float  # open price
    pc: float  # previous close
    t: Optional[int] = None  # timestamp


class Profile(BaseModel):
    symbol: str
    name: Optional[str] = None
    sector: Optional[str] = None
    country: Optional[str] = None
    exchange: Optional[str] = None
    marketCapitalization: Optional[float] = None
    logo: Optional[str] = None


class Candle(BaseModel):
    t: List[int]
    o: List[float]
    h: List[float]
    l: List[float]
    c: List[float]
    v: List[float]
    s: str  # status: "ok" or "no_data"
