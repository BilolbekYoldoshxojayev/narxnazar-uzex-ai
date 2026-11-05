"""Accuracy eval.  python -m eval.run [--url https://host] [--only 1,5,9] [--from N]"""
import argparse
import asyncio
import datetime as dt
import json
import re
import sys
import time

sys.stdout.reconfigure(encoding="utf-8")

from agent import db  # noqa: E402
import importlib  # noqa: E402

NODATA = re.compile(r"нет|не относится|не связан|aloqasi yo|тегишли эмас|не найден|отсутств|не содерж|невозможно|yo[‘'’`ʻ]?q|topilmadi|mavjud emas|йўқ|топилмади|мавжуд эмас|ma[’']?lumot", re.I)
_REG = {r: ru for r, ru in db.raw("SELECT region, region_ru FROM regions")}


def numbers(text: str) -> list[float]:
    out = []
    for m in re.findall(r"(?<![\w.])-?\d{1,3}(?:[   ]\d{3})+(?:[.,]\d+)?|-?\d+(?:[.,]\d+)?", text):
        try:
            out.append(float(m.replace(" ", "").replace(" ", "").replace(" ", "").replace(",", ".")))
        except ValueError:
            pass
    return out


def norm(s: str) -> str:
    return re.sub(r"[\"«»“”'‘’`ʻ\s]+", " ", s.lower()).strip()


def value_ok(v, text: str, nums: list[float]) -> bool:
    if v is None:
        return True
    if isinstance(v, bool):
        return True
    if isinstance(v, (int, float)) or hasattr(v, "is_finite"):
        x = float(v)
        tol = 0 if float(x).is_integer() and abs(x) < 1e12 else max(abs(x) * 0.0005, 0.011)
        return any(abs(n - x) <= tol for n in nums)
    if isinstance(v, dt.date):
        return v.strftime("%d.%m.%Y") in text
    s = str(v)
    alts = [s] + ([_REG[s]] if s in _REG else [])
    return any(norm(a) in norm(text) for a in alts)


async def ask_local(q: str) -> dict:
    from agent import pipeline
    return await pipeline.answer(q)


async def ask_http(url: str, q: str) -> dict:
    import httpx
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post(url.rstrip("/") + "/api/ask", json={"question": q})
        return r.json()


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url")
    ap.add_argument("--only")
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--pause", type=float, default=0)
    ap.add_argument("--set", default="cases", help="cases | holdout")
    a = ap.parse_args()
    CASES = importlib.import_module(f"eval.{a.set}").CASES
    idx = [int(x) for x in a.only.split(",")] if a.only else list(range(a.start, len(CASES) + 1))
    passed, times, fails = 0, [], []
    for i in idx:
        c = CASES[i - 1]
        t0 = time.time()
        r = await (ask_http(a.url, c["q"]) if a.url else ask_local(c["q"]))
        el = time.time() - t0
        times.append(el)
        text = r.get("answer", "")
        nums = numbers(text)
        exp = c.get("expect")
        if exp == "nodata":
            ok = bool(NODATA.search(text)) or 0.0 in nums
            why = "expected no-data"
        elif exp == "text":
            ok, why = r.get("ok", False) and len(text) > 20, "expected definition"
        else:
            cols, rows = db.query(c["sql"])
            check = c.get("check") or cols
            missing = [f"{col}={row[cols.index(col)]}" for row in rows for col in check
                       if not value_ok(row[cols.index(col)], text, nums)]
            ok, why = not missing, "missing " + "; ".join(missing)
        passed += ok
        flag = "PASS" if ok else "FAIL"
        print(f"[{i:02d}] {flag} {el:5.1f}s {r.get('model')} agreed={r.get('agreed')} | {c['q']}")
        if not ok:
            print("      ", why, "\n       ANSWER:", text.replace("\n", " / ")[:500], "\n       SQL:", (r.get("sql") or "")[:400])
            fails.append(i)
        if a.pause:
            await asyncio.sleep(a.pause)
    times.sort()
    print(f"\nACCURACY {passed}/{len(idx)} = {100 * passed / len(idx):.1f}%   max {times[-1]:.1f}s  "
          f"p50 {times[len(times) // 2]:.1f}s  fails: {json.dumps(fails)}")


if __name__ == "__main__":
    asyncio.run(main())
