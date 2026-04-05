"use client";

import { NewsItem } from "@/types";

// 속보 배너에 표시할 최대 항목 수
// Maximum number of items to display in breaking banner
const MAX_BREAKING_ITEMS = 5;

export default function BreakingBanner({ items }: { items: NewsItem[] }) {
  // 속보 항목 필터링
  // Filter breaking news items
  const breaking = items.filter((i) => i.isBreaking).slice(0, MAX_BREAKING_ITEMS);
  if (breaking.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="shrink-0 px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500/20 text-red-400 animate-pulse">
          🚨 속보
        </span>
        {/* 마키 콘텐츠 2벌 복제 — 끊김 없는 무한 루프 */}
        {/* Duplicate marquee content — seamless infinite loop */}
        <div className="overflow-hidden flex-1">
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {[...breaking, ...breaking].map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-300 hover:text-red-200 transition-colors shrink-0"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
