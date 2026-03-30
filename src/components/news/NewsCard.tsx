"use client";

import { NewsItem } from "@/types";
import SourceBadge from "./SourceBadge";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "@/components/common/ShareButton";
import { relativeTime } from "@/lib/time";

// 뉴스 제목에서 관련 지수 태그 추출
// Extract related index tags from news title
const INDEX_KEYWORDS: { keywords: string[]; tag: string; color: string }[] = [
  { keywords: ["나스닥", "nasdaq", "NASDAQ", "기술주", "빅테크"], tag: "NASDAQ", color: "text-blue-400" },
  { keywords: ["S&P", "s&p", "에스앤피"], tag: "S&P", color: "text-green-400" },
  { keywords: ["코스피", "KOSPI", "kospi"], tag: "KOSPI", color: "text-red-400" },
  { keywords: ["코스닥", "KOSDAQ"], tag: "KOSDAQ", color: "text-pink-400" },
  { keywords: ["비트코인", "BTC", "bitcoin"], tag: "BTC", color: "text-orange-400" },
  { keywords: ["이더리움", "ETH", "ethereum"], tag: "ETH", color: "text-purple-400" },
  { keywords: ["반도체", "semiconductor", "엔비디아", "NVIDIA", "삼성전자"], tag: "반도체", color: "text-cyan-400" },
  { keywords: ["금리", "국채", "연준", "FOMC", "Fed", "기준금리"], tag: "금리", color: "text-yellow-400" },
  { keywords: ["환율", "달러", "원화", "USD", "KRW"], tag: "환율", color: "text-lime-400" },
  { keywords: ["유가", "원유", "WTI", "OPEC"], tag: "원유", color: "text-amber-400" },
];

// 제목에서 매칭되는 태그 최대 3개 반환
// Return up to 3 matching tags from title
function getIndexTags(title: string): { tag: string; color: string }[] {
  const tags: { tag: string; color: string }[] = [];
  for (const entry of INDEX_KEYWORDS) {
    if (entry.keywords.some(kw => title.includes(kw))) {
      tags.push({ tag: entry.tag, color: entry.color });
    }
  }
  return tags.slice(0, 3);
}

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="h-full rounded-xl border border-border/40 bg-card/50 p-3 sm:p-4 transition-all duration-200 hover:bg-card hover:border-border/70 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
          <SourceBadge source={item.source} />
          {/* 속보 뱃지 / Breaking badge */}
          {item.isBreaking && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-red-500/20 text-red-400">
              속보
            </span>
          )}
          <time
            dateTime={item.pubDate}
            className="text-[10px] sm:text-[11px] text-muted-foreground/60"
            suppressHydrationWarning
          >
            {relativeTime(item.pubDate)}
          </time>
          <BookmarkButton link={item.link} title={item.title} source={item.source} />
          <ShareButton title={item.title} url={item.link} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[15px] sm:text-[17px] leading-[1.5] line-clamp-2 text-foreground/90 group-hover:text-foreground transition-colors">
          {item.title}
        </h3>

        {/* 관련 지수 태그 / Related index tags */}
        {(() => {
          const tags = getIndexTags(item.title);
          if (tags.length === 0) return null;
          return (
            <div className="flex gap-1 mt-1.5">
              {tags.map(t => (
                <span key={t.tag} className={`text-[9px] px-1.5 py-0.5 rounded-full border border-current/20 font-medium ${t.color}`}>
                  {t.tag}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Snippet */}
        {item.snippet && (
          <p className="text-[11px] sm:text-[12px] leading-relaxed text-muted-foreground/70 line-clamp-2 mt-1.5 sm:mt-2">
            {item.snippet}
          </p>
        )}

        {/* Link hint */}
        <div className="mt-2 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground/40 group-hover:text-blue-400/70 transition-colors">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          원문 보기
        </div>
      </div>
    </a>
  );
}
