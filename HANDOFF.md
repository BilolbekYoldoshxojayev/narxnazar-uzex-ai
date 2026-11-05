# Handoff — how to continue this project

## 1. Setup (10 minutes)
```bash
pip install -r requirements.txt
cp .env.example .env.local      # put API keys here (ask the team lead; keys are NOT in this zip)
python -m uvicorn agent.app:app --port 8000   # web chat: http://localhost:8000
```
`data/uzex.duckdb` is already built. Rebuild it only if you change `scripts/build_db.py`:
`python scripts/build_db.py` (reads `uzex_spot_data/uzex_spot_data/*.csv`, asserts row counts).

## 2. Where things are
| Want to change… | File |
|---|---|
| How questions are understood (products, regions, companies, numbers) | `agent/resolver.py`, `agent/catalog.py` |
| LLM instructions, schema, rules | `agent/prompt.py` |
| Verified example questions used for retrieval (RAG) | `agent/examples.py` — add new ones here |
| Model list, keys, timeouts | `agent/config.py` / `.env.local` |
| Dual-model check, arbiter, rendering, anti-made-up-number guard | `agent/pipeline.py` |
| Telegram bot texts / buttons | `agent/telegram.py` |
| Web page | `web/index.html` |
| Data cleaning / derived columns | `scripts/build_db.py` |

## 3. Always test before pushing
```bash
python -m eval.run                    # 90 regression questions (reference SQL in eval/cases.py)
python -m eval.run --set holdout      # 22 unseen questions (eval/holdout.py)
python -m eval.run --only 5,17        # a few cases
python -m eval.run --url https://narxnazar-uzex-ai.onrender.com   # against the live server
```
Last results: regression 97.8%, holdout 95.5%; every failure found was fixed. Add a case to `eval/cases.py` for every new
question type; never tune on `eval/holdout.py`.

## 4. Deployment
- GitHub: `BilolbekYoldoshxojayev/narxnazar-uzex-ai` (branch `main`). Render auto-deploys on every push (~3 min).
- Render env vars: `GEMINI_API_KEYS`, `GROQ_API_KEYS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SECRET` (comma-separated key lists rotate automatically).
- Telegram webhook is set automatically at startup. Do NOT run `python -m agent.telegram` (local polling) while the
  server is live — it deletes the webhook; restart the Render service afterwards if you did.
- Keep-alive: GitHub Action `.github/workflows/keepalive.yml` + an external pinger (cron-job.org) on `/health`.

## 5. Golden rules
1. Numbers come only from SQL results (placeholders). Never let the model type data digits.
2. Ambiguous question → answer covers both readings (all/cancelled/valid; weighted/simple average; sold/delivered).
3. No data → say so. Wrong or invented numbers can disqualify the team.

## 6. Ideas for the next stage (7–9 Nov)
- More verified examples in `agent/examples.py` for new question types.
- Charts in the web chat; CSV export of result tables.
- More free API keys (Cerebras `CEREBRAS_API_KEYS`, more Groq) — Gemini's free tier often returns 503.
