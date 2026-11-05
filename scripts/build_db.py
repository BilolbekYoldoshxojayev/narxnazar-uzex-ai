"""Build data/uzex.duckdb from uzex_spot_data CSVs.  Usage: python scripts/build_db.py"""
import os
import sys
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from agent.catalog import PRODUCTS, canonical_key  # noqa: E402
from agent.textnorm import compact, name_key, parse_klass, parse_sort  # noqa: E402

SRC = Path(os.environ.get("UZEX_DATA", ROOT / "uzex_spot_data" / "uzex_spot_data"))
OUT = ROOT / "data" / "uzex.duckdb"
EXPECTED = {2022: 84299, 2023: 93985, 2024: 106647, 2025: 115763, 2026: 99306}

REGIONS = [  # uz (as in deals/participants), ru (as in contracts), uz cyrillic, extra aliases
    ("Toshkent shahri", "г. Ташкент", "Тошкент шаҳри", "ташкент город, toshkent sh, tashkent city, г.ташкент, город ташкент"),
    ("Toshkent viloyati", "Ташкентская область", "Тошкент вилояти", "ташкентская обл, toshkent vil"),
    ("Andijon viloyati", "Андижанская область", "Андижон вилояти", "андижан, andijon"),
    ("Buxoro viloyati", "Бухарская область", "Бухоро вилояти", "бухара, buxoro, bukhara"),
    ("Farg‘ona viloyati", "Ферганская область", "Фарғона вилояти", "фергана, fargona, fergana"),
    ("Jizzax viloyati", "Джизакская область", "Жиззах вилояти", "джизак, jizzax, jizzakh"),
    ("Namangan viloyati", "Наманганская область", "Наманган вилояти", "наманган, namangan"),
    ("Navoiy viloyati", "Навоийская область", "Навоий вилояти", "навои, navoiy, navoi"),
    ("Qashqadaryo viloyati", "Кашкадарьинская область", "Қашқадарё вилояти", "кашкадарья, qashqadaryo"),
    ("Qoraqalpog‘iston Respublikasi", "Республика Каракалпакстан", "Қорақалпоғистон Республикаси", "каракалпакстан, qoraqalpogiston, нукус"),
    ("Samarqand viloyati", "Самаркандская область", "Самарқанд вилояти", "самарканд, samarqand"),
    ("Sirdaryo viloyati", "Сырдарьинская область", "Сирдарё вилояти", "сырдарья, sirdaryo"),
    ("Surxondaryo viloyati", "Сурхандарьинская область", "Сурхондарё вилояти", "сурхандарья, surxondaryo"),
    ("Xorazm viloyati", "Хорезмская область", "Хоразм вилояти", "хорезм, xorazm, khorezm, ургенч"),
]


def num(col: str, t: str = "d") -> str:
    return f"CAST(NULLIF(replace(replace({t}.\"{col}\", ' ', ''), ' ', ''), '') AS DOUBLE)"


def dt(col: str, t: str = "d") -> str:
    return f"try_strptime(NULLIF({t}.\"{col}\", ''), '%d.%m.%Y')::DATE"


def main() -> None:
    OUT.parent.mkdir(exist_ok=True)
    tmp = OUT.with_suffix(".tmp")
    tmp.unlink(missing_ok=True)
    c = duckdb.connect(str(tmp))
    rd = lambda f: f"read_csv('{(SRC / f).as_posix()}', all_varchar=true, header=true, delim=',', quote='\"')"  # noqa: E731

    c.execute(f"CREATE TEMP TABLE rd AS SELECT * FROM {rd('deals_*.csv')}")
    c.execute(f"CREATE TEMP TABLE rk AS SELECT * FROM {rd('contracts.csv')}")
    c.execute(f"CREATE TEMP TABLE rp AS SELECT * FROM {rd('participants.csv')}")
    c.execute(f"CREATE TEMP TABLE rb AS SELECT * FROM {rd('brokers.csv')}")
    c.execute(f"CREATE TEMP TABLE ru AS SELECT * FROM {rd('usd_rates.csv')}")

    # ---------- small dimension tables ----------
    c.execute("CREATE TABLE regions(region VARCHAR, region_ru VARCHAR, region_uz_cyr VARCHAR, aliases VARCHAR)")
    c.executemany("INSERT INTO regions VALUES (?,?,?,?)", REGIONS)

    c.execute(f"CREATE TABLE usd_rates AS SELECT {dt('Дата', 'ru')} AS date, {num('Курс', 'ru')} AS rate FROM ru ORDER BY 1")

    c.execute("""CREATE TABLE brokers AS SELECT "Код брокера" AS broker_code, "Наименование" AS name,
                 "ИНН" AS inn, "Регион" AS region FROM rb ORDER BY 1""")
    c.execute("""CREATE TABLE participants AS SELECT "ИНН" AS inn, "Наименование" AS name, "Регион" AS region,
                 "Вид деятельности" AS activity, "Роль" AS role, ("Плательщик НДС"='Да') AS vat_payer FROM rp""")
    for t, key in (("brokers", "broker_code"), ("participants", "inn")):
        rows = c.execute(f"SELECT {key}, name FROM {t}").fetchall()
        c.execute(f"CREATE TEMP TABLE nk_{t}(k VARCHAR, name_key VARCHAR)")
        c.executemany(f"INSERT INTO nk_{t} VALUES (?,?)", [(k, name_key(n)) for k, n in rows])
        c.execute(f"CREATE TABLE {t}2 AS SELECT t.*, n.name_key FROM {t} t JOIN nk_{t} n ON n.k=t.{key} ORDER BY 1")
        c.execute(f"DROP TABLE {t}")
        c.execute(f"ALTER TABLE {t}2 RENAME TO {t}")

    # ---------- products ----------
    c.execute("CREATE TABLE products(product_id VARCHAR, product VARCHAR, product_uz VARCHAR, synonyms VARCHAR)")
    c.executemany("INSERT INTO products VALUES (?,?,?,?)", [(k, *v) for k, v in PRODUCTS.items()])

    # attribute vocab (brand/size/type) per HS code, taken from filled contract fields
    vocab: dict = {}
    for hs, marka, size, ptype in c.execute(
            """SELECT "Код ТН ВЭД", "Марка товара", "Размер товара", "Тип товара" FROM rk""").fetchall():
        v = vocab.setdefault(hs, {"marka": set(), "size": set(), "ptype": set()})
        if marka:
            v["marka"].add(compact(marka))
        if size:
            v["size"].add(compact(size))
        if ptype:
            v["ptype"].add(ptype.lower())

    def pick(opts, s):
        return max((o for o in opts if o in s), key=len, default=None)

    def attrs(hs: str, full: str):
        cf, lf = compact(full), full.lower()
        v = vocab.get(hs, {"marka": (), "size": (), "ptype": ()})
        return (canonical_key(hs, full), parse_sort(full), parse_klass(full),
                pick(v["marka"], cf), pick(v["size"], cf), pick(v["ptype"], lf))

    pv = c.execute("""SELECT DISTINCT d."Наименование товара", k."Код ТН ВЭД" FROM rd d
                      JOIN rk k ON k."Номер контракта" = d."Номер контракта" """).fetchall()
    c.execute("""CREATE TEMP TABLE pv(name VARCHAR, hs VARCHAR, pid VARCHAR, sort VARCHAR, klass VARCHAR,
                 marka VARCHAR, size VARCHAR, ptype VARCHAR)""")
    c.executemany("INSERT INTO pv VALUES (?,?,?,?,?,?,?,?)", [(n, hs, *attrs(hs, n)) for n, hs in pv])

    # ---------- contracts ----------
    c.execute(f"""CREATE TEMP TABLE kc AS SELECT
        CAST(k."Номер контракта" AS INTEGER) AS contract_id,
        k."Наименование продукта" AS product_name_raw, k."Марка товара" AS marka_raw, k."Размер товара" AS size_raw,
        k."Сорт товара" AS sort_raw, k."Тип товара" AS type_raw, k."Класс товара" AS klass_raw,
        k."Код ТН ВЭД" AS hs_code, k."Группа товара" AS product_group, k."Категория товара" AS category,
        k."Отрасль промышленности" AS industry, k."Единица измерения" AS unit, CAST(k."Лот" AS DOUBLE) AS lot_size,
        CASE k."Валюта" WHEN 'Доллар США' THEN 'USD' ELSE 'UZS' END AS currency,
        {num('Базисная цена', 'k')} AS base_price,
        CAST(replace(replace(k."Сумма залога", '%', ''), ' ', '') AS INTEGER) AS deposit_pct,
        k."Базис поставки" AS delivery_basis, k."Упаковка" AS packaging,
        r.region AS region, k."Регион" AS region_ru, k."Адрес склада" AS warehouse_address,
        k."Тип торгов" AS trade_type, k."Тип контракта" AS contract_type, k."Форма контракта" AS contract_form,
        CAST(k."Срок оплаты" AS INTEGER) AS pay_term_days, CAST(k."Срок поставки" AS INTEGER) AS delivery_term_days,
        k."ИНН продавца" AS seller_inn, p.name AS seller_name,
        {dt('Дата регистрации', 'k')} AS reg_date, {dt('Действует до', 'k')} AS valid_until
      FROM rk k LEFT JOIN regions r ON r.region_ru = k."Регион" LEFT JOIN participants p ON p.inn = k."ИНН продавца" """)
    rows = c.execute("""SELECT contract_id, hs_code, concat_ws(' ', product_name_raw, marka_raw, size_raw, sort_raw,
                        type_raw, klass_raw) FROM kc""").fetchall()
    c.execute("""CREATE TEMP TABLE ka(contract_id INTEGER, pid VARCHAR, sort VARCHAR, klass VARCHAR, marka VARCHAR,
                 size VARCHAR, ptype VARCHAR)""")
    c.executemany("INSERT INTO ka VALUES (?,?,?,?,?,?,?)", [(i, *attrs(hs, full)) for i, hs, full in rows])
    c.execute("""CREATE TABLE contracts AS SELECT kc.*, pr.product, pr.product_uz, ka.sort, ka.klass, ka.marka,
                 ka.size, ka.ptype FROM kc JOIN ka USING(contract_id) JOIN products pr ON pr.product_id = ka.pid
                 ORDER BY contract_id""")

    # ---------- deals ----------
    amt = num('Сумма сделки')
    vol = 'CAST(d."Количество" AS INTEGER) * CAST(d."Лот" AS DOUBLE)'
    c.execute(f"""CREATE TABLE deals AS SELECT
        CAST(d."Номер сделки" AS INTEGER) AS deal_id,
        {dt('Дата сделки')} AS deal_date, CAST(d."Время сделки" AS TIME) AS deal_time,
        CAST(year({dt('Дата сделки')}) AS INTEGER) AS year, CAST(month({dt('Дата сделки')}) AS INTEGER) AS month,
        d."Тип торгов" AS trade_type,
        CAST(d."Количество" AS INTEGER) AS qty_lots, CAST(d."Лот" AS DOUBLE) AS lot_size, d."Единица измерения" AS unit,
        {vol} AS volume,
        {amt} AS amount, k.currency,
        {num('Стартовая цена')} AS start_price,
        {amt} / ({vol}) AS unit_price,
        u.rate AS usd_rate,
        CASE WHEN k.currency = 'USD' THEN {amt} * u.rate ELSE {amt} END AS amount_uzs,
        CASE WHEN k.currency = 'USD' THEN {amt} ELSE {amt} / u.rate END AS amount_usd,
        CAST(d."Номер контракта" AS INTEGER) AS contract_id,
        d."Наименование товара" AS product_name, pr.product, pr.product_uz,
        pv.sort, pv.klass, pv.marka, pv.size, pv.ptype,
        k.hs_code, k.category, k.product_group, k.industry,
        d."Регион" AS region, r.region_ru,
        d."Тип контракта" AS contract_type, d."Форма контракта" AS contract_form,
        d."Состояние сделки" AS status,
        (d."Состояние сделки" = 'Аннулирован(Не оплачен)') AS is_cancelled,
        d."ИНН продавца" AS seller_inn, ps.name AS seller_name, ps.region AS seller_region,
        d."ИНН покупателя" AS buyer_inn, pb.name AS buyer_name, pb.region AS buyer_region,
        d."Брокер продавца" AS seller_broker, bs.name AS seller_broker_name,
        d."Брокер покупателя" AS buyer_broker, bb.name AS buyer_broker_name,
        {dt('Дата оплаты')} AS pay_date, {dt('Дата поставки')} AS delivery_date,
        CAST(NULLIF(d."Поставлено", '') AS INTEGER) AS delivered_lots,
        CAST(NULLIF(d."Поставлено", '') AS INTEGER) * CAST(d."Лот" AS DOUBLE) AS delivered_volume,
        k.pay_term_days, k.delivery_term_days, k.deposit_pct, k.base_price, k.delivery_basis,
        {dt('Дата сделки')} + k.pay_term_days AS pay_due_date,
        {dt('Дата оплаты')} + k.delivery_term_days AS delivery_due_date,
        {dt('Дата оплаты')} - {dt('Дата сделки')} AS pay_days,
        {dt('Дата поставки')} - {dt('Дата оплаты')} AS delivery_days,
        ({dt('Дата поставки')} - {dt('Дата оплаты')}) > k.delivery_term_days AS is_delivery_late,
        ({dt('Дата оплаты')} - {dt('Дата сделки')}) > k.pay_term_days AS is_pay_late,
        {amt} * k.deposit_pct / 100.0 AS deposit_amount,
        ({amt} / ({vol}) / {num('Стартовая цена')} - 1) * 100 AS price_change_pct
      FROM rd d
      JOIN kc k ON k.contract_id = CAST(d."Номер контракта" AS INTEGER)
      JOIN pv ON pv.name = d."Наименование товара" AND pv.hs = k.hs_code
      JOIN products pr ON pr.product_id = pv.pid
      LEFT JOIN usd_rates u ON u.date = {dt('Дата сделки')}
      LEFT JOIN regions r ON r.region = d."Регион"
      LEFT JOIN participants ps ON ps.inn = d."ИНН продавца"
      LEFT JOIN participants pb ON pb.inn = d."ИНН покупателя"
      LEFT JOIN brokers bs ON bs.broker_code = d."Брокер продавца"
      LEFT JOIN brokers bb ON bb.broker_code = d."Брокер покупателя"
      ORDER BY deal_id""")

    c.execute("""CREATE TABLE product_variants AS SELECT product, sort, klass, marka, size, ptype, unit,
                 count(*) AS n_deals FROM deals GROUP BY ALL ORDER BY product, n_deals DESC""")

    # ---------- assertions ----------
    raw = c.execute("SELECT count(*) FROM rd").fetchone()[0]
    got = dict(c.execute("SELECT year, count(*) FROM deals GROUP BY 1").fetchall())
    assert raw == 500000 and got == EXPECTED, (raw, got)
    checks = {
        "amount null": "SELECT count(*) FROM deals WHERE amount IS NULL OR start_price IS NULL",
        "rate null": "SELECT count(*) FROM deals WHERE usd_rate IS NULL",
        "party unknown": "SELECT count(*) FROM deals WHERE seller_name IS NULL OR buyer_name IS NULL",
        "broker unknown": "SELECT count(*) FROM deals WHERE seller_broker_name IS NULL OR buyer_broker_name IS NULL",
        "region unmapped": "SELECT count(*) FROM deals WHERE region_ru IS NULL",
        "contract region unmapped": "SELECT count(*) FROM contracts WHERE region IS NULL",
        "contracts lost": "SELECT 6616 - count(*) FROM contracts",
        "bad date": "SELECT count(*) FROM deals WHERE deal_date IS NULL OR deal_time IS NULL",
    }
    for label, q in checks.items():
        n = c.execute(q).fetchone()[0]
        assert n == 0, f"{label}: {n}"
    c.close()
    OUT.unlink(missing_ok=True)
    tmp.rename(OUT)
    print(f"OK {OUT} {OUT.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
