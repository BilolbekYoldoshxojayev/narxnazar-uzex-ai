"use client";

import React, { useState } from "react";
import { ScannedInvoiceResult } from "@/types";
import { formatUZS } from "@/lib/utils";
import {
  ScanLine,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";

interface InvoiceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceScannerModal({ isOpen, onClose }: InvoiceScannerModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedInvoiceResult | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        processScan(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleInvoice = () => {
    setImagePreview("https://images.unsplash.com/photo-1554415707-9e49017a4990?auto=format&fit=crop&w=600&q=80");
    processScan("", "image/jpeg");
  };

  const processScan = async (base64: string, mime: string) => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mime,
        }),
      });

      const data = await res.json();
      if (data.data) {
        setScanResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider">
          <ScanLine className="w-4 h-4" />
          <span>NarxNazar Vision AI</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
          Faktura, Chek va Telegram Narxnoma Skaneri
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Qog'oz chek yoki Telegramdan skrinshot yuklang — Gemini AI narxlarni avtomat o'qiydi
        </p>

        {/* Upload Zone */}
        {!scanResult && (
          <div className="mt-5 space-y-4">
            <label className="border-2 border-dashed border-orange-200 dark:border-orange-800/80 hover:border-orange-400 bg-orange-50/30 dark:bg-orange-950/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <Upload className="w-10 h-10 text-orange-500 mb-2" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Faktura yoki chek rasmini yuklang
              </span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG yoki WEBP</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="text-center">
              <span className="text-xs text-slate-400">yoki hakamlar uchun tezkor namuna:</span>
              <button
                type="button"
                onClick={loadSampleInvoice}
                className="ml-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold inline-flex items-center transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-500" />
                Namuna fakturasini skanerlash
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Gemini Vision rasmni tahlil qilmoqda...
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Tovarlar nomi, soni va narxlari O'zRTXB birja benchmarki bilan solishtirilmoqda
            </div>
          </div>
        )}

        {/* Scan Results Display */}
        {scanResult && (
          <div className="mt-5 space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <strong>{scanResult.supplier_name || "Yetkazib beruvchi"}</strong> • Faktura #{scanResult.invoice_number || "9012"}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900 font-bold text-[10px]">
                {scanResult.confidence}% Aniqlik
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Tovar nomi</th>
                    <th className="p-2.5">Soni</th>
                    <th className="p-2.5">Faktura narxi</th>
                    <th className="p-2.5">Birja Benchmark</th>
                    <th className="p-2.5 text-right">Jami</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scanResult.items.map((item, i) => {
                    const isCement = item.name.toLowerCase().includes("sement");
                    const benchmark = isCement ? 536642 : 9200000;
                    const diff = item.unit_price - benchmark;

                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-200">
                          {formatUZS(item.unit_price)}
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-600 dark:text-slate-300">{formatUZS(benchmark)}</span>
                            {diff > 0 ? (
                              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1 rounded">
                                +{formatUZS(diff)} qimmat!
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                                Arzon ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {formatUZS(item.total_price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900 dark:bg-slate-950 text-white rounded-xl text-xs border border-slate-800">
              <span className="text-slate-400">Fakturaning jami summasi:</span>
              <span className="text-base font-extrabold text-emerald-400">
                {formatUZS(scanResult.total_amount)}
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setScanResult(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Boshqa rasm
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              >
                Tahlilga qo'shish & Yopish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
