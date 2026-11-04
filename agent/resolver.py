"""Deterministic language detection and entity resolution -> compact HINTS for the LLM."""
import re

from rapidfuzz import fuzz, process

from . import db
from .textnorm import name_key, parse_klass, parse_sort, text_key

# ---------------- language ----------------
_UZ_CYR = set("ўқғҳЎҚҒҲ")
_UZ_CYR_WORDS = re.compile(r"\b(ва|қанча|нечта|бўйича|йил|йилда|қайси|ким|билан|учун|эмас|бўлган|сотилган|олинган)\b", re.I)


def detect_lang(q: str) -> str:
    cyr = len(re.findall(r"[А-Яа-яЁёЎўҚқҒғҲҳ]", q))
    lat = len(re.findall(r"[A-Za-z]", q))
    if cyr > lat:
        return "uz_cyr" if (set(q) & _UZ_CYR or _UZ_CYR_WORDS.search(q)) else "ru"
    return "uz"


# ---------------- dictionaries (loaded once) ----------------
def _stem(w: str) -> str:
    return w[:-3] if len(w) >= 9 else w[:-2] if len(w) >= 7 else w[:-1] if len(w) >= 5 else w


def _terms(*texts: str) -> list[list[str]]:
    out = []
    for t in texts:
        for part in t.split(","):
            k = re.sub(r"[^a-z0-9 ]", " ", text_key(part))
            words = [_stem(w) for w in k.split() if len(w) > 1]
            if words:
                out.append(words)
    return out


# short stems (<4 chars) only match with a known grammatical ending, so "tuz" != "tuzgan"
_ENDINGS = {"", "a", "u", "e", "i", "y", "ы", "om", "ov", "oy", "ni", "ning", "da", "dan", "ga", "lar", "larni", "ga"}


def _word_hit(w: str, q: str) -> bool:
    return q.startswith(w) and (len(w) >= 4 or q[len(w):] in _ENDINGS)


_PRODUCTS = [(p, uz, _terms(p, uz, syn)) for p, uz, syn in db.raw("SELECT product, product_uz, synonyms FROM products")]
_VARIANTS = db.raw("""SELECT product, list(DISTINCT marka) FILTER (marka IS NOT NULL), list(DISTINCT size) FILTER (size IS NOT NULL),
                      list(DISTINCT ptype) FILTER (ptype IS NOT NULL), list(DISTINCT sort) FILTER (sort IS NOT NULL),
                      list(DISTINCT klass) FILTER (klass IS NOT NULL), list(DISTINCT unit) FROM product_variants GROUP BY 1""")
_VAR = {r[0]: [x or [] for x in r[1:]] for r in _VARIANTS}
_REGIONS = [(r, ru, _terms(r, ru, cyr, al)) for r, ru, cyr, al in db.raw("SELECT * FROM regions")]
_PART = db.raw("SELECT inn, name, name_key, role, region FROM participants")
_GENERIC = re.compile(r"\b(broker\w*|birja\w*|kompaniya\w*|firma\w*|savdo|uyi|idorasi|guruhi|group|trade|treyd)\b")


def _core(k: str) -> str:
    return re.sub(r"\s+", " ", _GENERIC.sub(" ", k)).strip() or k


_PART_KEYS = [_core(p[2]) for p in _PART]
_BROKERS = db.raw("SELECT broker_code, name, name_key, inn FROM brokers")
_BROKER_KEYS = [_core(b[2]) for b in _BROKERS]
_INN = {p[0]: p for p in _PART}
_BROKER_INN = {b[3]: b for b in _BROKERS}
_BROKER_CODE = {b[0]: b for b in _BROKERS}

_STOP = set(text_key(w) for w in """
сколько какой какая какие каков какова кто где когда сделок сделки сделка сделку году год года месяц компания компании
компанией фирма брокер брокера брокеры продавец продавца покупатель покупателя покупатели по в на за из с от до и или
nechta qancha qaysi kim qayerda qachon bitim bitimlar bitimlari bitimlarning yil yilda yili oy kompaniya kompaniyasi
firma broker sotuvchi xaridor xaridori boyicha va yoki bilan uchun dan gacha da ga ni ning umumiy summa summasi hajmi
narx narxi ortacha jami eng kop kam top сумма объем объём цена средняя общая всего самый больше меньше топ
""".split())


def _has(words: list[str], qwords: list[str]) -> bool:
    return all(any(_word_hit(w, q) for q in qwords) for w in words)


def _best(terms: list[list[str]], qwords: list[str]):
    hits = [t for t in terms if _has(t, qwords)]
    return max(hits, key=lambda t: len("".join(t)), default=None)


def _subsumed(t: list[str], others: list[list[str]]) -> bool:
    return any(set(t) < set(o) for o in others)


def _alnum(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text_key(s))


def resolve(q: str) -> list[str]:
    hints: list[str] = []
    qk = re.sub(r"[^a-z0-9 ]", " ", text_key(q))
    qwords = qk.split()
    qal = qk.replace(" ", "")

    # products (+ attribute values present in the question)
    found = [(t, p) for p, uz, terms in _PRODUCTS if (t := _best(terms, qwords))]
    found = [(t, p) for t, p in found if not _subsumed(t, [o for o, _ in found])]
    found.sort(key=lambda x: -len("".join(x[0])))
    for _, p in found[:3]:
        markas, sizes, ptypes, sorts, klasses, units = _VAR.get(p, ([], [], [], [], [], []))
        extra = []
        m = [x for x in markas if (len(_alnum(x)) >= 3 and _alnum(x) in qal)
             or re.search(r"\bmark\w*\s*" + re.escape(_alnum(x)) + r"\b", qk)]
        if m:
            extra.append("marka=" + "/".join(f"'{x}'" for x in m))
        z = [x for x in sizes if _alnum(x) and _alnum(x) in qal]
        if z:
            extra.append("size=" + "/".join(f"'{x}'" for x in z))
        hint = f"product='{p}' (units: {', '.join(units)}"
        if markas:
            hint += "; marka values: " + ", ".join(markas)
        if sizes:
            hint += "; size values: " + ", ".join(sizes)
        if ptypes:
            hint += "; ptype values: " + ", ".join(ptypes)
        if sorts:
            hint += "; sort values: " + ", ".join(sorts)
        if klasses:
            hint += "; klass values: " + ", ".join(klasses)
        hints.append(hint + ")" + (" mentioned: " + ", ".join(extra) if extra else ""))
    s = parse_sort(q) or _uz_grade(q, "nav")
    k = parse_klass(q) or _uz_grade(q, "sinf")
    if s:
        hints.append(f"grade mentioned: sort='{s}'")
    if k:
        hints.append(f"class mentioned: klass='{k}'")

    # regions
    regs = [(t, r, ru) for r, ru, terms in _REGIONS if (t := _best(terms, qwords))]
    if any(r == "Toshkent viloyati" for _, r, _ in regs):  # "Ташкентская область" also prefixes the city alias
        city = [t for t, r, _ in regs if r == "Toshkent shahri"]
        vil = [t for t, r, _ in regs if r == "Toshkent viloyati"][0]
        if city and len("".join(vil)) > len("".join(city[0])):
            regs = [x for x in regs if x[1] != "Toshkent shahri"]
    for _, r, ru in regs:
        hints.append(f"region='{r}' (region_ru='{ru}')")

    # explicit numbers
    for n in re.findall(r"(?<!\d)\d{6,9}(?!\d)", q.replace(" ", "")):
        if len(n) == 9:
            if n in _INN:
                p = _INN[n]
                hints.append(f"inn '{n}' = participant '{p[1]}' (role {p[3]}, region {p[4]})")
            elif n in _BROKER_INN:
                hints.append(f"inn '{n}' = broker {_BROKER_INN[n][0]} '{_BROKER_INN[n][1]}'")
            else:
                hints.append(f"inn '{n}' NOT FOUND in participants/brokers")
        else:
            v = int(n)
            d = db.raw("SELECT count(*) FROM deals WHERE deal_id=?", [v])[0][0]
            k_ = db.raw("SELECT count(*) FROM contracts WHERE contract_id=?", [v])[0][0]
            hints.append(f"number {n}: deal_id {'exists' if d else 'not found'}; contract_id {'exists' if k_ else 'not found'}")
    for code in re.findall(r"\b[BbВв][KkКк][-\s]?(\d{3})\b", q):
        c = f"BK{code}"
        hints.append(f"broker_code '{c}' = '{_BROKER_CODE[c][1]}'" if c in _BROKER_CODE else f"broker_code '{c}' NOT FOUND")

    used = {q_ for t, _ in found for w in t for q_ in qwords if _word_hit(w, q_)}
    used |= {q_ for t, _, _ in regs for w in t for q_ in qwords if _word_hit(w, q_)}
    hints += _names(q, used)
    return hints


def _uz_grade(q: str, word: str):
    t = text_key(q)
    if word == "nav" and re.search(r"\boliy\s+nav", t):
        return "высший"
    m = re.search(r"\b(1|2|3|4|birinchi|ikkinchi|uchinchi|tortinchi)[\s-]*(?:chi\s+)?" + word, t)
    if not m:
        return None
    return {"birinchi": "1", "ikkinchi": "2", "uchinchi": "3", "tortinchi": "4"}.get(m.group(1), m.group(1))


def _candidates(q: str, used: set) -> list[str]:
    quoted = [_core(name_key(x)) for x in re.findall(r"[«\"“„]([^»\"”“]{2,60})[»\"”“]", q)]
    words = [w for w in _core(name_key(q)).split() if w not in _STOP and w not in used and not w.isdigit()]
    grams = [" ".join(words[i:i + n]) for n in (1, 2, 3) for i in range(len(words) - n + 1)]
    return quoted + [g for g in grams if len(g) >= 4]


def _names(q: str, used: set) -> list[str]:
    out, seen = [], set()
    cands = _candidates(q, used)
    if not cands:
        return out
    for cand in cands:
        for keys, rows, kind in ((_PART_KEYS, _PART, "participant"), (_BROKER_KEYS, _BROKERS, "broker")):
            cut = 86 if " " in cand else 90
            for _, score, idx in process.extract(cand, keys, scorer=fuzz.ratio, limit=3, score_cutoff=cut):
                r = rows[idx]
                if (kind, idx) in seen:
                    continue
                seen.add((kind, idx))
                if kind == "participant":
                    out.append(f"company '{r[1]}' inn='{r[0]}' (role {r[3]}, region {r[4]}) match {score:.0f}%")
                else:
                    out.append(f"broker '{r[1]}' code='{r[0]}' match {score:.0f}%")
    return out[:6]
