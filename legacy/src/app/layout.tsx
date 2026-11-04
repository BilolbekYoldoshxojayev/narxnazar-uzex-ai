import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NarxNazar | AI Bozor Narx-Navo & Tahlil Platformasi",
  description: "O'zbekiston birja va ulgurji bozorlaridagi real narxlar, AI prognoz va eng maqbul yetkazib beruvchilarni topishning yagona aqlli platformasi.",
  icons: {
    icon: "/narxnazar-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
