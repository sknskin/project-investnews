import { fetchMarketIndices, getGroupedIndices, getOrderedGroups, getGroupIcon } from "@/lib/market";
import type { MarketIndex } from "@/lib/market";
import MarketAnalysis from "@/components/market/MarketAnalysis";
import FearGreedGauge from "@/components/market/FearGreedGauge";
import MarketStatus from "@/components/market/MarketStatus";
import SummaryClient from "@/components/market/SummaryClient";
import CurrencyConverter from "@/components/market/CurrencyConverter";
import EconomicCalendar from "@/components/market/EconomicCalendar";
import SectorHeatmap from "@/components/market/SectorHeatmap";

export const revalidate = 60;

export const metadata = {
  title: "시장 지수 — InvestNews",
  description: "나스닥, S&P 500, 코스피, 환율, 원자재 등 주요 시장 지수를 한눈에 확인하세요.",
};

export default async function SummaryPage() {
  const indices = await fetchMarketIndices();
  const grouped = getGroupedIndices(indices);
  const orderedGroups = getOrderedGroups(grouped);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📋</span>
          <h1 className="text-2xl font-bold tracking-tight">시장 지수</h1>
        </div>
        <p className="text-sm text-muted-foreground/50 pl-0 sm:pl-10">
          주요 시장 지수 · 실시간 업데이트
        </p>
        <div className="mt-3">
          <MarketStatus />
        </div>
      </div>

      {indices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-6">
          <MarketAnalysis indices={indices} />
          <FearGreedGauge indices={indices} />
        </div>
      )}

      {/* 섹터 히트맵 + 환율 계산기 + 경제 캘린더 / Sector heatmap + Currency converter + Calendar */}
      {indices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <SectorHeatmap indices={indices} />
          <CurrencyConverter indices={indices} />
          <EconomicCalendar />
        </div>
      )}

      {indices.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground/60 text-sm">
            시장 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : (
        <SummaryClient orderedGroups={orderedGroups} />
      )}
    </div>
  );
}
