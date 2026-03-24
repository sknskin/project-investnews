"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

// 카테고리별 아이콘 매핑
// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  "/": "🏠",
  "/summary": "📊",
  "/domestic": "🇰🇷",
  "/international": "🌍",
  "/crypto": "₿",
};

// 네비게이션 항목
// Navigation items
const NAV_ITEMS = [
  { href: "/", label: "전체" },
  { href: "/summary", label: "지수" },
  { href: "/domestic", label: "국내뉴스" },
  { href: "/international", label: "해외뉴스" },
  { href: "/crypto", label: "코인뉴스" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [updatedTime, setUpdatedTime] = useState("--:--");
  const menuRef = useRef<HTMLDivElement>(null);

  const updateTime = () =>
    setUpdatedTime(
      new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

  useEffect(() => {
    updateTime();
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    router.refresh();
    updateTime();
    setTimeout(() => setSpinning(false), 1000);
  };

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-6 sm:gap-8">
          {/* Theme Toggle + Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              IN
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              Invest<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">News</span>
            </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex gap-1 flex-1 min-w-0">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] rounded-full whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/15 to-violet-500/15 text-blue-600 dark:text-blue-300 font-semibold ring-1 ring-blue-500/25 dark:ring-blue-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <span className="text-sm">{CATEGORY_ICONS[item.href]}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile spacer */}
          <div className="flex-1 sm:hidden" />

          {/* Tagline (desktop) */}
          <div className="text-[11px] text-muted-foreground/60 hidden lg:block shrink-0">
            실시간 투자 뉴스 · 1분 갱신
          </div>

          {/* Updated time + Refresh + Theme Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <span
              className="text-[10px] sm:text-[11px] text-muted-foreground/40 flex items-center gap-1"
              suppressHydrationWarning
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
              {updatedTime}
            </span>
            <button
              onClick={handleRefresh}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
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

          {/* Hamburger (mobile only) */}
          <div className="sm:hidden relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
              aria-label="메뉴"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/30 py-2 animate-fade-in-up">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                        isActive
                          ? "text-blue-600 dark:text-blue-300 bg-blue-500/10 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <span>{CATEGORY_ICONS[item.href]}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
