"""Telegram bot: webhook handler (production) and long-polling loop (local: python -m agent.telegram)."""
import asyncio
import html
import logging

import httpx

from . import config, pipeline
from .resolver import detect_lang

log = logging.getLogger("telegram")
API = f"https://api.telegram.org/bot{config.TELEGRAM_TOKEN}"
_http = httpx.AsyncClient(timeout=httpx.Timeout(70, connect=10))

START = """👋 <b>UZEX birja bitimlari bo‘yicha AI-agent</b> / <b>AI-агент по биржевым сделкам UZEX</b>

Savolni o‘zbek (lotin/kirill) yoki rus tilida yozing — javob faqat birja ma’lumotlari asosida beriladi.
Задайте вопрос на русском или узбекском — ответ строится только по данным биржи.

<b>Misollar / Примеры:</b>
• Сколько сделок по карбамиду было в 2025 году?
• 2024-yilda Namangan viloyatida sement savdosi summasi qancha?
• Кто покупатель по сделке 280091 и какая цена за тонну?
• Топ-3 покупателя аммиачной селитры в 2026 году
• STIR 945809173 kompaniyasi nechta bitimda xaridor bo‘lgan?

Ma’lumotlar: 500 000 bitim, 03.01.2022 – 30.10.2026.
/how — qanday ishlaydi / как работает"""

THINK = {"ru": "⏳ Считаю по данным биржи…", "uz": "⏳ Birja ma’lumotlari bo‘yicha hisoblanmoqda…",
         "uz_cyr": "⏳ Биржа маълумотлари бўйича ҳисобланмоқда…"}


async def tg(method: str, **params):
    try:
        r = await _http.post(f"{API}/{method}", json=params)
        d = r.json()
        if not d.get("ok"):
            log.warning("tg %s failed: %s", method, str(d)[:200])
        return d.get("result")
    except httpx.HTTPError as e:
        log.warning("tg %s error: %s", method, e)


def render(res: dict) -> str:
    lines = (res.get("answer") or "").split("\n")
    out = []
    for ln in lines:
        e = html.escape(ln)
        out.append(f"<i>{e}</i>" if ln.startswith("ℹ️") else e)
    text = "\n".join(out)
    if res.get("ms"):
        text += f"\n\n<code>⏱ {res['ms'] / 1000:.1f} s</code>"
    return text


def chunks(text: str, n: int = 3900) -> list[str]:
    out, cur = [], ""
    for ln in text.split("\n"):
        if len(cur) + len(ln) + 1 > n and cur:
            out.append(cur)
            cur = ""
        cur += ("\n" if cur else "") + ln[:n]
    return out + ([cur] if cur else [])


HOW = """⚙️ <b>Qanday ishlaydi / Как работает</b>

1️⃣ Savoldan tovar, viloyat, kompaniya, STIR, bitim raqami aniqlanadi (lug‘at + transliteratsiya, LLM siz).
   Из вопроса извлекаются товар, регион, компания, ИНН, номер сделки (словари + транслитерация, без LLM).
2️⃣ Shu kabi tekshirilgan savollar va ularning SQL yechimlari topiladi (RAG).
   Находятся похожие проверенные вопросы с готовыми SQL-решениями (RAG).
3️⃣ Ikki xil AI-model (Gemini va Groq) mustaqil ravishda SQL so‘rov yozadi.
   Две разные AI-модели (Gemini и Groq) независимо пишут SQL-запрос.
4️⃣ So‘rovlar 500 000 bitimli bazada bajariladi; natijalar solishtiriladi ✓.
   Запросы выполняются по базе из 500 000 сделок; результаты сверяются ✓.
5️⃣ Raqamlar faqat SQL natijasidan qo‘yiladi — model raqam o‘ylab topa olmaydi.
   Числа подставляются только из результата SQL — модель не может выдумать цифры.

Javob ostidagi «🔎» tugmasi hisob-kitob SQL so‘rovini ko‘rsatadi.
Кнопка «🔎» под ответом показывает SQL-запрос расчёта."""

BTN = {"ru": "🔎 Как посчитано", "uz": "🔎 Qanday hisoblandi", "uz_cyr": "🔎 Қандай ҳисобланди"}
_sql_store: dict = {}  # short id -> (sql, verified, model)


async def handle_callback(cb: dict) -> None:
    await tg("answerCallbackQuery", callback_query_id=cb["id"])
    data = cb.get("data", "")
    item = _sql_store.get(data[4:]) if data.startswith("sql:") else None
    chat = cb["message"]["chat"]["id"]
    if not item:
        await tg("sendMessage", chat_id=chat, text="SQL topilmadi / SQL не найден (server qayta ishga tushgan).")
        return
    sql, agreed, model = item
    check = "✅ 2 model natijasi mos keldi / результаты 2 моделей совпали" if agreed else f"model: {model}"
    await tg("sendMessage", chat_id=chat, parse_mode="HTML", reply_to_message_id=cb["message"]["message_id"],
             text=f"<pre>{html.escape(sql)[:3500]}</pre>\n{check}\n<i>DuckDB · 500 000 bitim · 03.01.2022–30.10.2026</i>")


async def handle_update(upd: dict) -> None:
    if upd.get("callback_query"):
        await handle_callback(upd["callback_query"])
        return
    msg = upd.get("message") or upd.get("edited_message")
    if not msg or "text" not in msg:
        return
    chat, text = msg["chat"]["id"], msg["text"].strip()
    if text.startswith("/start") or text.startswith("/help"):
        await tg("sendMessage", chat_id=chat, text=START, parse_mode="HTML")
        return
    if text.startswith("/how"):
        await tg("sendMessage", chat_id=chat, text=HOW, parse_mode="HTML")
        return
    lang = detect_lang(text)
    placeholder = await tg("sendMessage", chat_id=chat, text=THINK[lang], reply_to_message_id=msg["message_id"])
    await tg("sendChatAction", chat_id=chat, action="typing")
    try:
        res = await pipeline.answer(text)
    except Exception:  # never leave the user without a reply
        log.exception("pipeline crashed")
        res = {"answer": pipeline.MSG["fail"][lang]}
    parts = chunks(render(res))
    kb = None
    if res.get("sql"):
        sid = f"{chat % 100000}{len(_sql_store)}"
        _sql_store[sid] = (res["sql"], res.get("agreed"), res.get("model"))
        if len(_sql_store) > 2000:
            _sql_store.pop(next(iter(_sql_store)))
        kb = {"inline_keyboard": [[{"text": BTN[lang], "callback_data": f"sql:{sid}"}]]}
    for i, part in enumerate(parts):
        extra = {"reply_markup": kb} if kb and i == len(parts) - 1 else {}
        if i == 0 and placeholder and await tg("editMessageText", chat_id=chat, message_id=placeholder["message_id"],
                                               text=part, parse_mode="HTML", **extra):
            continue
        await tg("sendMessage", chat_id=chat, text=part, parse_mode="HTML", **extra)


async def set_webhook() -> None:
    url = f"{config.PUBLIC_URL}/tg/{config.TELEGRAM_SECRET}"
    await tg("setWebhook", url=url, secret_token=config.TELEGRAM_SECRET, allowed_updates=["message", "edited_message", "callback_query"],
             drop_pending_updates=True, max_connections=20)
    await tg("setMyCommands", commands=[{"command": "start", "description": "Boshlash / Начать"},
                                        {"command": "help", "description": "Misollar / Примеры"},
                                        {"command": "how", "description": "Qanday ishlaydi / Как работает"}])
    log.info("webhook set to %s/tg/***", config.PUBLIC_URL)


async def poll() -> None:
    await tg("deleteWebhook", drop_pending_updates=False)
    offset = 0
    tasks = set()
    log.info("polling…")
    while True:
        ups = await tg("getUpdates", offset=offset, timeout=50) or []
        for u in ups:
            offset = u["update_id"] + 1
            t = asyncio.create_task(handle_update(u))
            tasks.add(t)
            t.add_done_callback(tasks.discard)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
    asyncio.run(poll())
