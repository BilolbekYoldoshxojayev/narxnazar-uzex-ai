# Bozor-Analitika (B2B AI Platform)
> **Umummilliy AI Xakaton (Namangan bosqichi • 24–27 sentabr 2026)**  
> **Yo'nalish:** O'zbekiston Savdo-sanoat palatasi  
> **Tanlangan muammo:** **#19** — Bozorlardagi real narx-navo va talab-taklif boʻyicha yagona tahliliy maʼlumotlar bazasining yoʻqligi sababli tadbirkorlarning mahsulot xarid qilishda ortiqcha vaqt va mablagʻ yoʻqotishi.

---

## 1. Mahsulot haqida qisqacha

**Bozor-Analitika** — O'zbekistonlik tadbirkorlar, qurilish kompaniyalari, chakana do'kondorlar va ulgurji xaridorlarga tovar xaridida pul va vaqtni tejashga yordam beruvchi B2B tahliliy platforma.

Tizim quyidagi 4 ta asosiy qadriyatni birlashtiradi:
1. **Real Bozor Benchmarki:** O'zbekistonning yirik ulgurji bozorlari (Toshkent O'rikzor, Namangan Ispan, Qo'qon ulgurji, Samarqand) bo'yicha real vaqt narxlari.
2. **AI 7 Kunlik Prognoz & Qaror Tavsiyasi:** Narx qachon tushishi yoki ko'tarilishini oldindan bashorat qilib, tadbirkorga *"Hozir xarid qiling"*, *"2-3 kun kuting"* yoki *"Savdolashing"* deb aniq qaror beradi.
3. **Landed Cost & Marja Kalkulyatori:** Xarid hajmi, transport va qo'shimcha xarajatlarni inobatga olgan holda sof foyda, rentabellik (ROI) va zararsizlik (break-even) nuqtasini real vaqtda hisoblaydi.
4. **Grounded Gemini AI Maslahatchi:** Har bir tovar kontekstini (tarixi, hududlar farqi) tushunadigan va o'zbek tilida professional javob beradigan aqlli assistent.
5. **AI Vision Skaner:** Qog'oz chek, hisob-faktura yoki Telegram kanaldagi narxnoma rasmini avtomatik o'qib, jadvalga chiqaradi.
6. **B2B Kotirovka Tizimi (RFQ):** Tasdiqlangan dilerlardan bir klik bilan narx taklifini olish (to'g'ridan-to'g'ri Supabase bazasiga saqlanadi).

---

## 2. Texnologiyalar steki (Tech Stack)

- **Frontend & Server:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Interaktiv Grafiklar:** Recharts (ComposedChart, Area, Trend & Forecast Corridor)
- **Ma'lumotlar bazasi:** Supabase (PostgreSQL) + Oflayn zaxira seed ma'lumotlari (`src/data/seed-data.ts`)
- **Sun'iy intellekt:** Google Gemini API (`gemini-2.0-flash` matn tahlili va `gemini-vision` fakturalar OCR uchun)
- **Ikonkalar & UI:** Lucide React

---

## 3. Loyihani mahalliy muhitda ishga tushirish (Local Setup)

### 1. Repozitoriyni klonlash / ochish
```bash
cd bozor-analitika
```

### 2. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 3. Muhit o'zgaruvchilari (`.env.local`)
Papkada `.env.local` faylini yarating va quyidagi kalitlarni kiriting (namuna `.env.example`da berilgan):
```env
NEXT_PUBLIC_SUPABASE_URL=https://lzolacsenyxfhperuysn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
GEMINI_API_KEY=AQ...
```

### 4. Dasturni ishga tushirish
```bash
npm run dev
```
Brauzerda `http://localhost:3000` manzilini oching.

### 5. Ishlab chiqarishga yig'ish (Production Build)
```bash
npm run build
npm start
```

---

## 4. Hakamlar va Mentorlar uchun ko'rsatma (Pitch Guide)

Platforma yuqori panelida joylashgan **«Pitch & Arxitektura»** tugmasi orqali hakamlarga to'g'ridan-to'g'ri loyihaning biznes ko'rsatkichlari (Bottom-up SOM, AI Unit Economics) va texnik arxitekturasini ko'rsatishingiz mumkin.

- **Tim (Biznes mentor) uchun:**
  - SOM: O'zbekistondagi 14,000 ta nishon do'kondan birinchi 2 yilda 850 ta do'kon obunasi = **$255,000 ARR**.
  - AI Unit Economics: Gemini Flash 2.0 so'rovi narxi ~$0.0004. Bitta faol mijoz harajati oyiga $0.04. Obuna $15. **AI yalpi marjasi: >97%**.
- **O'ktam Hamidov (Texnik mentor) uchun:**
  - Git log toza va bosqichma-bosqich yozilgan (`git log --oneline`).
  - `.env.local` to'liq himoyalangan, API kalitlar frontendga sizib chiqmagan.
  - Supabase PostgreSQL integratsiyasi + offline demo rejimi.
