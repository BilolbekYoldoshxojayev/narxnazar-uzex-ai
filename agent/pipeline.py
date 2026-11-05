"""Question -> answer: resolve entities, two independent LLM drafts, execute, cross-check, arbitrate, render."""
import asyncio
import datetime as dt
import json
import logging
import math
import re
import time
from collections import OrderedDict

from . import config, db, llm, prompt
from .format import fill, fmt, leftover, ru_agree
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


MSG["years"] = {"ru": "Данных за {y} нет: реестр биржи охватывает только период 03.01.2022 – 30.10.2026.",
                "uz": "{y} uchun ma’lumot yo‘q: birja reyestri faqat 03.01.2022 – 30.10.2026 davrini qamraydi.",
                "uz_cyr": "{y} учун маълумот йўқ: биржа реестри фақат 03.01.2022 – 30.10.2026 даврини қамрайди."}
_YEAR_RE = re.compile(r"(?<![\d.,№#])(?<!№ )((?:19|20)\d\d)(?![\d.,]\d)"
                      r"(?!\s*(?:сум|сўм|so|usd|\$|тонн|ton|кг|kg|литр|litr|шт|dona|ta\b|%|лот|lot))", re.IGNORECASE)
_RANGE_RE = re.compile(r"(?i)(?:^|\W)(?:с|со|по|до|после|между|начиная|since|from|until|before|after|between)\s|"
                       r"(?:dan|gacha|buyon|beri|keyin|oldin|дан|гача|буён|бери|кейин|олдин)\b|\d\s*[-–—]\s*\d")


def _out_of_range_years(q: str) -> list[str]:
    """Years mentioned in the question when ALL of them are outside the data (2022-2026) and no range is asked."""
    ys = _YEAR_RE.findall(q)
    if not ys or any(2022 <= int(y) <= 2026 for y in ys) or _RANGE_RE.search(q):
        return []
    return sorted(set(ys))


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
    if _unfiltered_sum(plan["sql"]):
        out["err"] = LINT + "sums of money/volume must exclude cancelled deals (FILTER (WHERE NOT is_cancelled))"
    sql = plan["sql"]
    if (re.search(r"(?i)\bsum\s*\(\s*(delivered_)?volume\s*\)", sql)
            and not re.search(r"(?i)group\s+by[\s\S]*\bunit\b|\bunit\s*(=|in\b)", sql)
            and (not re.search(r"(?i)\bproduct\s*(=|in\b)", sql) or any(m in sql for m in _MULTI_UNIT))):
        out["err"] = LINT + "volumes of different units (тонна/литр/...) must not be added: GROUP BY unit or filter unit"
    return out


_GLOBAL_FILTER = re.compile(r"(?i)\b(where|and)\s+(\(\s*)?((not\s+)?is_cancelled|status\s*(=|in\b|<>|!=))")
_FILTER_CLAUSE = re.compile(r"(?i)filter\s*\(\s*where[^)]*\)")


def _unfiltered_sum(sql: str) -> bool:
    """A money/volume sum that is neither under a query-level is_cancelled/status filter nor has its own FILTER."""
    if _GLOBAL_FILTER.search(_FILTER_CLAUSE.sub(" ", sql)):
        return False
    filtered = unfiltered = 0
    for m in _SUM_RE.finditer(sql):
        tail = sql[m.end():m.end() + 160]
        close = tail.find(")")
        after = tail[close + 1:close + 80] if close >= 0 else ""
        if re.match(r"(?i)\s*filter\s*\(\s*where[^)]*(is_cancelled|status)", after):
            filtered += 1
        else:
            unfiltered += 1
    return unfiltered > 0 and filtered == 0  # an extra "incl. cancelled" variant next to a filtered one is fine


_MULTI_UNIT = [r[0] for r in db.raw("SELECT product FROM deals GROUP BY 1 HAVING count(DISTINCT unit) > 1")]


LINT = "lint: "
_SUM_RE = re.compile(r"(?i)\b(sum|avg)\s*\(\s*(amount\w*|volume|delivered_volume)\b")


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
    if p.get("err", "").startswith(LINT):  # repair failed: keep the executed result rather than lose the answer
        p.pop("err")
        p["_lint"] = True
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
_NUM_RE = re.compile(r"\d{2}\.\d{2}\.\d{4}|\d+(?:[.,]\d+)?")
_ALWAYS_OK = {"0", "1", "2", "3", "4", "5", "10", "20", "50", "100", "2022", "2023", "2024", "2025", "2026",
              "03.01.2022", "30.10.2026", "01.01.2022", "500", "000", "92", "95", "80"}


def _invented_numbers(p: dict, question: str) -> list[str]:
    """Numbers written by the model itself (template prose / free text) that do not come from the question.
    Data numbers must arrive only through {placeholders} filled from the SQL result."""
    texts = [p.get("answer") or "", p.get("row") or "", p.get("note") or "", p.get("nodata") or ""]
    prose = " ".join(re.sub(r"\{[^}]*\}", " ", t) for t in texts)
    allowed = set(_NUM_RE.findall(question)) | set(re.findall(r"\d+", question)) | _ALWAYS_OK
    return [n for n in _NUM_RE.findall(prose) if n not in allowed and n.replace(",", ".") not in allowed]


def _render(p: dict, lang: str) -> str:
    kind = p.get("kind")
    if kind in ("text", "no_data"):
        return (p.get("answer") or MSG["nodata"][lang]).strip()
    if _empty(p):
        return (p.get("nodata") or MSG["nodata"][lang]).strip()
    cols, rows = p["cols"], p["rows"]
    if p.get("_generic"):
        return "\n".join(", ".join(f"{c}: {fmt(v, c, lang)}" for c, v in zip(cols, r)) for r in rows[:50])
    first = dict(zip(cols, rows[0]))
    tmpl_row = (p.get("row") or "").strip()
    parts = []
    if tmpl_row:
        parts.append(fill(p.get("answer", ""), first, lang))
        for i, r in enumerate(rows[:50], 1):
            parts.append(fill(tmpl_row, dict(zip(cols, r)), lang, i))
    else:
        parts.append(fill(p.get("answer", ""), first, lang))
        if len(rows) > 1:  # template expected one row but got many: list the rest generically
            for i, r in enumerate(rows[1:50], 2):
                parts.append(f"{i}. " + ", ".join(fmt(v, c, lang) for c, v in zip(cols, r)))
    if len(rows) > 50:
        parts.append({"ru": "… и другие (показаны первые 50)", "uz": "… va boshqalar (dastlabki 50 tasi)",
                      "uz_cyr": "… ва бошқалар (дастлабки 50 таси)"}[lang])
    text = "\n".join(x for x in parts if x)
    if leftover(text):  # unknown placeholders: fall back to a plain table so no number is lost
        text = "\n".join(", ".join(f"{c}: {fmt(v, c, lang)}" for c, v in zip(cols, r)) for r in rows[:50])
    note = fill(p.get("note") or "", first, lang).strip()
    if note and not leftover(note):
        text += "\nℹ️ " + note
    return ru_agree(text) if lang == "ru" else text


# ---------------- main entry ----------------
async def answer(question: str) -> dict:
    t0 = time.time()
    q = question.strip()[:1000]
    lang = detect_lang(q)
    key = text_key(q) + "|" + _today()
    if key in _cache:
        return {**_cache[key], "cached": True, "ms": int((time.time() - t0) * 1000)}

    bad_years = _out_of_range_years(q)
    if bad_years:  # deterministic: no LLM, so no trick question can produce a made-up "0 deals in 2021"
        return {"answer": MSG["years"][lang].format(y=", ".join(bad_years)), "lang": lang, "ok": True, "sql": "",
                "model": "rule", "ms": int((time.time() - t0) * 1000)}

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
            weak = any(w in (first.get("_model") or "") for w in ("lite", "gemma", "qwen", "20b"))
            left = draft_deadline - time.time()
            _, pending = await asyncio.wait(pending, timeout=max(0, left) if weak else config.SECOND_GRACE)
        elif pending:
            _, pending = await asyncio.wait(pending)
        for t in pending:
            t.cancel()
        a = ta.result() if ta.done() and not ta.cancelled() else None
        b = tb.result() if tb.done() and not tb.cancelled() else None
    else:
        a, b = await _draft(user, providers[0], draft_deadline), None

    chosen, agreed = None, False
    for p in (a, b):  # a draft whose text contains numbers not taken from the question/result is rejected
        if p and "err" not in p and _invented_numbers(p, q):
            log.warning("draft %s rejected: invented numbers %s", p.get("_model"), _invented_numbers(p, q))
            p["err"] = "invented numbers"
    ok = [p for p in (a, b) if p and "err" not in p]
    if len(ok) == 2 and ok[0].get("_lint") != ok[1].get("_lint"):  # a rule-breaking draft loses to a clean one
        ok = [p for p in ok if not p.get("_lint")]
    if len(ok) == 2:
        if _agree(a, b):  # prefer the richer draft (more columns = breakdown of both interpretations)
            chosen, agreed = (a if len(a.get("cols", [])) >= len(b.get("cols", [])) else b), True
        else:
            chosen = await _arbitrate(user, a, b, deadline) or a
    elif ok:
        chosen = ok[0]
    if chosen is None:  # only prose was bad: show the (trusted) SQL result as a plain table, no model text
        bad = [p for p in (a, b) if p and p.get("err") == "invented numbers" and p.get("rows")]
        if bad:
            chosen = {**bad[0], "answer": "", "row": "", "note": "", "_generic": True}
    for k in range(2):  # last resort: everything failed (quota/overload) -> new drafts while the 90 s budget allows
        if chosen is not None or deadline - time.time() < 10:
            break
        prov = providers[(k + 1) % len(providers)]
        p = await _draft(user, prov, deadline - 3, offset=k + 1)
        if p and "err" not in p and not _invented_numbers(p, q):
            chosen = p
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
