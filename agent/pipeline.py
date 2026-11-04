"""Question -> answer: resolve entities, two independent LLM drafts, execute, cross-check, arbitrate, render."""
import asyncio
import datetime as dt
import json
import logging
import math
import time
from collections import OrderedDict

from . import config, db, llm, prompt
from .format import fill, fmt, leftover
from .resolver import detect_lang, resolve
from .textnorm import text_key

log = logging.getLogger("pipeline")
_cache: OrderedDict = OrderedDict()

MSG = {
    "fail": {"ru": "Не удалось получить ответ, попробуйте переформулировать вопрос.",
             "uz": "Javob olinmadi, savolni boshqacha ifodalab ko‘ring.",
             "uz_cyr": "Жавоб олинмади, саволни бошқача ифодалаб кўринг."},
    "nodata": {"ru": "В данных биржи нет информации для ответа на этот вопрос.",
               "uz": "Birja ma’lumotlarida bu savolga javob beradigan ma’lumot yo‘q.",
               "uz_cyr": "Биржа маълумотларида бу саволга жавоб берадиган маълумот йўқ."},
}


def _today() -> str:
    return dt.date.today().strftime("%d.%m.%Y")


# ---------------- execution ----------------
def _run(plan: dict) -> dict:
    """Execute a plan; returns plan enriched with cols/rows/err."""
    out = dict(plan)
    if plan.get("kind") != "sql" or not plan.get("sql"):
        return out
    try:
        cols, rows = db.query(plan["sql"])
        out["cols"], out["rows"] = cols, rows
    except db.SQLError as e:
        out["err"] = str(e)
    return out


def _sig(p: dict):
    if p.get("kind") != "sql":
        return ("kind", p.get("kind"))
    if "err" in p:
        return None

    def norm(v):
        if isinstance(v, float):
            return float(f"{v:.6g}") if math.isfinite(v) else None
        if hasattr(v, "is_finite"):
            return float(f"{float(v):.6g}")
        return v if isinstance(v, (int, str, bool)) or v is None else str(v)
    # compare as multisets of values, ignoring column names/order
    rows = [tuple(sorted((norm(v) for v in r), key=repr)) for r in p["rows"]]
    return tuple(sorted(rows, key=repr))


def _agree(a: dict, b: dict) -> bool:
    """Same answer: equal kinds; for SQL, same row count and each row's values of one draft contained in the other's
    (one draft may return extra helper columns such as cancelled counts)."""
    sa, sb = _sig(a), _sig(b)
    if sa is None or sb is None:
        return False
    if sa == sb:
        return True
    if a.get("kind") != "sql" or b.get("kind") != "sql" or len(a["rows"]) != len(b["rows"]) or not a["rows"]:
        return False
    pairs = list(zip(sa, sb))
    return all(set(x) <= set(y) or set(y) <= set(x) for x, y in pairs) and any(
        any(isinstance(v, (int, float)) for v in (x if len(x) <= len(y) else y)) for x, y in pairs)


def _empty(p: dict) -> bool:
    if p.get("kind") != "sql" or "err" in p:
        return False
    rows, cols = p.get("rows") or [], [c.lower() for c in p.get("cols", [])]
    if not rows:
        return True
    if "_found" in cols and not rows[0][cols.index("_found")]:
        return True
    return all(v is None for r in rows for v in r)


def _result_text(p: dict, limit: int = 8) -> str:
    if "err" in p:
        return f"ERROR: {p['err']}"
    cols, rows = p.get("cols", []), p.get("rows", [])
    lines = [" | ".join(cols)] + [" | ".join(str(v) for v in r) for r in rows[:limit]]
    return "\n".join(lines) + (f"\n... ({len(rows)} rows)" if len(rows) > limit else "")


async def _draft(user: str, prefer: str, deadline: float, offset: int = 0):
    try:
        plan = await llm.complete(prompt.SYSTEM, user, prefer, deadline, offset)
    except llm.LLMError as e:
        log.warning("draft %s failed: %s", prefer, e)
        return None
    p = await asyncio.to_thread(_run, plan)
    if "err" in p and time.time() < deadline - 5:  # one repair round with the error message
        fix = user + f"\n\nYour previous SQL:\n{p['sql']}\nfailed with: {p['err']}\nReturn corrected JSON."
        try:
            plan2 = await llm.complete(prompt.SYSTEM, fix, plan["_model"].split("/")[0], deadline)
            p2 = await asyncio.to_thread(_run, plan2)
            if "err" not in p2:
                return p2
        except llm.LLMError:
            pass
    return p


async def _arbitrate(user: str, a: dict, b: dict, deadline: float):
    msg = (user + "\n\nANALYST A JSON:\n" + json.dumps({k: a.get(k) for k in ("kind", "sql")}, ensure_ascii=False)
           + "\nA RESULT:\n" + _result_text(a)
           + "\n\nANALYST B JSON:\n" + json.dumps({k: b.get(k) for k in ("kind", "sql")}, ensure_ascii=False)
           + "\nB RESULT:\n" + _result_text(b))
    try:
        plan = await llm.complete(prompt.ARBITER_SYSTEM, msg, config.ARBITER, deadline)
    except llm.LLMError as e:
        log.warning("arbiter failed: %s", e)
        return None
    p = await asyncio.to_thread(_run, plan)
    return None if "err" in p else p


# ---------------- rendering ----------------
def _render(p: dict, lang: str) -> str:
    kind = p.get("kind")
    if kind in ("text", "no_data"):
        return (p.get("answer") or MSG["nodata"][lang]).strip()
    if _empty(p):
        return (p.get("nodata") or MSG["nodata"][lang]).strip()
    cols, rows = p["cols"], p["rows"]
    first = dict(zip(cols, rows[0]))
    tmpl_row = (p.get("row") or "").strip()
    parts = []
    if tmpl_row:
        parts.append(fill(p.get("answer", ""), first, lang))
        for i, r in enumerate(rows[:20], 1):
            parts.append(fill(tmpl_row, dict(zip(cols, r)), lang, i))
    else:
        parts.append(fill(p.get("answer", ""), first, lang))
        if len(rows) > 1:  # template expected one row but got many: list the rest generically
            for i, r in enumerate(rows[1:20], 2):
                parts.append(f"{i}. " + ", ".join(fmt(v, c, lang) for c, v in zip(cols, r)))
    text = "\n".join(x for x in parts if x)
    if leftover(text):  # unknown placeholders: fall back to a plain table so no number is lost
        text = "\n".join(", ".join(f"{c}: {fmt(v, c, lang)}" for c, v in zip(cols, r)) for r in rows[:20])
    note = fill(p.get("note") or "", first, lang).strip()
    if note and not leftover(note):
        text += "\nℹ️ " + note
    return text


# ---------------- main entry ----------------
async def answer(question: str) -> dict:
    t0 = time.time()
    q = question.strip()[:1000]
    lang = detect_lang(q)
    key = text_key(q) + "|" + _today()
    if key in _cache:
        return {**_cache[key], "cached": True, "ms": int((time.time() - t0) * 1000)}

    hints = await asyncio.to_thread(resolve, q)
    user = prompt.user_message(q, lang, hints, _today())
    deadline = t0 + config.TOTAL_BUDGET
    draft_deadline = t0 + config.TOTAL_BUDGET * 0.55

    providers = [p for p in llm.POOLS if llm.available(p)]
    if not providers:
        return {"answer": "LLM API keys are not configured.", "lang": lang, "ok": False}
    if config.DUAL:  # two independent drafts: different providers if possible, else different models
        pa, pb = providers[0], providers[1] if len(providers) > 1 else providers[0]
        ta = asyncio.create_task(_draft(user, pa, draft_deadline))
        tb = asyncio.create_task(_draft(user, pb, draft_deadline, offset=0 if pb != pa else 1))
        done, pending = await asyncio.wait({ta, tb}, return_when=asyncio.FIRST_COMPLETED)
        first = next(iter(done)).result()
        if pending and first and "err" not in first:  # good first draft: give the second a short grace period
            _, pending = await asyncio.wait(pending, timeout=config.SECOND_GRACE)
        elif pending:
            _, pending = await asyncio.wait(pending)
        for t in pending:
            t.cancel()
        a = ta.result() if ta.done() and not ta.cancelled() else None
        b = tb.result() if tb.done() and not tb.cancelled() else None
    else:
        a, b = await _draft(user, providers[0], draft_deadline), None

    chosen, agreed = None, False
    ok = [p for p in (a, b) if p and "err" not in p]
    if len(ok) == 2:
        if _agree(a, b):  # prefer the richer draft (more columns = breakdown of both interpretations)
            chosen, agreed = (a if len(a.get("cols", [])) >= len(b.get("cols", [])) else b), True
        else:
            chosen = await _arbitrate(user, a, b, deadline) or a
    elif ok:
        chosen = ok[0]
    if chosen is None:
        res = {"answer": MSG["fail"][lang], "lang": lang, "ok": False, "ms": int((time.time() - t0) * 1000)}
        return res

    text = _render(chosen, lang)
    res = {"answer": text, "lang": lang, "ok": True, "agreed": agreed, "sql": chosen.get("sql", ""),
           "model": chosen.get("_model"), "hints": hints,
           "drafts": [{"model": p.get("_model"), "sql": p.get("sql"), "err": p.get("err")} for p in (a, b) if p],
           "ms": int((time.time() - t0) * 1000)}
    _cache[key] = res
    if len(_cache) > 500:
        _cache.popitem(last=False)
    return res
