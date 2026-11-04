"""Canonical products (sellers spell the same product differently; grouped by HS code).

Each entry: hs_code -> (canonical RU name, UZ name, extra search synonyms).
271019 holds two products, split by name in `canonical_product`.
"""

PRODUCTS = {
    "720853": ("Лист стальной горячекатаный", "Issiq prokat po‘lat list", "лист стальной, po'lat list, list, stal list, листовая сталь"),
    "721420": ("Арматура стальная", "Po‘lat armatura", "арматура, armatura"),
    "721710": ("Проволока арматурная", "Armatura simi", "проволока, sim, simi"),
    "740311": ("Катод медный", "Mis katod", "медный катод, катод, mis, katod"),
    "760421": ("Профиль алюминиевый", "Alyuminiy profil", "алюминиевый профиль, alyuminiy, profil"),
    "271012": ("Бензин автомобильный", "Avtomobil benzini", "бензин, benzin"),
    "271019D": ("Дизельное топливо", "Dizel yoqilg‘isi", "топливо дизельное, дизель, солярка, dizel, solyarka, дт"),
    "271019M": ("Мазут топочный", "Mazut", "мазут, mazut"),
    "271112": ("Сжиженный газ (пропан-бутан)", "Suyultirilgan gaz (propan-butan)", "сжиженный газ, газ сжиженный, пропан, бутан, суг, suyultirilgan gaz, propan, gaz"),
    "271320": ("Битум нефтяной", "Neft bitumi", "битум, bitum"),
    "390120": ("Полиэтилен", "Polietilen", "polietilen, пэ"),
    "390210": ("Полипропилен", "Polipropilen", "polipropilen, пп"),
    "390410": ("Поливинилхлорид (ПВХ)", "Polivinilxlorid (PVX)", "пвх, pvx, pvc, polivinilxlorid"),
    "100630": ("Рис", "Guruch", "рис шлифованный, guruch, sholi"),
    "110100": ("Мука пшеничная", "Bug‘doy uni", "мука, un, bugdoy uni"),
    "151219": ("Масло подсолнечное", "Kungaboqar yog‘i", "подсолнечное масло, kungaboqar yogi, kungaboqar"),
    "151229": ("Масло хлопковое", "Paxta yog‘i", "хлопковое масло, paxta yogi, chigit yogi"),
    "170199": ("Сахар", "Shakar", "сахар белый, сахар-песок, shakar, qand"),
    "220190": ("Вода питьевая", "Ichimlik suvi", "питьевая вода, вода, ichimlik suvi, suv"),
    "250100": ("Соль пищевая", "Osh tuzi", "соль, соль поваренная, tuz, osh tuzi"),
    "320810": ("Эмаль", "Emal (bo‘yoq)", "эмаль алкидная, emal, boyoq, краска"),
    "391721": ("Трубы полиэтиленовые", "Polietilen quvurlar", "труба пэ, трубы, труба, quvur, quvurlar"),
    "848210": ("Подшипник", "Podshipnik", "podshipnik"),
    "854449": ("Кабель силовой", "Kuch kabeli", "кабель, kabel"),
    "100199": ("Пшеница", "Bug‘doy", "пшеница продовольственная, bugdoy"),
    "230610": ("Шрот хлопковый", "Paxta shroti", "шрот, шрот хлопковых семян, shrot, kunjara"),
    "230990": ("Комбикорм", "Omuxta yem", "кормосмесь, корм, omuxta yem, yem"),
    "520100": ("Хлопок-сырец", "Paxta xomashyosi", "хлопок сырец, хлопок, paxta, xom paxta, paxta xom ashyosi"),
    "520512": ("Пряжа хлопчатобумажная", "Paxta ipi (kalava)", "пряжа, пряжа хлопковая, ip, kalava, paxta ipi"),
    "252020": ("Гипс строительный", "Gips", "гипс, gips"),
    "252210": ("Известь", "Ohak", "известь негашеная, известь строительная, ohak"),
    "252329": ("Портландцемент", "Sement", "цемент, цемент портландский, sement, portlandsement"),
    "440711": ("Пиломатериалы", "Yog‘och taxta (pilomaterial)", "пиломатериал, пиломатериал обрезной, доска, taxta, yogoch, pilomaterial"),
    "690410": ("Кирпич керамический", "G‘isht", "кирпич, gisht"),
    "700529": ("Стекло листовое (флоат)", "Shisha (list)", "стекло, стекло флоат, shisha, oyna"),
    "280421": ("Аргон газообразный", "Argon", "аргон, argon"),
    "280430": ("Азот", "Azot", "azot"),
    "280700": ("Кислота серная", "Sulfat kislota", "серная кислота, kislota, sulfat kislotasi, oltingugurt kislotasi"),
    "281511": ("Сода каустическая", "Kaustik soda", "каустик, kaustik soda, soda"),
    "310210": ("Карбамид (мочевина)", "Karbamid (mochevina)", "карбамид, мочевина, karbamid, mochevina"),
    "310230": ("Аммиачная селитра", "Ammiakli selitra", "селитра, селитра аммиачная, selitra, ammiakli selitra, ammiak selitrasi"),
}


def canonical_key(hs_code: str, product_name: str) -> str:
    if hs_code == "271019":
        return "271019M" if "мазут" in product_name.lower() else "271019D"
    return hs_code
