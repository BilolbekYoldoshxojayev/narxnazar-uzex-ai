"""Text normalisation shared by the DB build and the runtime resolver."""
import re

_CYR = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "j", "з": "z",
    "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
    "с": "s", "т": "t", "у": "u", "ф": "f", "х": "x", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sh",
    "ъ": "", "ы": "i", "ь": "", "э": "e", "ю": "yu", "я": "ya", "ў": "o", "қ": "q", "ғ": "g",
    "ҳ": "h", "ә": "a", "ө": "o", "ү": "u", "ң": "n",
}
_APOS = "'`‘’ʻʼ′´ʻʼ"
_LEGAL = [
    "masuliyati cheklangan jamiyati", "masuliyati cheklangan jamiyat", "aksiyadorlik jamiyati",
    "xususiy korxonasi", "xususiy korxona", "qoshma korxonasi", "qoshma korxona", "oilaviy korxona",
    "fermer xojaligi", "davlat unitar korxonasi", "unitar korxona",
    "mchj", "qk", "aj", "xk", "ooo", "oao", "zao", "chp", "fx",
]
_LEGAL_RE = re.compile(r"\b(" + "|".join(re.escape(x) for x in _LEGAL) + r")\b")


def translit(s: str) -> str:
    s = s.lower()
    return "".join(_CYR.get(ch, ch) for ch in s)


def text_key(s: str) -> str:
    """Script-independent key for free text: translit, no apostrophes/quotes."""
    s = translit(s or "")
    for a in _APOS:
        s = s.replace(a, "")
    s = re.sub(r"[\"«»“”„()\[\],;:!?]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def name_key(s: str) -> str:
    """Key for company / broker names: text_key minus legal-form words and punctuation."""
    s = re.sub(r"[./\\-]", " ", text_key(s))
    s = _LEGAL_RE.sub(" ", s)
    return re.sub(r"\s+", " ", s).strip()


_NUM = {"i": "1", "ii": "2", "iii": "3", "iv": "4", "1": "1", "2": "2", "3": "3", "4": "4",
        "первый": "1", "второй": "2", "третий": "3", "первого": "1", "второго": "2", "третьего": "3"}
_B = r"(?<![a-zа-я0-9])"


def parse_sort(name: str):
    s = (name or "").lower().replace("ё", "е")
    if re.search(r"высш\w*\s+сорт|в/с", s):
        return "высший"
    m = re.search(_B + r"(iii|ii|i|1|2|3|первый|второй|третий|первого|второго|третьего)[\s-]*сорт", s)
    return _NUM[m.group(1)] if m else None


def parse_klass(name: str):
    s = (name or "").lower().replace("ё", "е")
    if "а500с" in s:
        return "А500С"
    m = re.search(_B + r"(iv|iii|ii|i|1|2|3|4)[\s-]*класс", s)
    return _NUM[m.group(1)] if m else None


def compact(s: str) -> str:
    """Uppercase, no spaces, latin X -> cyrillic Х (sizes/brands like 21х32мм)."""
    return re.sub(r"\s+", "", (s or "").upper()).replace("X", "Х").replace("Ё", "Е")
