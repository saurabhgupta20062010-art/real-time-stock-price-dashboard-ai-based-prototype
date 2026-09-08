import json
import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .api.stocks import router as stocks_router
from .services import finnhub
from .services.quote_service import manager

app = FastAPI(title="Stock Dashboard API")

# Comma-separated list of allowed frontend origins, e.g.
# "http://localhost:5173,https://your-app.vercel.app"
# Defaults to localhost so local dev keeps working with no setup.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
_origins = os.getenv("CORS_ORIGINS", _default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks_router)


@app.on_event("startup")
async def startup():
    manager.start()


@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": "live" if finnhub.is_live() else "mock"}


@app.websocket("/ws/quotes")
async def ws_quotes(websocket: WebSocket):
    await websocket.accept()
    subscribed: list[str] = []
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            action = msg.get("action")
            symbols = [s.upper() for s in msg.get("symbols", [])]

            if action == "subscribe":
                manager.subscribe(websocket, symbols)
                subscribed = list(set(subscribed) | set(symbols))
            elif action == "unsubscribe":
                manager.unsubscribe(websocket, symbols)
                subscribed = [s for s in subscribed if s not in symbols]
    except WebSocketDisconnect:
        manager.remove_all(websocket)
