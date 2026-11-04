"""Runtime configuration from environment (.env.local / .env loaded if present)."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _load_dotenv() -> None:
    for name in (".env.local", ".env"):
        p = ROOT / name
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()


def _list(*names: str) -> list[str]:
    out: list[str] = []
    for n in names:
        out += [x.strip() for x in os.environ.get(n, "").split(",") if x.strip()]
    return [x for i, x in enumerate(out) if x not in out[:i] and not x.startswith("your-")]


# provider -> (keys, models). Order of PROVIDERS = failover order after the preferred one.
PROVIDERS = {
    "gemini": (_list("GEMINI_API_KEYS", "GEMINI_API_KEY"),
               _list("GEMINI_MODELS") or ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.8-flash",
                                          "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"]),
    "groq": (_list("GROQ_API_KEYS", "GROQ_API_KEY"),
             _list("GROQ_MODELS") or ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "qwen/qwen3-32b"]),
    "cerebras": (_list("CEREBRAS_API_KEYS", "CEREBRAS_API_KEY"), _list("CEREBRAS_MODELS") or ["gpt-oss-120b"]),
    "openrouter": (_list("OPENROUTER_API_KEYS", "OPENROUTER_API_KEY"),
                   _list("OPENROUTER_MODELS") or ["openai/gpt-oss-120b:free", "deepseek/deepseek-chat-v3.1:free"]),
}
OPENAI_URLS = {"groq": "https://api.groq.com/openai/v1/chat/completions",
               "cerebras": "https://api.cerebras.ai/v1/chat/completions",
               "openrouter": "https://openrouter.ai/api/v1/chat/completions"}
ARBITER = os.environ.get("ARBITER", "gemini")  # provider preferred for disagreement resolution

DB_PATH = os.environ.get("DB_PATH", str(ROOT / "data" / "uzex.duckdb"))
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_SECRET = os.environ.get("TELEGRAM_SECRET", "uzex-" + (TELEGRAM_TOKEN.split(":")[0] if TELEGRAM_TOKEN else "local"))
PUBLIC_URL = (os.environ.get("PUBLIC_URL") or os.environ.get("RENDER_EXTERNAL_URL") or "").rstrip("/")

LLM_TIMEOUT = float(os.environ.get("LLM_TIMEOUT", "20"))
TOTAL_BUDGET = float(os.environ.get("TOTAL_BUDGET", "70"))
DUAL = os.environ.get("DUAL", "1") == "1"  # run two independent models and cross-check
SECOND_GRACE = float(os.environ.get("SECOND_GRACE", "12"))  # max wait for the 2nd draft after the 1st is ready
