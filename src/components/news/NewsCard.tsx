"use client";

import { NewsItem } from "@/types";
import SourceBadge from "./SourceBadge";
import { relativeTime } from "@/lib/time";

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
          <time
            dateTime={item.pubDate}
            className="text-[10px] sm:text-[11px] text-muted-foreground/60"
            suppressHydrationWarning
          >
            {relativeTime(item.pubDate)}
          </time>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[15px] sm:text-[17px] leading-[1.5] line-clamp-2 text-foreground/90 group-hover:text-foreground transition-colors">
          {item.title}
        </h3>

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
