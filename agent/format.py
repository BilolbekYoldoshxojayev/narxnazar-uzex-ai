"""Deterministic number/date formatting and template filling (the LLM never types data digits)."""
import datetime as dt
import math
import re

CUR = {"UZS": {"ru": "сум", "uz": "so‘m", "uz_cyr": "сўм"}, "USD": {"ru": "USD", "uz": "USD", "uz_cyr": "USD"}}
MONTHS = {
    "ru": ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
    "uz": ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
    "uz_cyr": ["январ", "феврал", "март", "апрел", "май", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"],
}
BOOL = {"ru": ("Да", "Нет"), "uz": ("Ha", "Yo‘q"), "uz_cyr": ("Ҳа", "Йўқ")}


def _num(x: float) -> str:
    if isinstance(x, bool):
        return str(x)
    if isinstance(x, int) or (isinstance(x, float) and x.is_integer() and abs(x) < 1e15):
        return f"{int(x):,}".replace(",", " ")
    if not math.isfinite(x):
        return "—"
    if abs(x) < 1:
        return f"{x:.4f}".rstrip("0").rstrip(".")
    s = f"{x:,.2f}".replace(",", " ")
    return s[:-3] if s.endswith(".00") else s


def fmt(v, col: str, lang: str) -> str:
    if v is None:
        return "—"
    if isinstance(v, bool):
        return BOOL[lang][0 if v else 1]
    if col.lower() == "currency" and v in CUR:
        return CUR[v][lang]
    if isinstance(v, dt.datetime):
        return v.strftime("%d.%m.%Y %H:%M:%S")
    if isinstance(v, dt.date):
        return v.strftime("%d.%m.%Y")
    if isinstance(v, dt.time):
        return v.strftime("%H:%M:%S")
    if isinstance(v, int) and re.fullmatch(r"(?i)(\w*_)?month|oy|mes\w*", col) and 1 <= v <= 12:
        return f"{v} ({MONTHS[lang][v - 1]})"
    if isinstance(v, int) and re.search(r"(?i)(^|_)(id|year|yil|god|inn|stir|code|kod|num|nomer|raqam)$|^(deal|contract)", col):
        return str(v)  # identifiers and years: no thousands separator
    if isinstance(v, (int, float)):
        if isinstance(v, float) and re.search(r"pct|percent|share|foiz|dolya", col, re.I):
            return f"{v:.2f}".rstrip("0").rstrip(".")
        return _num(v)
    if hasattr(v, "is_finite"):  # Decimal
        return _num(float(v))
    if isinstance(v, list):
        return ", ".join(fmt(x, col, lang) for x in v)
    return str(v)


_PH = re.compile(r"\{([A-Za-z_][A-Za-z0-9_]*)\}")


def fill(template: str, row: dict, lang: str, i: int | None = None) -> str:
    low = {k.lower(): (k, v) for k, v in row.items()}

    def rep(m):
        name = m.group(1)
        if name == "i" and i is not None:
            return str(i)
        if name.lower() in low:
            k, v = low[name.lower()]
            return fmt(v, k, lang)
        return m.group(0)
    return _PH.sub(rep, template or "")


def leftover(text: str) -> list[str]:
    return _PH.findall(text)
