"""Gemini + Groq clients with multi-key rotation, cooldowns and cross-provider failover."""
import asyncio
import json
import logging
import re
import time
from dataclasses import dataclass, field

import httpx

from . import config

log = logging.getLogger("llm")
_http = httpx.AsyncClient(timeout=httpx.Timeout(config.LLM_TIMEOUT, connect=10))


class LLMError(Exception):
    pass


@dataclass
class KeyPool:
    name: str
    keys: list[str]
    cool: dict = field(default_factory=dict)  # (key index, model|"*") -> unix time when usable again
    rr: int = 0

    def order(self, model: str) -> list[int]:
        now = time.time()
        n = len(self.keys)
        idx = [(self.rr + i) % n for i in range(n)]
        self.rr = (self.rr + 1) % max(n, 1)
        return [i for i in idx if max(self.cool.get((i, model), 0), self.cool.get((i, "*"), 0)) <= now]

    def cooldown(self, i: int, secs: float, model: str = "*") -> None:
        self.cool[(i, model)] = time.time() + secs


POOLS = {p: KeyPool(p, keys) for p, (keys, _) in config.PROVIDERS.items()}
MODELS = {p: models for p, (_, models) in config.PROVIDERS.items()}
_dead_models: dict[str, float] = {}


def _retry_after(r: httpx.Response, default: float = 60) -> float:
    try:
        if "PerDay" in r.text:  # daily free-tier quota used up: skip this key+model for the rest of the session
            return 6 * 3600
        if "retry-after" in r.headers:
            return float(r.headers["retry-after"]) + 1
        m = re.search(r'"retryDelay":\s*"(\d+)', r.text)
        if m:
            return float(m.group(1)) + 1
    except ValueError:
        pass
    return default


async def _gemini(key: str, model: str, system: str, user: str) -> tuple[str, dict]:
    body = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json", "maxOutputTokens": 8192},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    r = await _http.post(url, json=body, headers={"x-goog-api-key": key})
    if r.status_code != 200:
        raise _HTTP(r)
    d = r.json()
    parts = d.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
    u = d.get("usageMetadata", {})
    return text, {"in": u.get("promptTokenCount"), "out": u.get("candidatesTokenCount"), "cached": u.get("cachedContentTokenCount")}


async def _openai(prov: str, key: str, model: str, system: str, user: str) -> tuple[str, dict]:
    body = {"model": model, "temperature": 0, "max_completion_tokens": 4096,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "response_format": {"type": "json_object"}}
    if "gpt-oss" in model:
        body["reasoning_effort"] = "medium"
    r = await _http.post(config.OPENAI_URLS[prov], json=body, headers={"Authorization": f"Bearer {key}"})
    if r.status_code != 200:
        raise _HTTP(r)
    d = r.json()
    u = d.get("usage", {})
    return d["choices"][0]["message"]["content"] or "", {"in": u.get("prompt_tokens"), "out": u.get("completion_tokens")}


class _HTTP(Exception):
    def __init__(self, r: httpx.Response):
        self.r = r
        super().__init__(f"HTTP {r.status_code}: {r.text[:200]}")


def _call(prov: str, key: str, model: str, system: str, user: str):
    return _gemini(key, model, system, user) if prov == "gemini" else _openai(prov, key, model, system, user)


def available(provider: str) -> bool:
    return bool(POOLS[provider].keys)


async def complete(system: str, user: str, prefer: str, deadline: float, offset: int = 0) -> dict:
    """Try preferred provider's models/keys, then the others. `offset` rotates the model order
    (used to get an independent second opinion from the same provider). Returns parsed JSON + meta."""
    providers = [prefer] + [p for p in POOLS if p != prefer]
    errors: list[str] = []
    while True:  # rounds: overload (503) / timeouts are transient, so keep cycling until the deadline
        tried = False
        for prov in providers:
            pool = POOLS[prov]
            if not pool.keys:
                continue
            ms = MODELS[prov]
            k = offset % len(ms) if prov == prefer else 0
            for model in ms[k:] + ms[:k]:
                if _dead_models.get(model, 0) > time.time():
                    continue
                for ki in pool.order(model):
                    left = deadline - time.time()
                    if left < 3:
                        raise LLMError("deadline: " + "; ".join(errors[-4:]))
                    tried = True
                    t0 = time.time()
                    try:
                        text, usage = await asyncio.wait_for(_call(prov, pool.keys[ki], model, system, user),
                                                             timeout=min(left, config.LLM_TIMEOUT))
                        obj = parse_json(text)
                        log.info("llm ok %s/%s key#%d %.1fs tokens=%s", prov, model, ki, time.time() - t0, usage)
                        obj["_model"] = f"{prov}/{model}"
                        obj["_usage"] = usage
                        return obj
                    except _HTTP as e:
                        code = e.r.status_code
                        errors.append(f"{prov}/{model}#{ki}:{code}")
                        log.warning("llm %s/%s key#%d HTTP %d %s", prov, model, ki, code, e.r.text[:120].replace("\n", " "))
                        if code == 429:
                            pool.cooldown(ki, _retry_after(e.r), model)  # quotas are per key+model
                            continue
                        if code == 404 or (code == 400 and "model" in e.r.text.lower()):
                            _dead_models[model] = time.time() + 3600
                            break
                        if code in (401, 403):
                            pool.cooldown(ki, 3600)
                            continue
                        break  # 5xx / other: overloaded model, move on to the next model this round
                    except (asyncio.TimeoutError, httpx.HTTPError) as e:
                        errors.append(f"{prov}/{model}#{ki}:{type(e).__name__}")
                        log.warning("llm %s/%s key#%d %s %.1fs", prov, model, ki, type(e).__name__, time.time() - t0)
                        break
                    except ValueError as e:  # bad JSON: try next key/model
                        errors.append(f"{prov}/{model}#{ki}:badjson")
                        log.warning("llm %s/%s bad json: %s", prov, model, str(e)[:120])
        if deadline - time.time() < 4:
            raise LLMError("all providers failed: " + "; ".join(errors[-6:]))
        await asyncio.sleep(1.0 if tried else 2.0)


def parse_json(text: str) -> dict:
    t = text.strip()
    t = re.sub(r"^```(?:json)?|```$", "", t, flags=re.M).strip()
    try:
        obj = json.loads(t)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", t, re.S)
        if not m:
            raise ValueError("no json") from None
        obj = json.loads(m.group(0))
    if not isinstance(obj, dict) or "kind" not in obj:
        raise ValueError("missing kind")
    return obj
