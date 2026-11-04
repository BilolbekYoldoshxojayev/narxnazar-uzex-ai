"use client";

import React, { useState, useRef, useEffect } from "react";
import { Product, AiChatMessage } from "@/types";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";

interface AiAnalystPanelProps {
  product: Product;
}

export function AiAnalystPanel({ product }: AiAnalystPanelProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content: `Assalomu alaykum! Men NarxNazar sun'iy intellekt tahlilchisiman. Siz hozir «${product.name}» birja kotirovkalarini ko'rib turibsiz. Narx prognozi yoki eng maqbul xarid rejasi bo'yicha qanday savolingiz bor?`,
      timestamp: "Hozir",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Nega narx tushishi kutilmoqda?",
    "Qaysi hududdan olsam arzonroq?",
    "Hozir xarid qilaymi yoki 3 kun kutaymi?",
    "Diler bilan qanday savdolashsam bo'ladi?",
  ];

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `«${product.name}» bo'yicha birja ma'lumotlari yangilandi. Joriy benchmark: ${product.benchmark_price.toLocaleString()} so'm / ${product.unit}. Bozor bo'yicha qanday tahlil kerak?`,
        timestamp: "Hozir",
      },
    ]);
  }, [product.id, product.name, product.benchmark_price, product.unit]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: AiChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          product,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const botReply: AiChatMessage = {
        role: "assistant",
        content: data.reply || "Kechirasiz, ma'lumotni tahlil qilishda qiyinchilik bo'ldi.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Server bilan bog'lanishda uzilish bo'ldi. Iltimos qayta urinib ko'ring.",
          timestamp: "Hozir",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[520px] overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30">
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="font-bold text-xs flex items-center space-x-1.5">
              <span>NarxNazar AI Tahlilchi</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-300 truncate max-w-[180px]">
              {product.name}
            </div>
          </div>
        </div>

        <div className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-300 font-mono">
          Gemini RAG
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/60">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              m.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                m.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-white dark:bg-slate-800 text-orange-500 border border-slate-200 dark:border-slate-700 shadow-xs"
              }`}
            >
              {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-orange-500 text-white rounded-tr-none shadow-xs"
                  : "bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-xs"
              }`}
            >
              <div className="whitespace-pre-line">{m.content}</div>
              <div
                className={`text-[9px] mt-1 text-right ${
                  m.role === "user" ? "text-orange-100" : "text-slate-400"
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 p-2 rounded-xl border border-orange-200 dark:border-orange-800 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Birja kotirovkalari tahlil qilinmoqda...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-[10px] whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Birja yoki narx bo'yicha savol bering..."
            disabled={isLoading}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
