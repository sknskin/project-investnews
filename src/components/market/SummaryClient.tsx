"use client";

import { useState, useCallback } from "react";
import type { MarketIndex } from "@/lib/market";
import { getGroupIcon } from "@/lib/market";
import { cn } from "@/lib/utils";
import IndexDetailModal, { getCurrencyPrefix, getCurrencySuffix } from "./IndexDetailModal";

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes("=X") || symbol.includes("JPY")) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (symbol.startsWith("^TNX") || symbol.startsWith("^TYX")) {
    return price.toFixed(3);
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function IndexCard({ idx, onClick }: { idx: MarketIndex; onClick: () => void }) {
  const isUp = idx.change > 0;
  const isDown = idx.change < 0;
  const isFlat = idx.change === 0;
  const prefix = getCurrencyPrefix(idx.symbol);
  const suffix = getCurrencySuffix(idx.symbol);

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4 hover:border-border/60 hover:bg-card/80 transition-all duration-200 cursor-pointer"
    >
      {/* 상승/하락 인디케이터 바 */}
      <div
        className={cn(
          "absolute top-0 left-4 right-4 h-[2px] rounded-b-full",
          isUp && "bg-red-500/60",
          isDown && "bg-blue-500/60",
          isFlat && "bg-muted-foreground/20"
        )}
      />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{idx.nameKo}</p>
          <p className="text-[11px] text-muted-foreground/50 truncate">{idx.name}</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-lg font-bold tracking-tight tabular-nums">
          {prefix}{formatPrice(idx.price, idx.symbol)}{suffix}
        </p>
        <div className="text-right shrink-0">
          <p
            className={cn(
              "text-[13px] font-semibold tabular-nums",
              isUp && "text-red-400",
              isDown && "text-blue-400",
              isFlat && "text-muted-foreground"
            )}
          >
            {isUp ? "+" : ""}{idx.change.toFixed(2)}
          </p>
          <p
            className={cn(
              "text-[11px] font-medium tabular-nums",
              isUp && "text-red-400/80",
              isDown && "text-blue-400/80",
              isFlat && "text-muted-foreground/60"
            )}
          >
            {isUp ? "+" : ""}{idx.changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

interface SummaryClientProps {
  orderedGroups: { name: string; indices: MarketIndex[] }[];
}

export default function SummaryClient({ orderedGroups }: SummaryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<MarketIndex | null>(null);
  const handleClose = useCallback(() => setSelectedIndex(null), []);

  return (
    <>
      <div className="space-y-8">
        {orderedGroups.map((group) => (
          <section key={group.name}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{getGroupIcon(group.name)}</span>
              <h2 className="text-base font-semibold text-foreground/90">{group.name}</h2>
              <div className="flex-1 h-px bg-border/20 ml-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {group.indices.map((idx) => (
                <IndexCard
                  key={idx.symbol}
                  idx={idx}
                  onClick={() => setSelectedIndex(idx)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <IndexDetailModal idx={selectedIndex} onClose={handleClose} />
    </>
  );
}
