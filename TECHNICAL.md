# Texnik tavsif (Google Formaga) / Техническое описание

## O‘zbekcha

**Havolalar / Ссылки:** Telegram-bot: https://t.me/NarxNazarAI · Veb: https://narxnazar-uzex-ai.onrender.com ·
Kod: https://github.com/BilolbekYoldoshxojayev/narxnazar-uzex-ai

**Sinov / Тест:** 76 savollik RU/UZ to‘plam (sanash, summa, narx, reyting, bitim/shartnoma/STIR qidiruvi, eksport va kurs,
mavjud bo‘lmagan ma’lumotga tuzoq savollar). Birinchi o‘tishda ~96% aniqlik, topilgan barcha xatolar tuzatildi; javob vaqti
odatda 5–15 s.

**NarxNazar** — birja bitimlari bo‘yicha savollarga o‘zbek (lotin va kirill) hamda rus tillarida faqat berilgan ma’lumotlar
asosida javob beradigan AI-agent (Telegram-bot va veb-chat).

**Texnologiyalar:** Python 3.12, FastAPI, DuckDB, Gemini 3.x Flash va Groq (gpt-oss-120b, Llama 3.3 70B) — bepul API,
bir nechta kalit avtomatik almashadi; Render (Docker) hosting.

**Ishlash tartibi:**
1. CSV fayllar DuckDB bazaga yuklanadi va tozalanadi. Sotuvchilar bir tovarni turlicha yozgani uchun ТН ВЭД kodi bo‘yicha
   41 ta kanonik tovar ajratilgan. Nav, sinf va marka normallashtirilgan. Hajm (Количество×Лот), birlik narxi, so‘mdagi
   summa (eksport bitimlari bitim kunidagi kurs bo‘yicha) va «bekor qilingan» belgisi oldindan hisoblangan.
2. Savoldagi tovar, viloyat, kompaniya (kirill/lotin transliteratsiya + fuzzy), STIR, bitim/shartnoma raqami va broker
   LLM siz, deterministik usulda aniqlanadi.
3. Ikki mustaqil model parallel ravishda SQL so‘rov va javob shablonini yozadi. DuckDB ikkalasini faqat o‘qish rejimida
   bajaradi. Natijalar mos kelsa javob tasdiqlanadi, farq qilsa uchinchi chaqiruv (arbiter) to‘g‘ri variantni tanlaydi.
4. Raqamlar shablonga dastur tomonidan qo‘yiladi: model raqam yozmaydi, shuning uchun gallyutsinatsiya bo‘lmaydi.
   Ma’lumot bo‘lmasa, agent «ma’lumot topilmadi» deb javob beradi.
5. Noaniq savollarda javob ikkala talqinni beradi: jami / bekor qilingan / amalga oshgan bitimlar, tortilgan va oddiy
   o‘rtacha narx.

**Tezlik:** odatda 5–15 soniya, 90 soniyalik limit ichida kafolatlangan (vaqt byudjeti 70 s, har bir chaqiruv 20 s).

**Ishonchlilik:** har bir provayder uchun bir nechta API kalit ishlatiladi; 429 yoki 503 xatoda avtomatik boshqa kalit,
model yoki provayderga o‘tiladi. Takroriy savollar keshdan javob oladi.

**Sifat nazorati:** RU/UZ tillarida etalon SQL bilan baholash to‘plami bor. Etalonlar xom CSV ustida mustaqil
hisoblab tekshirilgan.

## Русский

**NarxNazar** — AI-агент (Telegram-бот и веб-чат), который отвечает на вопросы о биржевых сделках на русском и узбекском
(латиница и кириллица) строго по предоставленным данным.

**Стек:** Python 3.12, FastAPI, DuckDB, Gemini 3.x Flash и Groq (gpt-oss-120b, Llama 3.3 70B) — бесплатные API с ротацией
нескольких ключей; хостинг Render (Docker).

**Как работает:**
1. CSV загружаются в DuckDB с очисткой. Варианты написания одного товара сведены к 41 каноническому товару по коду
   ТН ВЭД. Сорт, класс и марка нормализованы. Заранее посчитаны объём, цена за единицу, сумма в сумах (экспорт — по
   курсу на дату сделки) и признак аннулирования.
2. Товар, регион, компания (транслитерация + нечёткий поиск), ИНН, номер сделки или контракта и брокер определяются
   детерминированно, без LLM.
3. Две независимые модели параллельно пишут SQL и шаблон ответа. DuckDB выполняет оба запроса в режиме только чтения.
   Совпадение результатов подтверждает ответ, при расхождении арбитр выбирает верный вариант.
4. Числа подставляет программа, модель цифры не пишет. Если данных нет, агент прямо говорит об этом.
5. При неоднозначном вопросе ответ покрывает обе трактовки: все / аннулированные / состоявшиеся сделки,
   средневзвешенная и простая средняя цена.

**Скорость:** обычно 5–15 с, жёсткий бюджет 70 с, то есть меньше 90 с.

**Надёжность:** несколько ключей на провайдера и автоматический переход на другой ключ, модель или провайдера при
429 или 503. Повторные вопросы отвечаются из кэша.
