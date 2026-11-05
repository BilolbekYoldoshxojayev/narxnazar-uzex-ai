# NarxNazar — UZEX birja bitimlari bo‘yicha AI-agent

**UZEX AI Hackathon 2026 · Saralash bosqichi.** Birja bitimlari haqidagi savollarga **o‘zbek (lotin/kirill) va rus tillarida**
aniq va **faqat ma’lumotlar asosida** javob beradigan AI-agent. Telegram-bot + veb-chat.

> Har bir raqam SQL so‘rov natijasidan olinadi — til modeli raqamlarni o‘zi yozmaydi.
> Каждое число в ответе берётся из результата SQL-запроса — языковая модель сама цифры не пишет.

**Telegram:** https://t.me/NarxNazarAI · **Veb:** https://narxnazar-uzex-ai.onrender.com

## Arxitektura / Архитектура

```
Savol (RU/UZ) ─► 1. Til aniqlash (lotin / kirill / rus) ─────────── deterministik, 0 token
              ─► 2. Entity resolver: tovar (41 kanonik), viloyat, kompaniya (fuzzy, translit),
                    STIR/ИНН, bitim/shartnoma raqami, broker kodi, nav/sinf/marka ── deterministik
              ─► 2a. RAG: tekshirilgan «savol → SQL» yechimlardan eng o‘xshash 4 tasi namunaga olinadi
              ─► 3. Ikki mustaqil LLM (Gemini ‖ Groq) parallel ravishda SQL + javob shabloni yozadi
              ─► 4. DuckDB (read-only, faqat SELECT, 10 s limit) ikkala SQL ni bajaradi
              ─► 5. Natijalar mos kelsa ✓ — javob; farq qilsa — hakam-model (arbiter) to‘g‘risini tanlaydi
              ─► 6. Shablonga raqamlar dastur tomonidan formatlanib qo‘yiladi (so‘m/USD, birliklar, sanalar)
```

| Qism | Texnologiya |
|---|---|
| Ma’lumotlar | DuckDB (40 MB, 500 000 bitim, tozalangan va boyitilgan jadvallar) |
| LLM | Gemini (3.x Flash) + Groq (gpt-oss-120b / Llama 3.3 70B), ixtiyoriy Cerebras / OpenRouter — **hammasi bepul** |
| Kalitlar | Har provayderga bir nechta API-kalit, 429/503 da avtomatik almashish va boshqa provayderga o‘tish |
| Backend | Python 3.12, FastAPI, httpx (SDK siz, to‘g‘ridan-to‘g‘ri REST) |
| Kanallar | Telegram-bot (webhook) va veb-chat (`/`), JSON API (`/api/ask`) |
| Hosting | Render (Docker, bepul), cron-job.org orqali uyg‘oq turadi |

## Aniqlikni ta’minlash / Как обеспечивается точность

1. **Kanonik tovarlar.** Sotuvchilar bir tovarni turlicha yozadi («Карбамид» / «Мочевина (карбамид)», «Медный катод» /
   «Катод медный», 314 xil paxta yozuvi). ТН ВЭД kodi bo‘yicha 41 ta kanonik tovar, nav/sinf/marka/o‘lcham normallashtirilgan
   («1-сорта», «I сорт», «первый сорт» → `sort='1'`). Shu sababli «карбамид bo‘yicha nechta bitim» savoli barcha yozuvlarni hisoblaydi.
2. **Tayyor hisob ustunlari.** `volume = Количество × Лот`, `unit_price = Сумма ÷ volume`, `amount_uzs` — eksport (USD) bitimlari
   bitim sanasidagi kurs bo‘yicha so‘mga o‘tkazilgan, `is_cancelled` — «Аннулирован(Не оплачен)» (bitim amalga oshmagan).
3. **Viloyatlar** bitimlarda lotincha, shartnomalarda ruscha — moslik jadvali; ruscha/o‘zbekcha/kirillcha nomlar tushuniladi.
4. **Kompaniyalar** kirill/lotin, «МЧЖ/MChJ/QK» shakllaridan qat’i nazar transliteratsiya + fuzzy qidiruv bilan topiladi.
5. **Ikki modelli tekshiruv.** Ikki turli model mustaqil SQL yozadi; natijalar bir xil bo‘lsa javob tasdiqlanadi, aks holda arbiter.
6. **Noaniqlikni qoplash.** Javob ikkala talqinni ham beradi: jami / bekor qilingan / amalga oshgan bitimlar; o‘rtacha narx —
   hajm bo‘yicha tortilgan va oddiy o‘rtacha; «hajm» — so‘mda va natural birlikda.
7. **Gallyutsinatsiyaga qarshi.** Ma’lumot yo‘q bo‘lsa (mavjud bo‘lmagan kompaniya, 2021-yil, prognoz, mavzudan tashqari savol)
   agent «ma’lumot topilmadi» deydi. Raqamlar faqat SQL natijasidan; SQL — faqat o‘qish rejimida.
8. **Raqam qo‘riqchisi.** Model matnida savolda ham, SQL natijasida ham bo‘lmagan raqam bo‘lsa, javob rad etiladi. `round()` SQL dan olib tashlanadi, aniq qiymat formatlashda yaxlitlanadi.
9. **Shaffoflik.** Telegram «🔎 Qanday hisoblandi» tugmasi SQL va 2 model tekshiruvini ko‘rsatadi, `/how` esa tizim ishini tushuntiradi.
10. **Baholash to‘plami** (`eval/`): RU/UZ savollar va qo‘lda yozilgan etalon SQL; bir qismi DuckDB dan mustaqil, xom CSV
   ustida sof Python bilan qayta hisoblab tekshirilgan.

## Ishga tushirish / Запуск

```bash
pip install -r requirements.txt
python scripts/build_db.py          # CSV -> data/uzex.duckdb (tekshiruvlar bilan)
cp .env.example .env.local          # kalitlarni yozing
uvicorn agent.app:app --port 8000   # veb-chat: http://localhost:8000
python -m agent.telegram            # Telegram-bot (lokal, polling)
python -m eval.run                  # aniqlik testi
```

Render: repozitoriyni ulang → Blueprint (`render.yaml`) → kalitlarni Environment ga kiriting. Webhook avtomatik o‘rnatiladi.

## Fayllar

| Yo‘l | Vazifa |
|---|---|
| `scripts/build_db.py` | CSV → DuckDB, kanonik tovarlar, normallashtirish, tekshiruvlar |
| `agent/resolver.py` | til aniqlash, entity resolver (deterministik) |
| `agent/prompt.py` | sxema + qoidalar + misollar (keshlanadigan barqaror prefiks) |
| `agent/llm.py` | Gemini/Groq/Cerebras/OpenRouter, kalitlar rotatsiyasi, failover |
| `agent/pipeline.py` | ikki draft → bajarish → solishtirish → arbiter → render |
| `agent/format.py` | raqam/sana/valyuta formatlash, shablon to‘ldirish |
| `agent/telegram.py`, `agent/app.py`, `web/index.html` | kanallar |
| `eval/` | baholash to‘plami va runner |
| `legacy/` | loyihaning avvalgi (NarxNazar narx-monitoring) versiyasi |
