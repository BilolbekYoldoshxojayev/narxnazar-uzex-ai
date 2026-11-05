"""Library of verified question -> SQL solutions (retrieval-augmented few-shot).

For each new question the most similar entries (char n-gram TF-IDF, language-independent after transliteration)
are put into the prompt. Every SQL here was executed and checked against the data (see eval/).
Fields: q, sql, a (answer template), r (row template, optional), n (note, optional).
"""
import math
import re
from collections import Counter

from .textnorm import text_key

LIB = [
    # ---- counts (all + cancelled + valid) ----
    dict(q="Сколько сделок по сахару было в 2023 году?",
         sql="SELECT count(*) AS n, count(*) FILTER (WHERE is_cancelled) AS n_cancel, count(*) FILTER (WHERE NOT is_cancelled) AS n_valid FROM deals WHERE product='Сахар' AND year=2023",
         a="В 2023 году по сахару заключено {n} сделок: аннулировано {n_cancel}, состоялось {n_valid}."),
    dict(q="2024-yilda Buxoro viloyatida paxta bo‘yicha nechta bitim tuzilgan?",
         sql="SELECT count(*) AS n, count(*) FILTER (WHERE is_cancelled) AS n_cancel, count(*) FILTER (WHERE NOT is_cancelled) AS n_valid FROM deals WHERE product='Хлопок-сырец' AND region='Buxoro viloyati' AND year=2024",
         a="2024-yilda Buxoro viloyatida paxta xomashyosi bo‘yicha {n} ta bitim tuzilgan: {n_cancel} tasi bekor qilingan, {n_valid} tasi amalga oshgan."),
    dict(q="Сколько сделок в статусе «Оплачен»?",
         sql="SELECT count(*) AS n FROM deals WHERE status='Оплачен'",
         a="Сделок в статусе «Оплачен» (оплачены, товар ещё не поставлен): {n}."),
    dict(q="Сколько фьючерсных сделок было в марте 2025 года?",
         sql="SELECT count(*) AS n, count(*) FILTER (WHERE is_cancelled) AS n_cancel FROM deals WHERE contract_form='Фьючерс' AND year=2025 AND month=3",
         a="В марте 2025 года фьючерсных сделок: {n} (из них аннулировано {n_cancel})."),
    dict(q="Сколько уникальных покупателей купили цемент в 2025 году?",
         sql="SELECT count(DISTINCT buyer_inn) AS n_all, count(DISTINCT buyer_inn) FILTER (WHERE NOT is_cancelled) AS n_valid FROM deals WHERE product='Портландцемент' AND year=2025",
         a="В 2025 году цемент покупали {n_all} уникальных покупателей (по состоявшимся сделкам — {n_valid})."),
    # ---- sums / volumes ----
    dict(q="Какова общая сумма сделок по карбамиду в 2024 году?",
         sql="SELECT sum(amount_uzs) FILTER (WHERE NOT is_cancelled) AS total, sum(volume) FILTER (WHERE NOT is_cancelled) AS vol, any_value(unit) AS unit, sum(amount_uzs) FILTER (WHERE is_cancelled) AS cancel_total FROM deals WHERE product='Карбамид (мочевина)' AND year=2024",
         a="Сумма сделок по карбамиду в 2024 году: {total} сум, объём {vol} {unit}.", n="Без аннулированных сделок (их сумма {cancel_total} сум)."),
    dict(q="2025-yilda eksport bitimlari summasi dollarda va so‘mda qancha?",
         sql="SELECT sum(amount) AS usd, sum(amount_uzs) AS uzs, count(*) AS n FROM deals WHERE contract_type='Экспортный' AND year=2025 AND NOT is_cancelled",
         a="2025-yilda eksport bitimlari: {usd} USD (bitim kunidagi kurs bo‘yicha {uzs} so‘m), {n} ta bitim.", n="Bekor qilingan bitimlar hisobga olinmadi."),
    dict(q="Сколько тонн товара фактически поставлено по частично исполненным сделкам в 2024 году и сколько недопоставлено?",
         sql="SELECT unit, sum(delivered_volume) AS delivered, sum(volume - delivered_volume) AS not_delivered, count(*) AS n FROM deals WHERE status='Исполнен(Частично)' AND year=2024 GROUP BY unit ORDER BY delivered DESC",
         a="Частично исполненные сделки 2024 года:", r="{unit}: поставлено {delivered}, недопоставлено {not_delivered} ({n} сделок)"),
    # ---- prices ----
    dict(q="Средняя цена пшеницы 4 класса за тонну в 2025 году?",
         sql="SELECT unit, currency, sum(amount)/sum(volume) AS w_price, avg(unit_price) AS avg_price, min(unit_price) AS min_price, max(unit_price) AS max_price, count(*) AS n FROM deals WHERE product='Пшеница' AND klass='4' AND year=2025 AND NOT is_cancelled GROUP BY unit, currency",
         a="Цена пшеницы 4 класса в 2025 году:", r="за 1 {unit}: средневзвешенная {w_price} {currency}, простая средняя {avg_price} {currency} (мин {min_price}, макс {max_price}; сделок {n})",
         n="Без аннулированных сделок."),
    dict(q="На сколько процентов в среднем цена выросла от стартовой на английском аукционе в 2025 году?",
         sql="SELECT avg(price_change_pct) AS avg_pct, (sum(amount)/sum(volume*start_price)-1)*100 AS w_pct, count(*) AS n FROM deals WHERE trade_type='Английский аукцион' AND year=2025 AND NOT is_cancelled",
         a="На английском аукционе в 2025 году цена в среднем выросла от стартовой на {avg_pct}% (взвешенно по объёму {w_pct}%; сделок {n})."),
    # ---- lookups ----
    dict(q="350000-sonli bitim haqida ma’lumot bering",
         sql="SELECT deal_date, deal_time, product_name, qty_lots, volume, unit, unit_price, amount, currency, seller_name, seller_inn, buyer_name, buyer_inn, region, status FROM deals WHERE deal_id=350000",
         a="350000-bitim ({deal_date} {deal_time}): {product_name}, {qty_lots} lot = {volume} {unit}, narx {unit_price} {currency}/{unit}, summa {amount} {currency}. Sotuvchi: {seller_name} (STIR {seller_inn}), xaridor: {buyer_name} (STIR {buyer_inn}), ombor: {region}, holati: {status}."),
    dict(q="Какова сумма залога и срок поставки по сделке 280091?",
         sql="SELECT deposit_pct, deposit_amount, currency, delivery_term_days, pay_date, delivery_due_date, delivery_date, is_delivery_late FROM deals WHERE deal_id=280091",
         a="Сделка 280091: залог {deposit_pct}% = {deposit_amount} {currency}; срок поставки {delivery_term_days} дн. от оплаты ({pay_date}) — до {delivery_due_date}, фактически поставлено {delivery_date}, просрочка: {is_delivery_late}."),
    dict(q="STIR 945809173 kompaniyasi haqida",
         sql="SELECT name, region, activity, role, vat_payer, (SELECT count(*) FROM deals WHERE buyer_inn='945809173') AS n_buy, (SELECT count(*) FROM deals WHERE seller_inn='945809173') AS n_sell FROM participants WHERE inn='945809173'",
         a="STIR 945809173: {name}, {region}, {activity}, roli: {role}, QQS to‘lovchisi: {vat_payer}. Xaridor sifatida {n_buy} ta, sotuvchi sifatida {n_sell} ta bitim."),
    dict(q="Какой был курс доллара 15.03.2024?",
         sql="SELECT date, rate FROM usd_rates WHERE date=DATE '2024-03-15'",
         a="Курс на {date}: {rate} сум за 1 USD."),
    # ---- rankings ----
    dict(q="2025-yilda eng ko‘p bitim tuzgan 3 ta sotuvchi broker",
         sql="SELECT seller_broker, seller_broker_name, count(*) AS n, count(*) FILTER (WHERE NOT is_cancelled) AS n_valid FROM deals WHERE year=2025 GROUP BY 1, 2 ORDER BY n DESC LIMIT 3",
         a="2025-yilda eng ko‘p bitim tuzgan sotuvchi brokerlar:", r="{i}. {seller_broker_name} ({seller_broker}) — {n} ta bitim (amalga oshgan: {n_valid})"),
    dict(q="Кто крупнейший продавец по сумме сделок в 2025 году?",
         sql="SELECT seller_name, seller_inn, sum(amount_uzs) AS total, count(*) AS n FROM deals WHERE year=2025 AND NOT is_cancelled GROUP BY 1, 2 ORDER BY total DESC LIMIT 1",
         a="Крупнейший продавец 2025 года по сумме: {seller_name} (ИНН {seller_inn}) — {total} сум, {n} сделок.", n="Без аннулированных сделок."),
    dict(q="Какой брокер покупателя обслужил больше всего уникальных покупателей в 2024 году?",
         sql="SELECT buyer_broker, buyer_broker_name, count(DISTINCT buyer_inn) AS n_all, count(DISTINCT buyer_inn) FILTER (WHERE NOT is_cancelled) AS n_valid FROM deals WHERE year=2024 GROUP BY 1, 2 ORDER BY n_all DESC LIMIT 1",
         a="Больше всего уникальных покупателей в 2024 году обслужил {buyer_broker_name} ({buyer_broker}): {n_all} (по состоявшимся сделкам — {n_valid})."),
    dict(q="Qaysi oyda 2025-yilda bitimlar soni eng ko‘p bo‘lgan?",
         sql="SELECT month, count(*) AS n, count(*) FILTER (WHERE NOT is_cancelled) AS n_valid FROM deals WHERE year=2025 GROUP BY 1 ORDER BY n DESC LIMIT 1",
         a="2025-yilda eng ko‘p bitim {month}-oyda tuzilgan: {n} ta (amalga oshgan: {n_valid})."),
    # ---- participants / contracts / brokers (no deals join) ----
    dict(q="Сколько покупателей являются плательщиками НДС?",
         sql="SELECT count(*) AS n, (SELECT count(*) FROM participants WHERE role='Покупатель') AS total FROM participants WHERE role='Покупатель' AND vat_payer",
         a="Плательщиков НДС среди покупателей: {n} из {total}."),
    dict(q="Nechta brokerlik idorasi Toshkent shahrida joylashgan?",
         sql="SELECT count(*) AS n FROM brokers WHERE region='Toshkent shahri'",
         a="Toshkent shahrida {n} ta brokerlik idorasi joylashgan."),
    dict(q="Каков срок оплаты и залог по контракту 100002?",
         sql="SELECT product_name_raw, pay_term_days, delivery_term_days, deposit_pct, base_price, currency, unit, seller_name, reg_date, valid_until FROM contracts WHERE contract_id=100002",
         a="Контракт 100002 ({product_name_raw}, продавец {seller_name}): срок оплаты {pay_term_days} дн. от даты сделки, поставки — {delivery_term_days} дн. от оплаты, залог {deposit_pct}%, базисная цена {base_price} {currency} за {unit}, действует {reg_date}–{valid_until}."),
    # ---- terms / deadlines / registry ----
    dict(q="Сколько сделок поставлено с нарушением срока поставки в 2025 году?",
         sql="SELECT count(*) FILTER (WHERE is_delivery_late) AS n_late, count(*) FILTER (WHERE delivery_date IS NOT NULL) AS n_delivered FROM deals WHERE year=2025",
         a="В 2025 году с нарушением срока поставки исполнено {n_late} сделок из {n_delivered} поставленных.",
         n="Просрочка: дата поставки позже, чем дата оплаты + срок поставки по контракту."),
    dict(q="Сколько номеров сделок пропущено в реестре?",
         sql="SELECT max(deal_id) - min(deal_id) + 1 - count(*) AS skipped, min(deal_id) AS first_id, max(deal_id) AS last_id, count(*) AS n FROM deals",
         a="Номера сделок идут с {first_id} по {last_id}; всего сделок {n}, пропущено номеров: {skipped}."),
    dict(q="O‘rtacha to‘lov necha kunda amalga oshirilgan 2025-yilda?",
         sql="SELECT avg(pay_days) AS avg_days, min(pay_days) AS min_days, max(pay_days) AS max_days, count(*) AS n FROM deals WHERE year=2025 AND pay_date IS NOT NULL",
         a="2025-yilda to‘lov bitimdan keyin o‘rtacha {avg_days} kunda qilingan (min {min_days}, maks {max_days}; {n} ta to‘langan bitim)."),
    dict(q="Какой процент сделок 2024 года аннулирован?",
         sql="SELECT round(100.0*count(*) FILTER (WHERE is_cancelled)/count(*), 2) AS pct, count(*) FILTER (WHERE is_cancelled) AS n_cancel, count(*) AS n FROM deals WHERE year=2024",
         a="В 2024 году аннулировано {n_cancel} из {n} сделок ({pct}%)."),
    dict(q="Средняя сумма одной сделки в 2026 году?",
         sql="SELECT avg(amount_uzs) FILTER (WHERE NOT is_cancelled) AS avg_valid, avg(amount_uzs) AS avg_all, count(*) FILTER (WHERE NOT is_cancelled) AS n FROM deals WHERE year=2026",
         a="Средняя сумма сделки в 2026 году: {avg_valid} сум по {n} состоявшимся сделкам (с учётом аннулированных — {avg_all} сум)."),
    dict(q="\"Gehu Kimyo\" MChJ qaysi tovarlarni sotgan?",
         sql="SELECT product, count(*) AS n, sum(amount_uzs) FILTER (WHERE NOT is_cancelled) AS total FROM deals WHERE seller_inn=(SELECT inn FROM participants WHERE name='\"Gehu Kimyo\" MChJ') GROUP BY 1 ORDER BY n DESC",
         a="\"Gehu Kimyo\" MChJ sotgan tovarlar:", r="{i}. {product} — {n} ta bitim, {total} so‘m"),
    # ---- change over time / fields that do not exist ----
    dict(q="На сколько процентов изменилась средняя цена пшеницы в 2025 году по сравнению с 2024?",
         sql="WITH p AS (SELECT year, sum(amount_uzs) FILTER (WHERE NOT is_cancelled) / sum(volume) FILTER (WHERE NOT is_cancelled) AS w, avg(unit_price) FILTER (WHERE NOT is_cancelled) AS s FROM deals WHERE product='Пшеница' AND year IN (2024, 2025) GROUP BY year) SELECT a.w AS w_old, b.w AS w_new, round((b.w / a.w - 1) * 100, 2) AS w_change_pct, a.s AS s_old, b.s AS s_new, round((b.s / a.s - 1) * 100, 2) AS s_change_pct, 'UZS' AS currency, 'тонна' AS unit FROM p a, p b WHERE a.year=2024 AND b.year=2025",
         a="Средневзвешенная цена пшеницы: 2024 — {w_old} {currency}/{unit}, 2025 — {w_new} {currency}/{unit}, изменение {w_change_pct}%. Простая средняя цена: {s_old} → {s_new} {currency}/{unit} ({s_change_pct}%).",
         n="Изменение = (цена 2025 / цена 2024 − 1) × 100; аннулированные сделки не учитываются."),
    dict(q="Qancha paxta eksport qilingan va qaysi davlatlarga?",
         sql="SELECT product, count(*) AS n, count(*) FILTER (WHERE NOT is_cancelled) AS n_valid, sum(volume) FILTER (WHERE NOT is_cancelled) AS vol, any_value(unit) AS unit, sum(amount) FILTER (WHERE NOT is_cancelled) AS total_usd FROM deals WHERE contract_type='Экспортный' AND product IN ('Пряжа хлопчатобумажная', 'Хлопок-сырец') GROUP BY product",
         a="Reyestrda yuk boriladigan davlat haqida maydon yo‘q, shuning uchun davlatlarni aytib bo‘lmaydi. Paxta bo‘yicha eksport bitimlari faqat ip-kalava (paxta ipi) bo‘yicha bor:",
         r="{product} — {n} ta bitim ({n_valid} tasi amalga oshgan), {vol} {unit}, {total_usd} USD",
         n="Paxta xomashyosi faqat ichki bozorda sotilgan; bekor qilingan bitimlar hajm va summaga kiritilmagan."),
    dict(q="Qaysi broker eng faol?",
         sql="WITH b AS (SELECT seller_broker AS code, seller_broker_name AS name, 'sell' AS side, is_cancelled FROM deals UNION ALL SELECT buyer_broker, buyer_broker_name, 'buy', is_cancelled FROM deals) SELECT code, any_value(name) AS name, count(*) AS n, count(*) FILTER (WHERE side='sell') AS n_sell, count(*) FILTER (WHERE side='buy') AS n_buy, count(*) FILTER (WHERE NOT is_cancelled) AS n_valid FROM b GROUP BY code ORDER BY n DESC LIMIT 5",
         a="Eng faol brokerlar (sotuvchi va xaridor tomonidagi bitimlar jami):", r="{i}. {name} ({code}) — {n} ta bitim: sotuvchi tomonida {n_sell}, xaridor tomonida {n_buy}; amalga oshgan {n_valid}",
         n="Butun davr 03.01.2022–30.10.2026; bitta bitimda ikkala tomon brokeri hisoblanadi."),
]


def _grams(s: str) -> Counter:
    t = " " + re.sub(r"\d", "0", text_key(s)) + " "
    return Counter(t[i:i + 3] for i in range(len(t) - 2))


_DOCS = [_grams(e["q"]) for e in LIB]
_DF = Counter(g for d in _DOCS for g in d)
_IDF = {g: math.log((len(_DOCS) + 1) / (c + 1)) + 1 for g, c in _DF.items()}


def _vec(c: Counter) -> dict:
    v = {g: n * _IDF.get(g, 1.0) for g, n in c.items()}
    norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
    return {g: x / norm for g, x in v.items()}


_VECS = [_vec(d) for d in _DOCS]


def similar(q: str, k: int = 4) -> list[dict]:
    qv = _vec(_grams(q))
    scored = sorted(((sum(qv.get(g, 0) * x for g, x in v.items()), i) for i, v in enumerate(_VECS)), reverse=True)
    return [LIB[i] for s, i in scored[:k] if s > 0.05]


def render(examples: list[dict]) -> str:
    out = []
    for e in examples:
        line = f"Q: {e['q']}\nSQL: {e['sql']}\nanswer: {e['a']}"
        if e.get("r"):
            line += f"\nrow: {e['r']}"
        if e.get("n"):
            line += f"\nnote: {e['n']}"
        out.append(line)
    return "\n".join(out)
