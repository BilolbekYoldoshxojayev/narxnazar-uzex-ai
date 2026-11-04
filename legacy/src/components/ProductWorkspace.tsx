"use client";

import React, { useState } from "react";
import { Product, PricePoint, RegionalPrice, Supplier } from "@/types";
import { formatUZS, formatPercent } from "@/lib/utils";
import { PriceChart } from "./PriceChart";
import { RegionalCompare } from "./RegionalCompare";
import { MarginCalculator } from "./MarginCalculator";
import { AiAnalystPanel } from "./AiAnalystPanel";
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Building2,
  ScanLine,
  ChevronRight,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

interface ProductWorkspaceProps {
  products: Product[];
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  priceHistory: PricePoint[];
  regionalPrices: RegionalPrice[];
  matchingSuppliers: Supplier[];
  onOpenRfq: (product: Product, supplier?: Supplier) => void;
  onOpenScanner: () => void;
  isDarkMode: boolean;
}

export function ProductWorkspace({
  products,
  selectedProduct,
  onSelectProduct,
  priceHistory,
  regionalPrices,
  matchingSuppliers,
  onOpenRfq,
  onOpenScanner,
  isDarkMode,
}: ProductWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Barchasi");

  const categories = ["Barchasi", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter(
    (p) => activeCategory === "Barchasi" || p.category === activeCategory
  );

  const getDecisionBadge = (rec: string) => {
    switch (rec) {
      case "sotib_oling":
        return {
          label: "Hozir xarid qiling",
          bg: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        };
      case "kuting":
        return {
          label: "2-3 kun kuting (Narx tushishi kutilmoqda)",
          bg: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        };
      case "savdolashing":
        return {
          label: "Yetkazib beruvchi bilan savdolashing",
          bg: "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800",
          icon: <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      default:
        return {
          label: "Bozorni o'rganing",
          bg: "bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
          icon: <AlertCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        };
    }
  };

  const decision = getDecisionBadge(selectedProduct.recommendation);

  return (
    <div className="space-y-6">
      {/* 1. Category and Product Horizontal Selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Kategoriya:
            </span>
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white dark:bg-orange-500 dark:text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 self-end sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>{selectedProduct.last_updated}</span>
          </div>
        </div>

        {/* Product Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {filteredProducts.map((p) => {
            const isSelected = p.id === selectedProduct.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center space-x-2 ${
                  isSelected
                    ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                <span>{p.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? "bg-orange-600 text-orange-100"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {formatUZS(p.benchmark_price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top AI Decision Banner */}
      <div
        className={`p-4 rounded-2xl border ${decision.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-colors`}
      >
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs mt-0.5">
            {decision.icon}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>AI Tahliliy Xulosa: {decision.label}</span>
            </div>
            <p className="text-xs sm:text-sm mt-1 leading-relaxed max-w-3xl">
              {selectedProduct.recommendation_reason}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
          <button
            onClick={() => onOpenRfq(selectedProduct)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kotirovka so'rash</span>
          </button>
        </div>
      </div>

      {/* 3. 4 Core Benchmark Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Bozor Benchmark Narxi
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatUZS(selectedProduct.benchmark_price)}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs">
            <span
              className={`inline-flex items-center font-bold ${
                selectedProduct.change_pct > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : selectedProduct.change_pct < 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {selectedProduct.change_pct > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              )}
              {formatPercent(selectedProduct.change_pct)}
            </span>
            <span className="text-[11px] text-slate-400">oxirgi savdoda</span>
          </div>
          <div className="absolute right-3 top-3 text-[10px] text-slate-400 font-mono">
            {selectedProduct.unit}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Bozor Narx Diapazoni
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 flex items-baseline space-x-1">
            <span className="text-emerald-600 dark:text-emerald-400">
              {formatUZS(selectedProduct.min_price)}
            </span>
            <span className="text-slate-400 text-xs">—</span>
            <span className="text-slate-600 dark:text-slate-300">
              {formatUZS(selectedProduct.max_price)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Tejamkorlik imkoniyati:{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatUZS(selectedProduct.max_price - selectedProduct.min_price)}
            </strong>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Ma'lumot Ishonchliligi</span>
            <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">
              {selectedProduct.confidence_score}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${selectedProduct.confidence_score}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>UzEx Birja & Tasdiqlangan Dilerlar</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            7 Kunlik AI Prognozi
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${
                selectedProduct.forecast_trend === "tushish"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : selectedProduct.forecast_trend === "ko'tarilish"
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {selectedProduct.forecast_trend === "tushish"
                ? "📉 Pasayish kutilmoqda"
                : selectedProduct.forecast_trend === "ko'tarilish"
                ? "📈 O'sish kutilmoqda"
                : "➡️ Barqaror narx"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Ishonchlilik: 94% (ARIMA + Gemini RAG)
          </div>
        </div>
      </div>

      {/* 4. Unified Main 2-Column Grid: Charts & Calculator (8 cols) + AI Analyst (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Price Movement Chart */}
          <PriceChart
            data={priceHistory}
            productName={selectedProduct.name}
            unit={selectedProduct.unit}
            isDarkMode={isDarkMode}
          />

          {/* Embedded Margin & Landed Cost Calculator */}
          <MarginCalculator product={selectedProduct} />

          {/* Matching Verified Suppliers for THIS product */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <span>«{selectedProduct.name}» uchun ulgurji takliflar</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  To'g'ridan-to'g'ri dilerlar va birja ishtirokchilari
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                {matchingSuppliers.length} ta diler mavjud
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {matchingSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 p-2.5 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {supplier.name}
                      </span>
                      {supplier.verified && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Tasdiqlangan ✓
                        </span>
                      )}
                      <div className="flex items-center text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-slate-700 dark:text-slate-300 font-bold ml-1">
                          {supplier.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3">
                      <span>{supplier.region}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Truck className="w-3 h-3 mr-1 text-slate-400" />
                        {supplier.delivery_terms}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
                        {formatUZS(supplier.unit_price)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        MOQ: {supplier.min_order_qty} {supplier.unit}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenRfq(selectedProduct, supplier)}
                      className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Kotirovka olish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Price Breakdown Table */}
          <RegionalCompare regionalData={regionalPrices} unit={selectedProduct.unit} />

          {/* Product Specifications Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Mahsulot Standartlari va Pasport Ma'lumotlari
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(selectedProduct.specifications).map(([key, val], i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"
                >
                  <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5 sticky top-20">
          {/* Grounded Gemini AI Analyst Panel */}
          <AiAnalystPanel product={selectedProduct} />

          {/* AI Invoice Scanner Prompt Banner */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-sm">Faktura yoki Narxnoma bormi?</h4>
            </div>
            <p className="text-xs text-orange-50 leading-relaxed">
              Telegramdan skrinshot yoki qog'oz chek rasmini yuklang — sun'iy intellekt narxlarni
              birja benchmarki bilan solishtirib beradi.
            </p>
            <button
              onClick={onOpenScanner}
              className="w-full py-2 bg-white hover:bg-orange-50 text-orange-600 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
            >
              <span>Rasmdan narxlarni o'qish (AI OCR)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
