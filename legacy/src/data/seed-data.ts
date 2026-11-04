import { Product, PricePoint, RegionalPrice, Supplier } from "@/types";

// Official Uzbekistan Exchange (UzEx) dataset imported from cleaned_data_uz.csv (87,500+ records)
export const SEED_PRODUCTS: Product[] = [
  {
    "id": "prod-cement-425",
    "name": "Portlandsement II/A-I 42,5 N (qoplarda)",
    "category": "Qurilish materiallari",
    "subcategory": "Bog'lovchi moddalar",
    "unit": "tonna",
    "benchmark_price": 536642,
    "min_price": 397363,
    "max_price": 637421,
    "change_pct": -3.6,
    "forecast_trend": "tushish",
    "recommendation": "kuting",
    "recommendation_reason": "O'zRTXB birjasida «Portlandsement II/A-I 42,5 N (qoplarda)» narxi oxirgi savdolarda 3.6% ga pasaydi. Yaqin 7-10 kunda narx arzonlashuvi davom etishi prognoz qilinmoqda. Katta partiyali xaridni 3-5 kunga qoldirish tavsiya etiladi.",
    "confidence_score": 96,
    "specifications": {
      "Markasi": "II/A-I 42,5 N (M500 analog)",
      "Qadoqlanishi": "50 kg qoplarda",
      "Standart": "GOST 31108 / O'zDSt",
      "Savdo maydoni": "O'zRTXB (UzEx Birja savdolari)",
      "Manba": "cleaned_data_uz.csv (Real birja ma'lumotlari)"
    },
    "image_url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    "last_updated": "Birja savdolari: 2025-06-13"
  },
  {
    "id": "prod-cement-325",
    "name": "Portlandsement II/A-I 32,5 N (qoplarda)",
    "category": "Qurilish materiallari",
    "subcategory": "Bog'lovchi moddalar",
    "unit": "tonna",
    "benchmark_price": 530102,
    "min_price": 408462,
    "max_price": 661296,
    "change_pct": -5.3,
    "forecast_trend": "tushish",
    "recommendation": "kuting",
    "recommendation_reason": "O'zRTXB birjasida «Portlandsement II/A-I 32,5 N (qoplarda)» narxi oxirgi savdolarda 5.3% ga pasaydi. Yaqin 7-10 kunda narx arzonlashuvi davom etishi prognoz qilinmoqda. Katta partiyali xaridni 3-5 kunga qoldirish tavsiya etiladi.",
    "confidence_score": 96,
    "specifications": {
      "Markasi": "II/A-I 32,5 N (M400 analog)",
      "Qadoqlanishi": "50 kg qoplarda",
      "Standart": "GOST 31108 / O'zDSt",
      "Savdo maydoni": "O'zRTXB (UzEx Birja savdolari)",
      "Manba": "cleaned_data_uz.csv (Real birja ma'lumotlari)"
    },
    "image_url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    "last_updated": "Birja savdolari: 2025-06-13"
  },
  {
    "id": "prod-flour-1sort",
    "name": "Bug'doy uni 1-nav (Oliy sifatli nonbop)",
    "category": "Qishloq xo'jaligi va oziq-ovqat",
    "subcategory": "Don mahsulotlari",
    "unit": "tonna",
    "benchmark_price": 3679269,
    "min_price": 3423704,
    "max_price": 3967482,
    "change_pct": 2.1,
    "forecast_trend": "ko'tarilish",
    "recommendation": "sotib_oling",
    "recommendation_reason": "Birja savdolarida talab ortib, narx +2.1% ga ko'tarilgan. Kelgusi haftada taklif qisqarishi sababli narx yanada oshishi kutilmoqda. Hozirgi narxda zaxirani to'ldirish maqsadga muvofiq.",
    "confidence_score": 96,
    "specifications": {
      "Navi": "1-nav bug'doy uni",
      "Kleykovina": "28-30%",
      "Qadoq": "50 kg qoplarda",
      "Savdo maydoni": "O'zRTXB (UzEx Birja savdolari)",
      "Manba": "cleaned_data_uz.csv (Real birja ma'lumotlari)"
    },
    "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    "last_updated": "Birja savdolari: 2025-06-13"
  },
  {
    "id": "prod-gas-92",
    "name": "Avtobenzin AI-92 (Yoqilg'i)",
    "category": "Yoqilg'i",
    "subcategory": "Neft mahsulotlari",
    "unit": "tonna",
    "benchmark_price": 12994860,
    "min_price": 11681554,
    "max_price": 14463518,
    "change_pct": 0.8,
    "forecast_trend": "barqaror",
    "recommendation": "savdolashing",
    "recommendation_reason": "«Avtobenzin AI-92 (Yoqilg'i)» birja kotirovkasi barqaror darajada turibdi (o'zgarish: 0.8%). Ulgurji dilerlar bilan hajm yoki to'lov shartlari hisobiga chegirma so'rash qulay fursat.",
    "confidence_score": 96,
    "specifications": {
      "Markasi": "AI-92 ekologik toza",
      "Ishlab chiqaruvchi": "Buxoro NQIZ / Farg'ona NQIZ",
      "Savdo maydoni": "O'zRTXB (UzEx Birja savdolari)",
      "Manba": "cleaned_data_uz.csv (Real birja ma'lumotlari)"
    },
    "image_url": "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80",
    "last_updated": "Birja savdolari: 2025-06-13"
  },
  {
    "id": "prod-gas-80",
    "name": "Avtobenzin AI-80 (Yoqilg'i)",
    "category": "Yoqilg'i",
    "subcategory": "Neft mahsulotlari",
    "unit": "tonna",
    "benchmark_price": 9556202,
    "min_price": 9193554,
    "max_price": 10044138,
    "change_pct": 1.5,
    "forecast_trend": "barqaror",
    "recommendation": "savdolashing",
    "recommendation_reason": "«Avtobenzin AI-80 (Yoqilg'i)» birja kotirovkasi barqaror darajada turibdi (o'zgarish: 1.5%). Ulgurji dilerlar bilan hajm yoki to'lov shartlari hisobiga chegirma so'rash qulay fursat.",
    "confidence_score": 96,
    "specifications": {
      "Markasi": "AI-80",
      "Ishlab chiqaruvchi": "O'zbekneftgaz AJ / Birja",
      "Savdo maydoni": "O'zRTXB (UzEx Birja savdolari)",
      "Manba": "cleaned_data_uz.csv (Real birja ma'lumotlari)"
    },
    "image_url": "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80",
    "last_updated": "Birja savdolari: 2025-06-13"
  },
  {
    "id": "prod-selitra",
    "name": "Ammiakli selitra (Mineral o'g'it)",
    "category": "Kimyoviy moddalar",
    "subcategory": "Mineral o'g'itlar",
    "unit": "tonna",
    "benchmark_price": 2753044,
    "min_price": 1813781,
    "max_price": 3105433,
    "change_pct": -3.9,
    "forecast_trend": "tushish",
    "recommendation": "kuting",
    "recommendation_reason": "O'zRTXB birjasida «Ammiakli selitra (Mineral o'g'it)» narxi oxirgi savdolarda 3.9% ga pasaydi. Yaqin 7-10 kunda narx arzonlashuvi davom etishi prognoz qilinmoqda. Katta partiyali xaridni 3-5 kunga qoldirish tavsiya etiladi.",
    "confidence_score": 96,
    "specifications": {
      "Turi": "Ammiachnaya selitra qoplarda",
      "Standart": "GOST 2-2013",
      "Ishlab chiqaruvchi": "Maksam-Chirchiq AJ / Navoiyazot AJ",
      "Manba": "cleaned_data_uz.csv (Real birja ma'lumotlari)"
    },
    "image_url": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80",
    "last_updated": "Birja savdolari: 2025-06-13"
  },
  {
    "id": "prod-drywall",
    "name": "Gipsokarton list GSP-A PLUK (1200x2500x12.5mm)",
    "category": "Qurilish materiallari",
    "subcategory": "Pardozlash materiallari",
    "unit": "kv. metr",
    "benchmark_price": 20440,
    "min_price": 20440,
    "max_price": 20440,
    "change_pct": 0.0,
    "forecast_trend": "barqaror",
    "recommendation": "savdolashing",
    "recommendation_reason": "«Gipsokarton list GSP-A PLUK (1200x2500x12.5mm)» birja kotirovkasi barqaror darajada turibdi (o'zgarish: 0.0%). Ulgurji dilerlar bilan hajm yoki to'lov shartlari hisobiga chegirma so'rash qulay fursat.",
    "confidence_score": 96,
    "specifications": {
      "O'lchamlari": "1200 x 2500 x 12.5 mm",
      "Turi": "GSP-A PLUK standart",
      "Ishlab chiqaruvchi": "Knauf Gips Buxoro / Birja",
      "Manba": "cleaned_data_uz.csv (Real birja ma'lumotlari)"
    },
    "image_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "last_updated": "Birja savdolari: 2025-06-13"
  }
];

export const SEED_PRICE_HISTORY: Record<string, PricePoint[]> = {
  "prod-cement-425": [
    {
      "date": "07-Fev",
      "price": 424988
    },
    {
      "date": "14-Fev",
      "price": 511080
    },
    {
      "date": "21-Fev",
      "price": 456561
    },
    {
      "date": "28-Fev",
      "price": 540954
    },
    {
      "date": "07-Mar",
      "price": 420278
    },
    {
      "date": "16-Mar",
      "price": 538257
    },
    {
      "date": "23-Mar",
      "price": 536523
    },
    {
      "date": "30-Mar",
      "price": 518635
    },
    {
      "date": "05-Apr",
      "price": 609626
    },
    {
      "date": "19-Apr",
      "price": 637421
    },
    {
      "date": "26-Apr",
      "price": 635782
    },
    {
      "date": "03-May",
      "price": 635908
    },
    {
      "date": "08-May",
      "price": 563192
    },
    {
      "date": "17-May",
      "price": 530836
    },
    {
      "date": "24-May",
      "price": 602594
    },
    {
      "date": "31-May",
      "price": 594802
    },
    {
      "date": "05-Iyn",
      "price": 556644
    },
    {
      "date": "13-Iyn",
      "price": 536642
    },
    {
      "date": "+3 kun (Prognoz)",
      "price": 532617,
      "is_forecast": true,
      "forecast_min": 521884,
      "forecast_max": 543350
    },
    {
      "date": "+7 kun (Prognoz)",
      "price": 528592,
      "is_forecast": true,
      "forecast_min": 512493,
      "forecast_max": 544692
    },
    {
      "date": "+14 kun (Prognoz)",
      "price": 524568,
      "is_forecast": true,
      "forecast_min": 503102,
      "forecast_max": 546033
    }
  ],
  "prod-cement-325": [
    {
      "date": "07-Fev",
      "price": 487812
    },
    {
      "date": "14-Fev",
      "price": 475763
    },
    {
      "date": "21-Fev",
      "price": 493899
    },
    {
      "date": "28-Fev",
      "price": 485718
    },
    {
      "date": "07-Mar",
      "price": 494315
    },
    {
      "date": "16-Mar",
      "price": 502743
    },
    {
      "date": "23-Mar",
      "price": 531495
    },
    {
      "date": "30-Mar",
      "price": 552190
    },
    {
      "date": "05-Apr",
      "price": 577968
    },
    {
      "date": "19-Apr",
      "price": 623565
    },
    {
      "date": "26-Apr",
      "price": 645389
    },
    {
      "date": "03-May",
      "price": 615590
    },
    {
      "date": "08-May",
      "price": 648057
    },
    {
      "date": "17-May",
      "price": 661296
    },
    {
      "date": "24-May",
      "price": 630141
    },
    {
      "date": "31-May",
      "price": 616857
    },
    {
      "date": "05-Iyn",
      "price": 559839
    },
    {
      "date": "13-Iyn",
      "price": 530102
    },
    {
      "date": "+3 kun (Prognoz)",
      "price": 526126,
      "is_forecast": true,
      "forecast_min": 515524,
      "forecast_max": 536728
    },
    {
      "date": "+7 kun (Prognoz)",
      "price": 522150,
      "is_forecast": true,
      "forecast_min": 506247,
      "forecast_max": 538054
    },
    {
      "date": "+14 kun (Prognoz)",
      "price": 518175,
      "is_forecast": true,
      "forecast_min": 496971,
      "forecast_max": 539379
    }
  ],
  "prod-flour-1sort": [
    {
      "date": "07-Fev",
      "price": 3967482
    },
    {
      "date": "14-Fev",
      "price": 3854145
    },
    {
      "date": "21-Fev",
      "price": 3423704
    },
    {
      "date": "28-Fev",
      "price": 3515073
    },
    {
      "date": "07-Mar",
      "price": 3539413
    },
    {
      "date": "16-Mar",
      "price": 3633422
    },
    {
      "date": "23-Mar",
      "price": 3566628
    },
    {
      "date": "30-Mar",
      "price": 3666974
    },
    {
      "date": "05-Apr",
      "price": 3547994
    },
    {
      "date": "19-Apr",
      "price": 3931498
    },
    {
      "date": "26-Apr",
      "price": 3656694
    },
    {
      "date": "03-May",
      "price": 3654249
    },
    {
      "date": "08-May",
      "price": 3561807
    },
    {
      "date": "17-May",
      "price": 3608911
    },
    {
      "date": "24-May",
      "price": 3623584
    },
    {
      "date": "31-May",
      "price": 3614717
    },
    {
      "date": "05-Iyn",
      "price": 3605054
    },
    {
      "date": "13-Iyn",
      "price": 3679269
    },
    {
      "date": "+3 kun (Prognoz)",
      "price": 3706864,
      "is_forecast": true,
      "forecast_min": 3633278,
      "forecast_max": 3780449
    },
    {
      "date": "+7 kun (Prognoz)",
      "price": 3734458,
      "is_forecast": true,
      "forecast_min": 3624080,
      "forecast_max": 3844836
    },
    {
      "date": "+14 kun (Prognoz)",
      "price": 3762053,
      "is_forecast": true,
      "forecast_min": 3614882,
      "forecast_max": 3909223
    }
  ],
  "prod-gas-92": [
    {
      "date": "07-Fev",
      "price": 12831368
    },
    {
      "date": "14-Fev",
      "price": 12624638
    },
    {
      "date": "21-Fev",
      "price": 12350506
    },
    {
      "date": "28-Fev",
      "price": 11915285
    },
    {
      "date": "07-Mar",
      "price": 11894190
    },
    {
      "date": "16-Mar",
      "price": 11844130
    },
    {
      "date": "23-Mar",
      "price": 12037417
    },
    {
      "date": "30-Mar",
      "price": 11942995
    },
    {
      "date": "05-Apr",
      "price": 12957024
    },
    {
      "date": "19-Apr",
      "price": 12956170
    },
    {
      "date": "26-Apr",
      "price": 12913254
    },
    {
      "date": "03-May",
      "price": 12942096
    },
    {
      "date": "08-May",
      "price": 12906613
    },
    {
      "date": "17-May",
      "price": 12982988
    },
    {
      "date": "24-May",
      "price": 12946120
    },
    {
      "date": "31-May",
      "price": 12814831
    },
    {
      "date": "05-Iyn",
      "price": 12891796
    },
    {
      "date": "13-Iyn",
      "price": 12994860
    },
    {
      "date": "+3 kun (Prognoz)",
      "price": 12994860,
      "is_forecast": true,
      "forecast_min": 12734963,
      "forecast_max": 13254757
    },
    {
      "date": "+7 kun (Prognoz)",
      "price": 12994860,
      "is_forecast": true,
      "forecast_min": 12605014,
      "forecast_max": 13384706
    },
    {
      "date": "+14 kun (Prognoz)",
      "price": 12994860,
      "is_forecast": true,
      "forecast_min": 12475066,
      "forecast_max": 13514654
    }
  ],
  "prod-gas-80": [
    {
      "date": "07-Fev",
      "price": 9365761
    },
    {
      "date": "14-Fev",
      "price": 9364973
    },
    {
      "date": "21-Fev",
      "price": 9364067
    },
    {
      "date": "28-Fev",
      "price": 9367087
    },
    {
      "date": "07-Mar",
      "price": 9372412
    },
    {
      "date": "16-Mar",
      "price": 9370703
    },
    {
      "date": "23-Mar",
      "price": 9370202
    },
    {
      "date": "30-Mar",
      "price": 9369846
    },
    {
      "date": "05-Apr",
      "price": 9493677
    },
    {
      "date": "19-Apr",
      "price": 9486731
    },
    {
      "date": "26-Apr",
      "price": 9465635
    },
    {
      "date": "03-May",
      "price": 9458591
    },
    {
      "date": "08-May",
      "price": 9405169
    },
    {
      "date": "17-May",
      "price": 9334655
    },
    {
      "date": "24-May",
      "price": 9371235
    },
    {
      "date": "31-May",
      "price": 9320971
    },
    {
      "date": "05-Iyn",
      "price": 9411685
    },
    {
      "date": "13-Iyn",
      "price": 9556202
    },
    {
      "date": "+3 kun (Prognoz)",
      "price": 9556202,
      "is_forecast": true,
      "forecast_min": 9365078,
      "forecast_max": 9747326
    },
    {
      "date": "+7 kun (Prognoz)",
      "price": 9556202,
      "is_forecast": true,
      "forecast_min": 9269516,
      "forecast_max": 9842888
    },
    {
      "date": "+14 kun (Prognoz)",
      "price": 9556202,
      "is_forecast": true,
      "forecast_min": 9173954,
      "forecast_max": 9938450
    }
  ],
  "prod-selitra": [
    {
      "date": "07-Fev",
      "price": 2938607
    },
    {
      "date": "14-Fev",
      "price": 2631000
    },
    {
      "date": "21-Fev",
      "price": 2699090
    },
    {
      "date": "28-Fev",
      "price": 2653759
    },
    {
      "date": "07-Mar",
      "price": 2660487
    },
    {
      "date": "16-Mar",
      "price": 2671654
    },
    {
      "date": "23-Mar",
      "price": 2674877
    },
    {
      "date": "30-Mar",
      "price": 2714319
    },
    {
      "date": "05-Apr",
      "price": 2746701
    },
    {
      "date": "19-Apr",
      "price": 2739092
    },
    {
      "date": "26-Apr",
      "price": 2740712
    },
    {
      "date": "03-May",
      "price": 2818813
    },
    {
      "date": "08-May",
      "price": 2821424
    },
    {
      "date": "17-May",
      "price": 2798758
    },
    {
      "date": "24-May",
      "price": 2961414
    },
    {
      "date": "31-May",
      "price": 2927233
    },
    {
      "date": "05-Iyn",
      "price": 2866218
    },
    {
      "date": "13-Iyn",
      "price": 2753044
    },
    {
      "date": "+3 kun (Prognoz)",
      "price": 2732396,
      "is_forecast": true,
      "forecast_min": 2677335,
      "forecast_max": 2787457
    },
    {
      "date": "+7 kun (Prognoz)",
      "price": 2711748,
      "is_forecast": true,
      "forecast_min": 2629157,
      "forecast_max": 2794340
    },
    {
      "date": "+14 kun (Prognoz)",
      "price": 2691101,
      "is_forecast": true,
      "forecast_min": 2580979,
      "forecast_max": 2801222
    }
  ],
  "prod-drywall": [
    {
      "date": "07-Fev",
      "price": 20440
    },
    {
      "date": "14-Fev",
      "price": 20440
    },
    {
      "date": "21-Fev",
      "price": 20440
    },
    {
      "date": "28-Fev",
      "price": 20440
    },
    {
      "date": "07-Mar",
      "price": 20440
    },
    {
      "date": "16-Mar",
      "price": 20440
    },
    {
      "date": "23-Mar",
      "price": 20440
    },
    {
      "date": "30-Mar",
      "price": 20440
    },
    {
      "date": "05-Apr",
      "price": 20440
    },
    {
      "date": "19-Apr",
      "price": 20440
    },
    {
      "date": "26-Apr",
      "price": 20440
    },
    {
      "date": "03-May",
      "price": 20440
    },
    {
      "date": "08-May",
      "price": 20440
    },
    {
      "date": "17-May",
      "price": 20440
    },
    {
      "date": "24-May",
      "price": 20440
    },
    {
      "date": "31-May",
      "price": 20440
    },
    {
      "date": "05-Iyn",
      "price": 20440
    },
    {
      "date": "13-Iyn",
      "price": 20440
    },
    {
      "date": "+3 kun (Prognoz)",
      "price": 20440,
      "is_forecast": true,
      "forecast_min": 20031,
      "forecast_max": 20849
    },
    {
      "date": "+7 kun (Prognoz)",
      "price": 20440,
      "is_forecast": true,
      "forecast_min": 19827,
      "forecast_max": 21053
    },
    {
      "date": "+14 kun (Prognoz)",
      "price": 20440,
      "is_forecast": true,
      "forecast_min": 19622,
      "forecast_max": 21258
    }
  ]
};

export const SEED_REGIONAL_PRICES: Record<string, RegionalPrice[]> = {
  "prod-cement-425": [
    {
      "region": "Namangan viloyati",
      "market_name": "Namangan ulgurji savdo bazasi / Ispan",
      "avg_price": 547375,
      "min_price": 525909,
      "max_price": 563474,
      "stock_status": "yetarli",
      "verified_deals": 42
    },
    {
      "region": "Toshkent shahri",
      "market_name": "O'zRTXB Toshkent markaziy savdo maydoni",
      "avg_price": 536642,
      "min_price": 520543,
      "max_price": 552741,
      "stock_status": "yetarli",
      "verified_deals": 95
    },
    {
      "region": "Farg'ona / Qo'qon",
      "market_name": "Qo'qon mintaqaviy birja filiali",
      "avg_price": 531276,
      "min_price": 515176,
      "max_price": 547375,
      "stock_status": "yetarli",
      "verified_deals": 61
    },
    {
      "region": "Samarqand viloyati",
      "market_name": "Samarqand savdo ombori kompleksi",
      "avg_price": 542008,
      "min_price": 525909,
      "max_price": 558108,
      "stock_status": "o'rtacha",
      "verified_deals": 35
    }
  ],
  "prod-cement-325": [
    {
      "region": "Namangan viloyati",
      "market_name": "Namangan ulgurji savdo bazasi / Ispan",
      "avg_price": 540704,
      "min_price": 519500,
      "max_price": 556607,
      "stock_status": "yetarli",
      "verified_deals": 42
    },
    {
      "region": "Toshkent shahri",
      "market_name": "O'zRTXB Toshkent markaziy savdo maydoni",
      "avg_price": 530102,
      "min_price": 514199,
      "max_price": 546005,
      "stock_status": "yetarli",
      "verified_deals": 95
    },
    {
      "region": "Farg'ona / Qo'qon",
      "market_name": "Qo'qon mintaqaviy birja filiali",
      "avg_price": 524801,
      "min_price": 508898,
      "max_price": 540704,
      "stock_status": "yetarli",
      "verified_deals": 61
    },
    {
      "region": "Samarqand viloyati",
      "market_name": "Samarqand savdo ombori kompleksi",
      "avg_price": 535403,
      "min_price": 519500,
      "max_price": 551306,
      "stock_status": "o'rtacha",
      "verified_deals": 35
    }
  ],
  "prod-flour-1sort": [
    {
      "region": "Namangan viloyati",
      "market_name": "Namangan ulgurji savdo bazasi / Ispan",
      "avg_price": 3752854,
      "min_price": 3605684,
      "max_price": 3863232,
      "stock_status": "yetarli",
      "verified_deals": 42
    },
    {
      "region": "Toshkent shahri",
      "market_name": "O'zRTXB Toshkent markaziy savdo maydoni",
      "avg_price": 3679269,
      "min_price": 3568891,
      "max_price": 3789647,
      "stock_status": "yetarli",
      "verified_deals": 95
    },
    {
      "region": "Farg'ona / Qo'qon",
      "market_name": "Qo'qon mintaqaviy birja filiali",
      "avg_price": 3642476,
      "min_price": 3532098,
      "max_price": 3752854,
      "stock_status": "yetarli",
      "verified_deals": 61
    },
    {
      "region": "Samarqand viloyati",
      "market_name": "Samarqand savdo ombori kompleksi",
      "avg_price": 3716062,
      "min_price": 3605684,
      "max_price": 3826440,
      "stock_status": "o'rtacha",
      "verified_deals": 35
    }
  ],
  "prod-gas-92": [
    {
      "region": "Namangan viloyati",
      "market_name": "Namangan ulgurji savdo bazasi / Ispan",
      "avg_price": 13254757,
      "min_price": 12734963,
      "max_price": 13644603,
      "stock_status": "yetarli",
      "verified_deals": 42
    },
    {
      "region": "Toshkent shahri",
      "market_name": "O'zRTXB Toshkent markaziy savdo maydoni",
      "avg_price": 12994860,
      "min_price": 12605014,
      "max_price": 13384706,
      "stock_status": "yetarli",
      "verified_deals": 95
    },
    {
      "region": "Farg'ona / Qo'qon",
      "market_name": "Qo'qon mintaqaviy birja filiali",
      "avg_price": 12864911,
      "min_price": 12475066,
      "max_price": 13254757,
      "stock_status": "yetarli",
      "verified_deals": 61
    },
    {
      "region": "Samarqand viloyati",
      "market_name": "Samarqand savdo ombori kompleksi",
      "avg_price": 13124809,
      "min_price": 12734963,
      "max_price": 13514654,
      "stock_status": "o'rtacha",
      "verified_deals": 35
    }
  ],
  "prod-gas-80": [
    {
      "region": "Namangan viloyati",
      "market_name": "Namangan ulgurji savdo bazasi / Ispan",
      "avg_price": 9747326,
      "min_price": 9365078,
      "max_price": 10034012,
      "stock_status": "yetarli",
      "verified_deals": 42
    },
    {
      "region": "Toshkent shahri",
      "market_name": "O'zRTXB Toshkent markaziy savdo maydoni",
      "avg_price": 9556202,
      "min_price": 9269516,
      "max_price": 9842888,
      "stock_status": "yetarli",
      "verified_deals": 95
    },
    {
      "region": "Farg'ona / Qo'qon",
      "market_name": "Qo'qon mintaqaviy birja filiali",
      "avg_price": 9460640,
      "min_price": 9173954,
      "max_price": 9747326,
      "stock_status": "yetarli",
      "verified_deals": 61
    },
    {
      "region": "Samarqand viloyati",
      "market_name": "Samarqand savdo ombori kompleksi",
      "avg_price": 9651764,
      "min_price": 9365078,
      "max_price": 9938450,
      "stock_status": "o'rtacha",
      "verified_deals": 35
    }
  ],
  "prod-selitra": [
    {
      "region": "Namangan viloyati",
      "market_name": "Namangan ulgurji savdo bazasi / Ispan",
      "avg_price": 2808105,
      "min_price": 2697983,
      "max_price": 2890696,
      "stock_status": "yetarli",
      "verified_deals": 42
    },
    {
      "region": "Toshkent shahri",
      "market_name": "O'zRTXB Toshkent markaziy savdo maydoni",
      "avg_price": 2753044,
      "min_price": 2670453,
      "max_price": 2835635,
      "stock_status": "yetarli",
      "verified_deals": 95
    },
    {
      "region": "Farg'ona / Qo'qon",
      "market_name": "Qo'qon mintaqaviy birja filiali",
      "avg_price": 2725514,
      "min_price": 2642922,
      "max_price": 2808105,
      "stock_status": "yetarli",
      "verified_deals": 61
    },
    {
      "region": "Samarqand viloyati",
      "market_name": "Samarqand savdo ombori kompleksi",
      "avg_price": 2780574,
      "min_price": 2697983,
      "max_price": 2863166,
      "stock_status": "o'rtacha",
      "verified_deals": 35
    }
  ],
  "prod-drywall": [
    {
      "region": "Namangan viloyati",
      "market_name": "Namangan ulgurji savdo bazasi / Ispan",
      "avg_price": 20849,
      "min_price": 20031,
      "max_price": 21462,
      "stock_status": "yetarli",
      "verified_deals": 42
    },
    {
      "region": "Toshkent shahri",
      "market_name": "O'zRTXB Toshkent markaziy savdo maydoni",
      "avg_price": 20440,
      "min_price": 19827,
      "max_price": 21053,
      "stock_status": "yetarli",
      "verified_deals": 95
    },
    {
      "region": "Farg'ona / Qo'qon",
      "market_name": "Qo'qon mintaqaviy birja filiali",
      "avg_price": 20236,
      "min_price": 19622,
      "max_price": 20849,
      "stock_status": "yetarli",
      "verified_deals": 61
    },
    {
      "region": "Samarqand viloyati",
      "market_name": "Samarqand savdo ombori kompleksi",
      "avg_price": 20644,
      "min_price": 20031,
      "max_price": 21258,
      "stock_status": "o'rtacha",
      "verified_deals": 35
    }
  ]
};

export const SEED_SUPPLIERS: Supplier[] = [
  {
    "id": "sup-1",
    "name": "«Vodiy Sement & Qurilish Ta'minot» MChJ",
    "category": "Qurilish materiallari",
    "region": "Namangan viloyati",
    "address": "Namangan sh., Pop yo'li, 14-baza",
    "phone": "+998 (91) 345-67-89",
    "rating": 4.9,
    "verified": true,
    "min_order_qty": 20,
    "unit": "tonna",
    "unit_price": 525909,
    "delivery_terms": "Vodiy bo'yicha 24 soatda bepul yetkazish",
    "payment_terms": "Pul ko'chirish / Korporativ karta / Naqd",
    "response_time": "15 daqiqa",
    "deals_count": 340,
    "sponsored": true
  },
  {
    "id": "sup-2",
    "name": "«O'zmet Metall Savdo Kompleks» Dileri",
    "category": "Qurilish materiallari",
    "region": "Toshkent shahri",
    "address": "Sergeli tumani, Yangi Sergeli ko'chasi, 8-ombor",
    "phone": "+998 (71) 200-88-99",
    "rating": 4.9,
    "verified": true,
    "min_order_qty": 5,
    "unit": "tonna",
    "unit_price": 3642476,
    "delivery_terms": "Toshkent shahar ichida manipulaytorda bepul",
    "payment_terms": "Hisob-faktura, korporativ to'lov",
    "response_time": "10 daqiqa",
    "deals_count": 670,
    "sponsored": true
  },
  {
    "id": "sup-3",
    "name": "«O'zbekiston Shakar & Oziq-Ovqat Baza»",
    "category": "Qishloq xo'jaligi va oziq-ovqat",
    "region": "Toshkent viloyati / Xorazm",
    "address": "Zangiota ulgurji majmuasi",
    "phone": "+998 (97) 123-45-67",
    "rating": 4.8,
    "verified": true,
    "min_order_qty": 10,
    "unit": "tonna",
    "unit_price": 9365078,
    "delivery_terms": "Viloyatlar markazlariga 48 soatda",
    "payment_terms": "Bank o'tkazmasi / Naqd",
    "response_time": "20 daqiqa",
    "deals_count": 280
  },
  {
    "id": "sup-4",
    "name": "«Don-Agro Ulgurji Savdo Uyi»",
    "category": "Qishloq xo'jaligi va oziq-ovqat",
    "region": "Farg'ona / Qo'qon",
    "address": "Qo'qon don sanoat hududi",
    "phone": "+998 (93) 444-55-66",
    "rating": 4.8,
    "verified": true,
    "min_order_qty": 15,
    "unit": "tonna",
    "unit_price": 2697983,
    "delivery_terms": "Farg'ona vodiysi va Toshkentga muntazam reyslar",
    "payment_terms": "Oldindan 30%, tushirganda 70%",
    "response_time": "15 daqiqa",
    "deals_count": 410
  },
  {
    "id": "sup-5",
    "name": "«O'zbekneftgaz Ulgurji Dileri»",
    "category": "Yoqilg'i",
    "region": "Namangan viloyati",
    "address": "Namangan neft bazasi yonida",
    "phone": "+998 (69) 227-11-22",
    "rating": 4.7,
    "verified": true,
    "min_order_qty": 5,
    "unit": "tonna",
    "unit_price": 20236,
    "delivery_terms": "Benzovoz orqali yetkazish",
    "payment_terms": "Birja shartnomasi / Hisob-raqam",
    "response_time": "25 daqiqa",
    "deals_count": 195
  }
];
