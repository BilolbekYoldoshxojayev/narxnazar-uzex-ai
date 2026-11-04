"use client";

import React from "react";
import { RegionalPrice } from "@/types";
import { formatUZS } from "@/lib/utils";
import { MapPin, CheckCircle2, TrendingDown } from "lucide-react";

interface RegionalCompareProps {
  regionalData: RegionalPrice[];
  unit: string;
}

export function RegionalCompare({ regionalData, unit }: RegionalCompareProps) {
  if (!regionalData || regionalData.length === 0) return null;

  const cheapest = [...regionalData].sort((a, b) => a.min_price - b.min_price)[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Hududlar kesimida ulgurji narxlar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Yetkazib beruvchilar va viloyat bozorlaridagi real takliflar
          </p>
        </div>
        {cheapest && (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
            Eng arzon: {cheapest.region} ({formatUZS(cheapest.min_price)})
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Hudud / Bozor</th>
              <th className="py-2.5 px-3">O'rtacha narx</th>
              <th className="py-2.5 px-3">Minimal narx</th>
              <th className="py-2.5 px-3">Maksimal narx</th>
              <th className="py-2.5 px-3">Zaxira</th>
              <th className="py-2.5 px-3 text-right">Bitimlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {regionalData.map((item, idx) => {
              const isBest = item.min_price === cheapest.min_price;
              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                    isBest ? "bg-emerald-50/30 dark:bg-emerald-950/20 font-medium" : ""
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center">
                          {item.region}
                          {isBest && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              Tavsiya
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.market_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {formatUZS(item.avg_price)}
                    <span className="text-[10px] text-slate-400 ml-0.5">/ {unit}</span>
                  </td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatUZS(item.min_price)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    {formatUZS(item.max_price)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.stock_status === "yetarli"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : item.stock_status === "o'rtacha"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                      }`}
                    >
                      {item.stock_status === "yetarli"
                        ? "Yetarli"
                        : item.stock_status === "o'rtacha"
                        ? "O'rtacha"
                        : "Kam"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center text-slate-500 dark:text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mr-1" />
                      {item.verified_deals}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
