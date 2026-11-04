"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { PricePoint } from "@/types";
import { formatUZS } from "@/lib/utils";
import { Sparkles, Calendar } from "lucide-react";

interface PriceChartProps {
  data: PricePoint[];
  productName: string;
  unit: string;
  isDarkMode?: boolean;
}

export function PriceChart({ data, productName, unit, isDarkMode = false }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<"1W" | "ALL">("ALL");

  const displayData = timeRange === "1W" ? data.slice(-8) : data;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isForecast = item.is_forecast;

      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 backdrop-blur-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>{label}</span>
          </div>

          <div className="text-base font-bold text-emerald-400">
            {formatUZS(item.price)}
            <span className="text-[11px] font-normal text-slate-400 ml-1">/ {unit}</span>
          </div>

          {isForecast ? (
            <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-300 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>
                AI Koridori: {formatUZS(item.forecast_min)} — {formatUZS(item.forecast_max)}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">
              O'zRTXB rasmiy birja kotirovkasi
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const gridStroke = isDarkMode ? "#1e293b" : "#f1f5f9";
  const axisColor = isDarkMode ? "#94a3b8" : "#64748b";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
              Narxlar dinamikasi va 7 kunlik AI Prognoz
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              <Sparkles className="w-3 h-3 mr-1 text-orange-500" />
              Kelgusi 7 kun
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            O'zRTXB (UzEx) rasmiy birja kotirovkalari asosida
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setTimeRange("1W")}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeRange === "1W"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Yaqin haftalar
          </button>
          <button
            onClick={() => setTimeRange("ALL")}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeRange === "ALL"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Barcha savdolar + Prognoz
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPriceOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="date"
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: isDarkMode ? "#334155" : "#cbd5e1" }}
            />
            <YAxis
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
                if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
                return val;
              }}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
            />

            <Area
              type="monotone"
              dataKey="price"
              name="Bozor narxi (so'm)"
              stroke="#f97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPriceOrange)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>Faktik birja narxi</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>7 kunlik prognoz diapazoni</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          Manba: UzEx birja kotirovkalari (87,500+ qatorlik baza)
        </div>
      </div>
    </div>
  );
}
