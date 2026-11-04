import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUZS(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " so'm";
}

export function formatCompactUZS(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1) + " mlrd so'm";
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + " mln so'm";
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + " ming so'm";
  }
  return formatUZS(amount);
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}
