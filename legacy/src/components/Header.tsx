"use client";

import React from "react";
import {
  TrendingUp,
  Sparkles,
  Building2,
  ScanLine,
  HelpCircle,
  Sun,
  Moon,
  Search,
  MapPin,
} from "lucide-react";

interface HeaderProps {
  activeTab: "workspace" | "suppliers";
  setActiveTab: (tab: "workspace" | "suppliers") => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenPitchModal: () => void;
  onOpenScannerModal: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  selectedRegion,
  setSelectedRegion,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  onToggleDarkMode,
  onOpenPitchModal,
  onOpenScannerModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("workspace");
              }}
              className="flex items-center space-x-2.5 group"
            >
              {/* Official NarxNazar Logo Image */}
              <div className="h-10 w-auto flex items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
                <img
                  src="/narxnazar-logo.png"
                  alt="NarxNazar"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to text icon if image fails
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    Narx<span className="text-orange-500">Nazar</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5 text-orange-500" />
                    AI Platform
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                  O'zbekiston B2B Ulgurji Narx-Navo & Tahlil
                </p>
              </div>
            </a>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mahsulot qidirish (Sement, Armatura, Shakar, Benzin)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 rounded-xl focus:outline-none dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Nav Tabs */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab("workspace")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeTab === "workspace"
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Bozor Tahlili</span>
              </button>

              <button
                onClick={() => setActiveTab("suppliers")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeTab === "suppliers"
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Ulgurji Bozor (B2B)</span>
              </button>

              <button
                onClick={onOpenScannerModal}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
              >
                <ScanLine className="w-3.5 h-3.5 text-orange-500" />
                <span>AI Skaner</span>
              </button>
            </nav>

            {/* Region Selector */}
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
              >
                <option value="Barchasi">Barcha hududlar</option>
                <option value="Namangan viloyati">Namangan viloyati</option>
                <option value="Toshkent shahri">Toshkent shahri</option>
                <option value="Farg'ona / Qo'qon">Farg'ona / Qo'qon</option>
                <option value="Samarqand viloyati">Samarqand viloyati</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors border border-slate-200 dark:border-slate-700"
              aria-label="Tungi rejimni o'zgartirish"
              title={isDarkMode ? "Yorug' rejim" : "Tungi rejim (Dark Mode)"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Pitch Mode Button */}
            <button
              onClick={onOpenPitchModal}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs transition-all whitespace-nowrap"
              title="Hakamlar (Tim & O'ktam Hamidov) uchun taqdimot va arxitektura"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Pitch & Arxitektura</span>
              <span className="sm:hidden">Pitch</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden py-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulot qidirish..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg focus:outline-none dark:text-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
