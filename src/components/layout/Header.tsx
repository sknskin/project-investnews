"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  "/": "🏠",
  "/economy": "💰",
  "/politics": "🏛️",
  "/world": "🌍",
  "/crypto": "₿",
  "/stocks": "📈",
};

const NAV_ITEMS = [
  { href: "/", label: "전체" },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    href: `/${key}`,
    label,
  })),
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 1000);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-6 sm:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              IN
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              Invest<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">News</span>
            </span>
          </Link>

          {/* Navigation with fade edges */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background/60 to-transparent z-10 pointer-events-none sm:hidden" />
            <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-[12px] sm:text-[13px] rounded-full whitespace-nowrap transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-300 font-semibold ring-1 ring-blue-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <span className="text-sm">{CATEGORY_ICONS[item.href]}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background/60 to-transparent z-10 pointer-events-none sm:hidden" />
          </div>

          {/* Tagline */}
          <div className="text-[11px] text-muted-foreground/60 hidden lg:block shrink-0">
            실시간 투자 뉴스 · 1분 갱신
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors"
            title="새로고침"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-700 ${spinning ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
