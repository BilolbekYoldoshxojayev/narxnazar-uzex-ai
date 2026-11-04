"use client";

import React, { useState, useEffect } from "react";
import { Product, LandedCostResult } from "@/types";
import { formatUZS, formatCompactUZS } from "@/lib/utils";
import { Calculator, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";

interface MarginCalculatorProps {
  product: Product;
  isCompact?: boolean;
}

export function MarginCalculator({ product, isCompact = false }: MarginCalculatorProps) {
  // Volume presets based on unit
  const isTons = product.unit.toLowerCase().includes("tonna");
  const defaultVolume = isTons ? 20 : 300;
  const defaultSalePrice = Math.round(product.benchmark_price * 1.12); // 12% retail margin

  const [volume, setVolume] = useState<number>(defaultVolume);
  const [purchasePrice, setPurchasePrice] = useState<number>(product.benchmark_price);
  const [transportCost, setTransportCost] = useState<number>(isTons ? 600000 : 350000);
  const [otherExpenses, setOtherExpenses] = useState<number>(isTons ? 250000 : 150000);
  const [targetSalePrice, setTargetSalePrice] = useState<number>(defaultSalePrice);

  const [results, setResults] = useState<LandedCostResult | null>(null);

  useEffect(() => {
    setPurchasePrice(product.benchmark_price);
    const newVol = product.unit.toLowerCase().includes("tonna") ? 20 : 300;
    setVolume(newVol);
    setTargetSalePrice(Math.round(product.benchmark_price * 1.12));
  }, [product.id, product.benchmark_price]);

  useEffect(() => {
    const totalPurchase = volume * purchasePrice;
    const totalExpenses = transportCost + otherExpenses;
    const totalLandedCost = totalPurchase + totalExpenses;
    const costPerUnit = volume > 0 ? totalLandedCost / volume : 0;
    const totalRevenue = volume * targetSalePrice;
    const grossProfit = totalRevenue - totalLandedCost;
    const marginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const roiPct = totalLandedCost > 0 ? (grossProfit / totalLandedCost) * 100 : 0;
    const breakEvenUnits = targetSalePrice > 0 ? Math.ceil(totalLandedCost / targetSalePrice) : 0;

    setResults({
      totalPurchase,
      totalExpenses,
      totalLandedCost,
      costPerUnit,
      targetSalePrice,
      totalRevenue,
      grossProfit,
      marginPct,
      roiPct,
      breakEvenUnits,
    });
  }, [volume, purchasePrice, transportCost, otherExpenses, targetSalePrice]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Landed Cost & Marja Kalkulyatori
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              «{product.name}» uchun xarid hajmi, yo'l xarajati va sof daromad hisoblagichi
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          Birja narxi: <strong className="text-slate-800 dark:text-slate-200">{formatUZS(product.benchmark_price)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Volume input + presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Xarid hajmi ({product.unit})
              </label>
              <div className="flex items-center space-x-1">
                {(isTons ? [5, 20, 50, 100] : [50, 200, 500, 1000]).map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setVolume(vol)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      volume === vol
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {vol}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="1"
              value={volume}
              onChange={(e) => setVolume(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold text-slate-900 dark:text-white"
            />
          </div>

          {/* Pricing grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Xarid narxi (1 {product.unit})
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-semibold text-slate-900 dark:text-white"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <button
                  type="button"
                  onClick={() => setPurchasePrice(product.min_price)}
                  className="hover:text-orange-500 underline"
                >
                  Min: {formatUZS(product.min_price)}
                </button>
                <button
                  type="button"
                  onClick={() => setPurchasePrice(product.benchmark_price)}
                  className="hover:text-orange-500 underline"
                >
                  O'rtacha
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transport & yetkazish xarajati
              </label>
              <input
                type="number"
                step="50000"
                value={transportCost}
                onChange={(e) => setTransportCost(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
              Do'konda sotish rejalashtirilgan narx (1 {product.unit})
            </label>
            <input
              type="number"
              value={targetSalePrice}
              onChange={(e) => setTargetSalePrice(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-900 dark:text-emerald-300"
            />
          </div>
        </div>

        {/* Right Output ROI Cards */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-4 flex flex-col justify-between shadow-md border border-slate-800">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <span className="text-[11px] uppercase font-bold text-orange-400">
                Moliyaviy Rentabellik
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ROI: {results ? results.roiPct.toFixed(1) : 0}%
              </span>
            </div>

            <div className="my-3 space-y-2.5">
              <div>
                <div className="text-[11px] text-slate-400">Haqiqiy tannarx (Dona boshiga landed cost)</div>
                <div className="text-lg font-bold text-white">
                  {results ? formatUZS(results.costPerUnit) : "0 so'm"}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ {product.unit}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400">Jami xarajat</div>
                  <div className="text-xs font-bold text-slate-200">
                    {results ? formatCompactUZS(results.totalLandedCost) : "0"}
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400">Kutilgan tushum</div>
                  <div className="text-xs font-bold text-slate-200">
                    {results ? formatCompactUZS(results.totalRevenue) : "0"}
                  </div>
                </div>
              </div>

              {/* Profit banner */}
              <div className="bg-emerald-950/70 border border-emerald-500/40 p-2.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">
                      Sof Foyda (Gross Profit)
                    </div>
                    <div className="text-xl font-black text-emerald-300 mt-0.5">
                      {results ? formatUZS(results.grossProfit) : "0 so'm"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-400">Marja</div>
                    <div className="text-lg font-extrabold text-emerald-300">
                      {results ? results.marginPct.toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Zararsizlik nuqtasi (Break-even):</span>
            <span className="font-bold text-slate-200">
              {results?.breakEvenUnits} {product.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
