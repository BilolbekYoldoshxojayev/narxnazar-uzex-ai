"use client";

import React, { useState } from "react";
import { X, Cpu, Briefcase, ShieldCheck, CheckCircle2, DollarSign, Layers } from "lucide-react";

interface PitchModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PitchModeModal({ isOpen, onClose }: PitchModeModalProps) {
  const [activeTab, setActiveTab] = useState<"business" | "tech" | "industry">("business");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[92vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Hakamlar va Mentorlar Maxsus Rejimi (Pitch Mode)</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
          NarxNazar: Biznes Model va Texnik Arxitektura
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tim (Biznes mentor), O'ktam Hamidov (Texnik mentor) va Savdo-sanoat palatasi mezonlari
        </p>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4 space-x-4 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("business")}
            className={`pb-2.5 flex items-center space-x-1.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "business"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>1. Tim uchun: Biznes & Unit Economics</span>
          </button>
          <button
            onClick={() => setActiveTab("tech")}
            className={`pb-2.5 flex items-center space-x-1.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "tech"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. O'ktam uchun: Arxitektura & Git</span>
          </button>
          <button
            onClick={() => setActiveTab("industry")}
            className={`pb-2.5 flex items-center space-x-1.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "industry"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Soha mentori: 19-muammo</span>
          </button>
        </div>

        {/* Tab 1: Business (Tim) */}
        {activeTab === "business" && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-orange-50 dark:bg-orange-950/40 p-3 rounded-xl border border-orange-100 dark:border-orange-800/60">
                <div className="font-bold text-orange-900 dark:text-orange-300 mb-1">1. Pul ishlang</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Xaridor har partiyadan 5-8% tejaydi (500 qop sementda 1.5 - 2 mln so'm sof tejash).
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/60">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">2. Vaqtni tejang</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Telefon qilish va bozor kezish o'rniga 10 soniyada butun respublika kotirovkalari ko'rinadi.
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-100 dark:border-amber-800/60">
                <div className="font-bold text-amber-900 dark:text-amber-300 mb-1">3. Og'riqni oling</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Qimmat olib qo'yish qo'rquvi yo'qoladi, 7 kunlik prognoz narx tushishini oldindan aytadi.
                </p>
              </div>
            </div>

            {/* Bottom-up SOM */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Bottom-up Bozor Hajmi (SOM):</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">TAM (Mintaqa)</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">48,000 do'kon</div>
                  <div className="text-[10px] text-slate-500">$14.4M / yil</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">SAM (Vodiy + Toshkent)</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">14,000 do'kon</div>
                  <div className="text-[10px] text-slate-500">$4.2M / yil</div>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">SOM (1-2 yil)</div>
                  <div className="font-extrabold text-orange-700 dark:text-orange-300 text-sm">850 mijoz</div>
                  <div className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">$255,000 ARR</div>
                </div>
              </div>
            </div>

            {/* AI Unfair Advantage & Unit Economics */}
            <div className="p-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl space-y-2 border border-slate-800">
              <div className="font-bold text-orange-400 text-xs">
                Himoya (Unfair Advantage) & AI Unit Economics:
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong>Nega OpenAI buni takrorlay olmaydi?</strong> OpenAI'da O'rikzor, Bekto'pi yoki Namangan Ispan bozoridagi real kotirovkalar va dilerlik shartlari yo'q. Bizning ustunligimiz — <strong>O'zbekistonning 87,500+ kotirovkali tovar bazasi va tasdiqlangan dilerlik ekotizimi</strong>.
              </p>
              <div className="text-slate-300 text-[11px] pt-1.5 border-t border-slate-800">
                <strong>AI Harajati:</strong> Gemini 2.0 Flash orqali bitta tahlil so'rovi narxi — <strong>$0.0004</strong>. Bir mijoz oyiga 100 ta savol bersa ham, xarajat atigi $0.04 bo'ladi. Obuna narxi oyiga $15 (190,000 so'm). <strong>AI marjasi: &gt;97%!</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Technical (Uktam) */}
        {activeTab === "tech" && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                O'ktam Hamidov Texnik Mezonlari Tekshiruvi:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Git tarixi: Har bir modul alohida commit bilan</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Xavfsizlik: Barcha API tokenlar faqat .env.local da</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Baza: Supabase PostgreSQL + UzEx CSV ma'lumotlari</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Xatolik himoyasi: Internet uzilsa ham demo buzilmaydi</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-300 space-y-1">
              <div className="text-slate-500 dark:text-slate-400 font-sans font-bold text-xs mb-1">
                Loyiha Texnologik Steki:
              </div>
              <div>• Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS (Dark Mode)</div>
              <div>• Grafiklar: Recharts (ComposedChart, 7-Day Forecast Corridor)</div>
              <div>• Database: Supabase PostgreSQL (`rfq_requests`) + UzEx Dataset</div>
              <div>• Sun'iy intellekt: Gemini 2.0 Flash + Gemini Vision OCR</div>
            </div>
          </div>
        )}

        {/* Tab 3: Industry (Savdo-Sanoat) */}
        {activeTab === "industry" && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 rounded-xl text-orange-950 dark:text-orange-200 space-y-2">
              <div className="font-bold text-sm">
                Savdo-sanoat palatasi — 19-muammo (10/10 ball & +2 ball ustuvorlik):
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                «Bozorlardagi real narx-navo va talab-taklif boʻyicha yagona tahliliy maʼlumotlar bazasining yoʻqligi sababli tadbirkorlarning mahsulot xarid qilishda ortiqcha vaqt va mablagʻ yoʻqotishi.»
              </p>
              <div className="font-semibold text-xs pt-1 text-slate-900 dark:text-white">
                NarxNazar yechimi:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                <li>O'zRTXB rasmiy 87,500+ kotirovkali real birja narxlari benchmarki.</li>
                <li>Sun'iy intellekt orqali 7 kunlik narx prognozi va «Kuting / Oling» tavsiyasi.</li>
                <li>Landed cost va marja kalkulyatori bilan tadbirkor sof foydasini oshirish.</li>
                <li>Tasdiqlangan yetkazib beruvchilar va to'g'ridan-to'g'ri kotirovka so'rash (RFQ).</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
