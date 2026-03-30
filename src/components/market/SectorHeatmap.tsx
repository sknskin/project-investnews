"use client";

import type { MarketIndex } from "@/lib/market";

// 섹터 매핑 (지수 → 섹터)
// Sector mapping (index → sector)
const SECTOR_MAP: { symbol: string; sector: string; label: string }[] = [
  { symbol: "^SOX", sector: "반도체", label: "반도체" },
  { symbol: "^IXIC", sector: "기술", label: "기술/IT" },
  { symbol: "^GSPC", sector: "대형주", label: "대형주" },
  { symbol: "^RUT", sector: "소형주", label: "소형주" },
  { symbol: "^DJI", sector: "산업", label: "산업/금융" },
  { symbol: "GC=F", sector: "금", label: "금" },
  { symbol: "CL=F", sector: "에너지", label: "에너지" },
  { symbol: "BTC-USD", sector: "암호화폐", label: "암호화폐" },
];

// 변동률에 따른 히트맵 색상 반환
// Return heatmap color based on change percentage
function getHeatColor(change: number): string {
  if (change > 2) return "bg-red-500/40 text-red-200";
  if (change > 1) return "bg-red-500/25 text-red-300";
  if (change > 0.3) return "bg-red-500/15 text-red-400";
  if (change > -0.3) return "bg-muted-foreground/10 text-muted-foreground";
  if (change > -1) return "bg-blue-500/15 text-blue-400";
  if (change > -2) return "bg-blue-500/25 text-blue-300";
  return "bg-blue-500/40 text-blue-200";
}

export default function SectorHeatmap({ indices }: { indices: MarketIndex[] }) {
  const sectors = SECTOR_MAP.map(s => {
    const idx = indices.find(i => i.symbol === s.symbol);
    return {
      ...s,
      change: idx?.changePercent ?? 0,
    };
  }).filter(s => s.change !== 0 || indices.some(i => i.symbol === s.symbol));

  if (sectors.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">🗺️ 섹터 히트맵</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {sectors.map(s => (
          <div
            key={s.symbol}
            className={`rounded-lg p-2.5 text-center transition-colors ${getHeatColor(s.change)}`}
          >
            <p className="text-[11px] font-medium">{s.label}</p>
            <p className="text-sm font-bold tabular-nums mt-0.5">
              {s.change > 0 ? "+" : ""}{s.change.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
