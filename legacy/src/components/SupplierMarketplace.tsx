"use client";

import React, { useState } from "react";
import { Supplier, Product } from "@/types";
import { formatUZS } from "@/lib/utils";
import { Building2, Star, Clock, MapPin, Truck, Phone, Send, Sparkles } from "lucide-react";

interface SupplierMarketplaceProps {
  suppliers: Supplier[];
  products: Product[];
  selectedRegion: string;
  onRequestQuote: (supplier: Supplier) => void;
}

export function SupplierMarketplace({
  suppliers,
  products,
  selectedRegion,
  onRequestQuote,
}: SupplierMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Barchasi");

  const categories = ["Barchasi", ...Array.from(new Set(suppliers.map((s) => s.category)))];

  const filteredSuppliers = suppliers.filter((s) => {
    const matchRegion = selectedRegion === "Barchasi" || s.region.includes(selectedRegion);
    const matchCategory = selectedCategory === "Barchasi" || s.category === selectedCategory;
    return matchRegion && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tasdiqlangan B2B Ulgurji Yetkazib Beruvchilar
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              {filteredSuppliers.length} ta diler
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            O'zbekiston Savdo-sanoat palatasi va O'zRTXB dilerlari
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
              supplier.sponsored
                ? "border-orange-300 dark:border-orange-800 ring-1 ring-orange-200 dark:ring-orange-900"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                    <Building2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                      {supplier.name}
                    </h4>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{supplier.region}</span>
                    </div>
                  </div>
                </div>

                {supplier.sponsored && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5 text-orange-500" />
                    Top
                  </span>
                )}
              </div>

              {/* Price & MOQ highlight */}
              <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Ulgurji narxi:</span>
                  <span className="font-black text-orange-600 dark:text-orange-400 text-sm">
                    {formatUZS(supplier.unit_price)}
                    <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">
                      / {supplier.unit}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Minimal partiya (MOQ):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {supplier.min_order_qty} {supplier.unit}
                  </span>
                </div>
              </div>

              {/* Badges / Terms */}
              <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{supplier.delivery_terms}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>
                    Javob berish vaqti: <strong>{supplier.response_time}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-mono">{supplier.phone}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{supplier.rating}</span>
                <span className="text-slate-400">({supplier.deals_count} bitim)</span>
              </div>

              <button
                onClick={() => onRequestQuote(supplier)}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Taklif so'rash</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
