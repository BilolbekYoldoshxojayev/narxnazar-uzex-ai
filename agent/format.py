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

    def month_suffix(m):  # "{month}-oyda" -> "10-oyda (oktyabr)" instead of "10 (oktyabr)-oyda"
        k_v = low.get(m.group(1).lower())
        if k_v and isinstance(k_v[1], int) and 1 <= k_v[1] <= 12 and re.fullmatch(r"(?i)(\w*_)?month|oy|mes\w*", k_v[0]):
            return f"{k_v[1]}-{m.group(2)} ({MONTHS[lang][k_v[1] - 1]})"
        return m.group(0)
    template = re.sub(r"\{([A-Za-z_]\w*)\}[-‑](\w+)", month_suffix, template or "")

    def rep(m):
        name = m.group(1)
        if name == "i" and i is not None:
            return str(i)
        if name.lower() in low:
            k, v = low[name.lower()]
            return fmt(v, k, lang)
        return m.group(0)
    return _PH.sub(rep, template or "")


# Russian noun agreement after numbers: "5 253 сделки", "21 сделка", "за 1 тонну", "4 584 тонны", "10 сделок"
_RU_FORMS = [("сделка", "сделки", "сделок", "сделку"), ("тонна", "тонны", "тонн", "тонну"),
             ("контракт", "контракта", "контрактов", "контракт"), ("компания", "компании", "компаний", "компанию"),
             ("покупатель", "покупателя", "покупателей", "покупателя"), ("продавец", "продавца", "продавцов", "продавца"),
             ("участник", "участника", "участников", "участника"), ("брокер", "брокера", "брокеров", "брокера"),
             ("штука", "штуки", "штук", "штуку"), ("литр", "литра", "литров", "литр"), ("раз", "раза", "раз", "раз")]
_RU_LOOKUP = {w: f for f in _RU_FORMS for w in f[:3]}
_RU_RE = re.compile(r"(?<![\w.,])((?:за|на|в|по|из|от|до|для|более|менее|около|свыше|меньше|больше|среди|у)\s+)?"
                    r"(\d{1,3}(?: \d{3})*|\d+)([.,]\d+)?(\s+)(" + "|".join(sorted(_RU_LOOKUP, key=len, reverse=True)) + r")(?!\w)",
                    re.IGNORECASE)
_GENITIVE = {"из", "от", "до", "для", "более", "менее", "около", "свыше", "меньше", "больше", "среди", "у"}


def ru_agree(text: str) -> str:
    def rep(m):
        prep, num, frac, sp, word = m.groups()
        p = (prep or "").strip().lower()
        if p in _GENITIVE or p == "по" or word[0].isupper():  # genitive/dative contexts: keep the model's form
            return m.group(0)
        f = _RU_LOOKUP[word.lower()]
        n = int(num.replace(" ", ""))
        if frac:
            w = f[1]
        elif n % 10 == 1 and n % 100 != 11:
            w = f[3] if p in ("за", "на", "в") else f[0]
        elif 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
            w = f[1]
        else:
            w = f[2]
        return f"{prep or ''}{num}{frac or ''}{sp}{w}"
    return _RU_RE.sub(rep, text)


def leftover(text: str) -> list[str]:
    return _PH.findall(text)
