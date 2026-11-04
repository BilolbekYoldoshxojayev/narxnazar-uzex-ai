"use client";

import React, { useState } from "react";
import { Product, Supplier } from "@/types";
import { X, Send, Building, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

interface RfqModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  supplier?: Supplier | null;
}

export function RfqModal({ isOpen, onClose, product, supplier }: RfqModalProps) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("+998 ");
  const [organization, setOrganization] = useState("");
  const [quantity, setQuantity] = useState(supplier?.min_order_qty || 20);
  const [targetPrice, setTargetPrice] = useState(supplier?.unit_price || product.benchmark_price);
  const [deliveryAddress, setDeliveryAddress] = useState("Namangan sh., Pop yo'li");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          supplier_id: supplier?.id,
          supplier_name: supplier?.name,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          buyer_organization: organization,
          quantity,
          unit: product.unit,
          delivery_address: deliveryAddress,
          target_price: targetPrice,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setSuccessMessage(data.message || "Arizangiz qabul qilindi!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Kotirovka so'rovi yuborildi!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              {successMessage} Yetkazib beruvchi tez orada siz bilan bog'lanadi.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-mono text-left max-w-xs mx-auto border border-slate-200 dark:border-slate-700">
              <div>Tovar: {product.name}</div>
              <div>Hajm: {quantity} {product.unit}</div>
              <div>Holat: Supabase bazasida saqlandi ✓</div>
            </div>
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
            >
              Yopish
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 font-semibold text-xs uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>B2B Ulgurji Kotirovka So'rovi (RFQ)</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {supplier ? supplier.name : product.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To'g'ridan-to'g'ri dilerdan eng qulay narx taklifini oling
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Azizbek Rahimov"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telefon raqam *
                </label>
                <input
                  type="text"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kompaniya / Do'kon nomi
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="«Stroy City» MChJ"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Xarid hajmi ({product.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Yetkazib berish manzili
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-xl border border-orange-200 dark:border-orange-800 text-[11px] text-orange-800 dark:text-orange-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span>
                So'rov to'g'ridan-to'g'ri dilerga yuboriladi va Supabase PostgreSQL bazasida qayd etiladi.
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center space-x-1.5 shadow-xs disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Taklif so'rash</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
