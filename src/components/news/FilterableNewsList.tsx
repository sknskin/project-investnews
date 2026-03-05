"use client";

import { useState, useMemo } from "react";
import { NewsItem } from "@/types";
import NewsCard from "./NewsCard";

export default function FilterableNewsList({ items }: { items: NewsItem[] }) {
  const [activeSource, setActiveSource] = useState<string>("전체");

  const sources = useMemo(() => {
    const set = new Set(items.map((item) => item.source));
    return ["전체", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(
    () =>
      activeSource === "전체"
        ? items
        : items.filter((item) => item.source === activeSource),
    [items, activeSource]
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/60">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" />
        </svg>
        <p className="text-sm">뉴스를 불러오는 중 문제가 발생했습니다</p>
        <p className="text-xs mt-1">잠시 후 새로고침 해주세요</p>
      </div>
    );
  }

  return (
    <div>
      {/* Source filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-4 mb-1">
        {sources.map((source) => (
          <button
            key={source}
            onClick={() => setActiveSource(source)}
            className={`px-3 py-1 text-[12px] rounded-full whitespace-nowrap transition-all duration-200 ${
              activeSource === source
                ? "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25 font-medium"
                : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5"
            }`}
          >
            {source}
            {source !== "전체" && (
              <span className="ml-1 text-[10px] opacity-50">
                {items.filter((i) => i.source === source).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="text-[11px] text-muted-foreground/40 mb-3">
        {filtered.length}건 표시
      </div>

      {/* Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 animate-fade-in-up">
        {filtered.map((item, i) => (
          <NewsCard key={`${item.link}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
