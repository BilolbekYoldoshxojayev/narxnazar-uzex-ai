# Bozor-Analitika: 7 Daqiqalik Final & Checkpoint Shpargalkasi

Ushbu qo'llanma **Umummilliy AI Xakaton** hakamlari (Tim, O'ktam Hamidov va Savdo-sanoat palatasi vakillari) oldida 100% ishonchli va g'olibona chiqish qilish uchun tayyorlangan.

---

## 1. 3 Daqiqalik Taqdimot (Pitch Script)

> **Muammo (1-daqiqa):**  
> "Assalomu alaykum hurmatli hakamlar! O'zbekistonda 48,000 dan ortiq chakana va ulgurji savdo do'konlari bor. Bugun birorta do'kondor yoki quruvchi Abu Saxiy, O'rikzor yoki Namangan Ispan bozoridagi tovarning real ulgurji narxi qancha ekanini aniq bilmaydi. Natijada nima bo'ladi? Ular kunlab bozor kezishadi, telefon qilishadi va ko'pincha mahsulotni 5-10% qimmat narxda olib qo'yishadi. Bu — yo'qotilgan vaqt va yo'qotilgan millionlab so'm pul!"

> **Yechim (2-daqiqa):**  
> "Biz Savdo-sanoat palatasining 19-muammosiga yechim sifatida **Bozor-Analitika** platformasini yaratdik. Bu — O'zbekistonning birinchi B2B bozor tahlili va sun'iy intellekt orqali narxlarni prognoz qiluvchi platformasi.  
> Tadbirkor tovar nomini kiritadi — tizimimiz darhol:
> 1. Respublika bo'yicha real benchmark narxini,
> 2. Kelgusi 7 kunlik narx qayerga qarab harakatlanishini (AI forecast),
> 3. Va eng muhimi, aniq qarorni beradi: *«Hozir xarid qiling»*, *«2 kun kuting»* yoki *«Diler bilan savdolashing»*!"

> **Biznes Model & Bozor (3-daqiqa):**  
> "Biz quruq SaaS emasmiz. Biz mijozga aniq qiymat yaratamiz: 500 qop sement xarid qilgan tadbirkor bizning tahlilimiz orqali 1.5 - 2 million so'm tejaydi. Shu sababli oyiga $15 (190,000 so'm) obunani ikkilanmay to'laydi.  
> Bizning birinchi 2 yillik nishon bozorimiz (SOM) — Farg'ona vodiysi va Toshkentdagi 850 ta do'kon bo'lib, bu **$255,000 yillik daromad (ARR)** demakdir.  
> Gemini 2.0 Flash bilan bitta so'rov narxi $0.0004, bizning AI yalpi marjamiz esa 97% dan yuqori!"

---

## 2. 2 Daqiqalik Jonli Demo (Live Demo Stsenariysi)

1. **Bosh ekran:** «Sement M-500» ni ko'rsating.
   - *"Mana, bugungi bozor benchmarki: 58,000 so'm. O'tgan haftaga nisbatan -3.3% pasaygan."*
   - Sariq rangli AI qaroriga e'tibor qarating: *"AI tavsiyasi: 2 kun kuting! Chunki mahalliy zavodlar ishlab chiqarishni oshirdi va narx yana 2,000 so'mga arzonlashishi kutilmoqda."*
2. **Interaktiv grafik va hududlar:**
   - 7 kunlik prognoz koridorini (dashed corridor) va Namangan vs Qo'qon narxlari farqini ko'rsating.
3. **Marja Kalkulyatori:**
   - Yuqoridagi «Marja Kalkulyatori» tugmasini bosing.
   - Xarid hajmini 500 qop qilib ko'rsating. Bir zumda: *"Sof foyda: 2,400,000 so'm, Rentabellik (ROI): 14.8%"* hisoblanadi.
4. **Grounded AI Chat:**
   - O'ng tomondagi chatdan *"Nega narx tushishi kutilmoqda?"* tugmasini bosing. AI o'zbek tilida asoslangan tahlil beradi.
5. **AI Vision Skaner (WOW-faktor):**
   - «AI Skaner» tugmasini bosing va «Namuna fakturasini skanerlash» tugmasini bosing.
   - Gemini Vision darhol tovarlarni ajratib, fakturadagi sement bozor benchmarkidan 1,000 so'm qimmatroq ekanini qizil bilan ko'rsatadi!
6. **Hakamlar rejimi:**
   - «Pitch & Arxitektura» tugmasini bosing va hakamlar oldida barcha savollarga javob tayyor ekanini namoyish eting.

---

## 3. Hakamlar Savol-Javobiga Aniq Himoya (Q&A Defense)

### Savol 1 (Tim): "Agar OpenAI ertaga bu funksiyani chiqarsa, sizda nima qoladi?"
> **Javob:** "OpenAI qanchalik kuchli bo'lmasin, unda O'zbekistonning mahalliy distribyutsiya ma'lumotlari, O'rikzor, Bekto'pi va Namangan Ispan bozorlaridagi real narxlar bazasi yo'q. OpenAI internetdagi ochiq ma'lumotni biladi, O'zbekiston ulgurji savdosi esa internetda emas, Telegram guruhlarda va yopiq dilerlik omborlarida aylanadi. Bizning ustunligimiz (unfair advantage) — **mahalliy ma'lumotlar tarmog'i va tasdiqlangan dilerlar ekotizimi**."

### Savol 2 (O'ktam): "Ma'lumotlar bazasi qayerda? Server o'chsa nima bo'ladi?"
> **Javob:** "Biz Supabase (PostgreSQL) dan foydalandik. Xaridorlar yuborgan har bir kotirovka so'rovi (RFQ) Supabase'dagi `rfq_requests` jadvaliga yoziladi. Shuningdek, xakaton internetiga bog'liq bo'lmaslik uchun to'liq oflayn seed zaxirasini (`src/data/seed-data.ts`) qurdik. Barcha maxfiy kalitlar faqat `.env.local`da saqlanadi."

### Savol 3 (O'ktam): "Git tarixingizni ko'rsata olasizmi?"
> **Javob:** "Albatta! Biz bitta «final commit» qilmadik. Git logimizni ko'rishingiz mumkin: har bir modul (Arxitektura, UI, Kalkulyator, AI va Marketplace) alohida semantic commitlar bilan kiritilgan."

### Savol 4 (Soha mentori): "Tadbirkorlar buni ishlatadimi?"
> **Javob:** "Do'kondor uchun eng katta og'riq — qimmat olib qo'yib, bozorda yutqazish. Biz unga har bir partiyadan 5-10% tejash imkonini beramiz. O'zbekiston do'kondori foyda ko'rgan joyga darhol pul to'laydi."
