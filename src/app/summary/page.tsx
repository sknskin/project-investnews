import { fetchMarketIndices, getGroupedIndices, getOrderedGroups, getGroupIcon } from "@/lib/market";
import type { MarketIndex } from "@/lib/market";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata = {
  title: "시장 요약 — InvestNews",
  description: "나스닥, S&P 500, 코스피, 환율, 원자재 등 주요 시장 지수를 한눈에 확인하세요.",
};

function formatPrice(price: number, symbol: string) {
  // 환율은 소수점 2자리, 채권 금리는 소수점 3자리, 나머지는 정수 또는 소수점 2자리
  if (symbol.includes("=X") || symbol.includes("JPY")) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (symbol.startsWith("^TNX") || symbol.startsWith("^TYX")) {
    return price.toFixed(3);
  }
  if (price >= 1000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function IndexCard({ idx }: { idx: MarketIndex }) {
  const isUp = idx.change > 0;
  const isDown = idx.change < 0;
  const isFlat = idx.change === 0;

  return (
    <div className="group relative rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4 hover:border-border/60 hover:bg-card/80 transition-all duration-200">
      {/* 상승/하락 인디케이터 바 */}
      <div
        className={cn(
          "absolute top-0 left-4 right-4 h-[2px] rounded-b-full",
          isUp && "bg-emerald-500/60",
          isDown && "bg-red-500/60",
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
          {formatPrice(idx.price, idx.symbol)}
        </p>
        <div className="text-right shrink-0">
          <p
            className={cn(
              "text-[13px] font-semibold tabular-nums",
              isUp && "text-emerald-400",
              isDown && "text-red-400",
              isFlat && "text-muted-foreground"
            )}
          >
            {isUp ? "+" : ""}{idx.change.toFixed(2)}
          </p>
          <p
            className={cn(
              "text-[11px] font-medium tabular-nums",
              isUp && "text-emerald-400/80",
              isDown && "text-red-400/80",
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

export default async function SummaryPage() {
  const indices = await fetchMarketIndices();
  const grouped = getGroupedIndices(indices);
  const orderedGroups = getOrderedGroups(grouped);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📋</span>
          <h1 className="text-2xl font-bold tracking-tight">시장 요약</h1>
        </div>
        <p className="text-sm text-muted-foreground/50 pl-0 sm:pl-10">
          주요 시장 지수 · 실시간 업데이트
        </p>
      </div>

      {indices.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground/60 text-sm">
            시장 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : (
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
                  <IndexCard key={idx.symbol} idx={idx} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
