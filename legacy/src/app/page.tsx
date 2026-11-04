"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProductWorkspace } from "@/components/ProductWorkspace";
import { SupplierMarketplace } from "@/components/SupplierMarketplace";
import { RfqModal } from "@/components/RfqModal";
import { InvoiceScannerModal } from "@/components/InvoiceScannerModal";
import { PitchModeModal } from "@/components/PitchModeModal";
import {
  SEED_PRODUCTS,
  SEED_PRICE_HISTORY,
  SEED_REGIONAL_PRICES,
  SEED_SUPPLIERS,
} from "@/data/seed-data";
import { Product, Supplier } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { HelpCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"workspace" | "suppliers">("workspace");
  const [selectedRegion, setSelectedRegion] = useState<string>("Barchasi");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to sleek dark mode

  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(SEED_PRODUCTS[0]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SEED_SUPPLIERS);

  // Modals state
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqSupplier, setRfqSupplier] = useState<Supplier | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  // Synchronize dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Load products from Supabase on mount if configured
  useEffect(() => {
    async function loadFromSupabase() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from("products").select("*");
          if (!error && data && data.length > 0) {
            setProducts(data);
            setSelectedProduct(data[0]);
          }
        } catch (e) {
          console.warn("Supabase fetch fallback to seed data:", e);
        }
      }
    }
    loadFromSupabase();
  }, []);

  // Filter products by search query
  const displayedProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q)
    );
  });

  // If search changes and selected product is filtered out, select the first matched one
  useEffect(() => {
    if (displayedProducts.length > 0 && !displayedProducts.some((p) => p.id === selectedProduct.id)) {
      setSelectedProduct(displayedProducts[0]);
    }
  }, [searchQuery]);

  const handleOpenRfq = (product: Product, supplier?: Supplier) => {
    setSelectedProduct(product);
    setRfqSupplier(supplier || null);
    setIsRfqModalOpen(true);
  };

  const currentPriceHistory =
    SEED_PRICE_HISTORY[selectedProduct.id] || SEED_PRICE_HISTORY["prod-cement-425"] || [];
  const currentRegionalPrices =
    SEED_REGIONAL_PRICES[selectedProduct.id] || SEED_REGIONAL_PRICES["prod-cement-425"] || [];

  // Match suppliers relevant to this product category
  const matchingSuppliers = suppliers.filter(
    (s) => s.category === selectedProduct.category || suppliers.indexOf(s) < 3
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
      />

      {/* Main Unified Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "workspace" && (
          <ProductWorkspace
            products={displayedProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
            priceHistory={currentPriceHistory}
            regionalPrices={currentRegionalPrices}
            matchingSuppliers={matchingSuppliers}
            onOpenRfq={handleOpenRfq}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === "suppliers" && (
          <SupplierMarketplace
            suppliers={suppliers}
            products={products}
            selectedRegion={selectedRegion}
            onRequestQuote={(supplier) => handleOpenRfq(selectedProduct, supplier)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 dark:text-white">
              Narx<span className="text-orange-500">Nazar</span>
            </span>
            <span>•</span>
            <span>O'zRTXB 87,500+ kotirovkalar bazasi bilan integratsiyalashgan</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPitchModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              Mentorlar & Hakamlar Rejimi
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-400">Umummilliy AI Xakaton — Namangan 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RfqModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        product={selectedProduct}
        supplier={rfqSupplier}
      />

      <InvoiceScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
      />

      <PitchModeModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
      />
    </div>
  );
}
