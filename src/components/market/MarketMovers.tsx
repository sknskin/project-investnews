"use client";

// 급등/급락 TOP 3 위젯 — 현재 지수 중 상승/하락 상위 종목 표시
// Market movers widget — shows top gainers and losers from current indices

import type { MarketIndex } from "@/lib/market";

/** 상승/하락 표시 색상 기준값 / Color threshold */
const TOP_COUNT = 3;

export default function MarketMovers({ indices }: { indices: MarketIndex[] }) {
  // 변동률 기준 정렬 / Sort by change percent
  const sorted = [...indices].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter(i => i.changePercent > 0).slice(0, TOP_COUNT);
  const losers = sorted.filter(i => i.changePercent < 0).reverse().slice(0, TOP_COUNT);

  if (gainers.length === 0 && losers.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">🔥 급등 · 급락</h3>
      <div className="space-y-3">
        {/* 급등 / Gainers */}
        {gainers.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground/50 mb-1.5 font-medium">상승 TOP</p>
            <div className="space-y-1">
              {gainers.map((idx) => (
                <div key={idx.symbol} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground/70 truncate min-w-0">{idx.nameKo}</span>
                  <span className="text-xs font-semibold text-red-400 tabular-nums shrink-0">
                    +{idx.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 구분선 / Divider */}
        {gainers.length > 0 && losers.length > 0 && (
          <div className="border-t border-border/20" />
        )}

        {/* 급락 / Losers */}
        {losers.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground/50 mb-1.5 font-medium">하락 TOP</p>
            <div className="space-y-1">
              {losers.map((idx) => (
                <div key={idx.symbol} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground/70 truncate min-w-0">{idx.nameKo}</span>
                  <span className="text-xs font-semibold text-blue-400 tabular-nums shrink-0">
                    {idx.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
