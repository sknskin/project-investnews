"use client";

import { useState, useMemo } from "react";
import { NewsItem } from "@/types";
import NewsCard from "./NewsCard";

// 시간 그룹 기준 (밀리초)
// Time group thresholds (ms)
const ONE_HOUR_MS = 3600000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const TWO_DAYS_MS = 48 * ONE_HOUR_MS;

// 시간 그룹 라벨
// Time group labels
const TIME_GROUP_LABELS = [
  "1시간 이내",
  "3시간 이내",
  "오늘",
  "어제",
  "이전",
] as const;

/**
 * 뉴스 항목을 시간대별로 그룹화한다.
 * Groups news items by time period.
 */
function groupByTime(items: NewsItem[]) {
  const now = Date.now();
  const groups: { label: string; items: NewsItem[] }[] = TIME_GROUP_LABELS.map(
    (label) => ({ label, items: [] })
  );

  for (const item of items) {
    const diff = now - new Date(item.pubDate).getTime();
    const hours = diff / ONE_HOUR_MS;
    if (hours < 1) groups[0].items.push(item);
    else if (hours < 3) groups[1].items.push(item);
    else if (diff < ONE_DAY_MS) groups[2].items.push(item);
    else if (diff < TWO_DAYS_MS) groups[3].items.push(item);
    else groups[4].items.push(item);
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function FilterableNewsList({ items }: { items: NewsItem[] }) {
  const [activeSource, setActiveSource] = useState<string>("전체");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

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

  // 타임라인 모드용 시간 그룹
  // Time groups for timeline mode
  const timeGroups = useMemo(() => groupByTime(filtered), [filtered]);

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
            className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-[12px] rounded-full whitespace-nowrap transition-all duration-200 ${
              activeSource === source
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/25 font-medium"
                : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent"
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

      {/* 건수 및 보기 모드 토글 */}
      {/* Count and view mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] sm:text-[11px] text-muted-foreground/40">
          {filtered.length}건 표시
        </div>
        <button
          onClick={() =>
            setViewMode((prev) => (prev === "grid" ? "timeline" : "grid"))
          }
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] sm:text-[11px] text-muted-foreground/60 hover:text-muted-foreground rounded-md hover:bg-accent transition-colors"
          title={viewMode === "grid" ? "타임라인 보기" : "그리드 보기"}
          aria-label={viewMode === "grid" ? "Switch to timeline view" : "Switch to grid view"}
        >
          {viewMode === "grid" ? (
            <>
              {/* 타임라인 아이콘 / Timeline icon */}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              타임라인
            </>
          ) : (
            <>
              {/* 그리드 아이콘 / Grid icon */}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
              그리드
            </>
          )}
        </button>
      </div>

      {/* 그리드 보기 / Grid view */}
      {viewMode === "grid" && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 animate-fade-in-up">
          {filtered.map((item, i) => (
            <NewsCard key={`${item.link}-${i}`} item={item} />
          ))}
        </div>
      )}

      {/* 타임라인 보기 / Timeline view */}
      {viewMode === "timeline" && (
        <div className="space-y-6 animate-fade-in-up">
          {timeGroups.map((group) => (
            <div key={group.label} className="relative pl-6">
              {/* 타임라인 좌측 라인 / Timeline left border line */}
              <div className="absolute left-2 top-0 bottom-0 w-px bg-border/40" />
              {/* 타임라인 도트 / Timeline dot */}
              <div className="absolute left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-400/70 ring-2 ring-background" />
              {/* 시간 그룹 라벨 / Time group label */}
              <h4 className="text-[11px] sm:text-xs font-medium text-muted-foreground/70 mb-3">
                {group.label}
                <span className="ml-1.5 text-[10px] text-muted-foreground/40">
                  {group.items.length}건
                </span>
              </h4>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {group.items.map((item, i) => (
                  <NewsCard key={`${item.link}-${i}`} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
