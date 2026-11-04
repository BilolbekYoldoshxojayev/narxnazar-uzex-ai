"""FastAPI service: web chat, JSON API, Telegram webhook, health.  uvicorn agent.app:app"""
import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel

from . import config, pipeline, telegram

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logging.getLogger("httpx").setLevel(logging.WARNING)
WEB = Path(__file__).resolve().parents[1] / "web" / "index.html"
_tasks: set = set()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if config.TELEGRAM_TOKEN and config.PUBLIC_URL:
        await telegram.set_webhook()
    yield


app = FastAPI(title="UZEX AI Agent", lifespan=lifespan)


class Ask(BaseModel):
    question: str


@app.get("/")
async def index():
    return FileResponse(WEB)


@app.get("/health")
@app.head("/health")
async def health():
    return {"ok": True}


@app.post("/api/ask")
async def ask(body: Ask):
    if not body.question.strip():
        raise HTTPException(400, "empty question")
    res = await pipeline.answer(body.question)
    return {k: res.get(k) for k in ("answer", "sql", "lang", "ms", "model", "agreed", "ok", "cached")}


@app.post("/tg/{secret}")
async def tg_webhook(secret: str, request: Request,
                     x_telegram_bot_api_secret_token: str | None = Header(default=None)):
    if secret != config.TELEGRAM_SECRET or x_telegram_bot_api_secret_token != config.TELEGRAM_SECRET:
        raise HTTPException(403)
    upd = await request.json()
    t = asyncio.create_task(telegram.handle_update(upd))  # reply asynchronously, ack Telegram at once
    _tasks.add(t)
    t.add_done_callback(_tasks.discard)
    return {"ok": True}
