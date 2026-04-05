"use client";

// 핵심 지표 요약 위젯 — VIX, 금, 원유, BTC, 국채 금리 한눈에
// Key metrics summary widget — VIX, Gold, Oil, BTC, Bond yields at a glance

import type { MarketIndex } from "@/lib/market";

// 표시할 핵심 지표 목록 (symbol → 표시 이름 + 아이콘)
// Key metrics to display (symbol → display name + icon)
const METRICS = [
  { symbol: "^VIX", label: "VIX 공포지수", icon: "⚡" },
  { symbol: "GC=F", label: "금", icon: "🥇" },
  { symbol: "CL=F", label: "WTI 원유", icon: "🛢️" },
  { symbol: "BTC-USD", label: "비트코인", icon: "₿" },
  { symbol: "^TNX", label: "미국 10년물", icon: "📜" },
  { symbol: "KRW=X", label: "달러/원", icon: "💱" },
];

// 가격 포맷 / Price formatting
function formatMetricPrice(price: number, symbol: string): string {
  if (symbol === "KRW=X") return `₩${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (symbol === "^TNX" || symbol === "^TYX") return `${price.toFixed(3)}%`;
  if (symbol === "BTC-USD") return `$${(price / 1000).toFixed(1)}K`;
  return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default function KeyMetrics({ indices }: { indices: MarketIndex[] }) {
  const items = METRICS.map((m) => {
    const idx = indices.find((i) => i.symbol === m.symbol);
    if (!idx) return null;
    return { ...m, price: idx.price, change: idx.changePercent };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">📌 핵심 지표</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const isUp = item.change > 0;
          const isDown = item.change < 0;
          return (
            <div
              key={item.symbol}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
            >
              <span className="text-sm shrink-0">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground/60 truncate">{item.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {formatMetricPrice(item.price, item.symbol)}
                  </span>
                  <span
                    className={`text-[10px] font-medium tabular-nums ${
                      isUp ? "text-red-400" : isDown ? "text-blue-400" : "text-muted-foreground/60"
                    }`}
                  >
                    {isUp ? "+" : ""}{item.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
