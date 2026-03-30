/**
 * 시장 지수 데이터 fetching 유틸리티
 * Yahoo Finance API를 통해 주요 시장 지수 현재 상황을 가져옵니다.
 */

export interface MarketIndex {
  symbol: string;
  name: string;
  nameKo: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  group: string;
}

interface YahooChartMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
}

const MARKET_INDICES = [
  // 미국 주요 지수
  { symbol: "^IXIC", name: "NASDAQ Composite", nameKo: "나스닥 종합", group: "미국 지수" },
  { symbol: "^GSPC", name: "S&P 500", nameKo: "S&P 500", group: "미국 지수" },
  { symbol: "^DJI", name: "Dow Jones", nameKo: "다우존스", group: "미국 지수" },
  { symbol: "^RUT", name: "Russell 2000", nameKo: "러셀 2000", group: "미국 지수" },
  { symbol: "^SOX", name: "Philadelphia Semiconductor", nameKo: "필라델피아 반도체", group: "미국 지수" },

  // 선물
  { symbol: "NQ=F", name: "NASDAQ 100 Futures", nameKo: "나스닥 100 선물", group: "선물" },
  { symbol: "ES=F", name: "S&P 500 Futures", nameKo: "S&P 500 선물", group: "선물" },
  { symbol: "YM=F", name: "Dow Jones Futures", nameKo: "다우존스 선물", group: "선물" },
  // 러셀 2000 및 닛케이 선물 — 소형주 및 아시아 시장 방향성 참고
  // Russell 2000 & Nikkei futures — small-cap and Asian market direction
  { symbol: "RTY=F", name: "Russell 2000 Futures", nameKo: "러셀 2000 선물", group: "선물" },
  { symbol: "NK=F", name: "Nikkei 225 Futures", nameKo: "닛케이 225 선물", group: "선물" },

  // 한국 지수
  { symbol: "^KS11", name: "KOSPI", nameKo: "코스피", group: "한국 지수" },
  { symbol: "^KQ11", name: "KOSDAQ", nameKo: "코스닥", group: "한국 지수" },
  { symbol: "^KS200", name: "KOSPI 200", nameKo: "코스피 200", group: "한국 지수" },
  // 야간선물 대용 — 미국 장 시간(한국 야간)에 한국 시장 방향성 확인
  // Night futures proxy — tracks Korean market during US trading hours
  { symbol: "EWY", name: "iShares MSCI South Korea ETF", nameKo: "한국 ETF (야간 대용)", group: "한국 지수" },

  // 환율
  { symbol: "KRW=X", name: "USD/KRW", nameKo: "달러/원 환율", group: "환율" },
  { symbol: "EURUSD=X", name: "EUR/USD", nameKo: "유로/달러", group: "환율" },
  { symbol: "JPY=X", name: "USD/JPY", nameKo: "달러/엔", group: "환율" },

  // 변동성
  { symbol: "^VIX", name: "VIX", nameKo: "VIX (공포지수)", group: "변동성" },

  // 원자재
  { symbol: "GC=F", name: "Gold Futures", nameKo: "금 선물", group: "원자재" },
  { symbol: "CL=F", name: "Crude Oil WTI", nameKo: "WTI 원유", group: "원자재" },
  { symbol: "SI=F", name: "Silver Futures", nameKo: "은 선물", group: "원자재" },

  // 암호화폐
  { symbol: "BTC-USD", name: "Bitcoin", nameKo: "비트코인", group: "암호화폐" },
  { symbol: "ETH-USD", name: "Ethereum", nameKo: "이더리움", group: "암호화폐" },

  // 채권
  { symbol: "^TNX", name: "10-Year Treasury", nameKo: "미국 10년 국채금리", group: "채권" },
  { symbol: "^TYX", name: "30-Year Treasury", nameKo: "미국 30년 국채금리", group: "채권" },
] as const;

async function fetchChartData(symbol: string): Promise<{ price: number; previousClose: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta: YahooChartMeta = json?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice,
    };
  } catch {
    return null;
  }
}

export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  const results = await Promise.allSettled(
    MARKET_INDICES.map(async (idx) => {
      const data = await fetchChartData(idx.symbol);
      if (!data || data.price === 0) return null;
      const change = data.price - data.previousClose;
      const changePercent = data.previousClose !== 0 ? (change / data.previousClose) * 100 : 0;
      return {
        symbol: idx.symbol,
        name: idx.name,
        nameKo: idx.nameKo,
        group: idx.group,
        price: data.price,
        change,
        changePercent,
        previousClose: data.previousClose,
      };
    })
  );

  const indices: MarketIndex[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      indices.push(r.value);
    }
  }
  return indices;
}

export function getGroupedIndices(indices: MarketIndex[]) {
  const groups: Record<string, MarketIndex[]> = {};
  for (const idx of indices) {
    if (!groups[idx.group]) groups[idx.group] = [];
    groups[idx.group].push(idx);
  }
  return groups;
}

const GROUP_ORDER = ["미국 지수", "선물", "한국 지수", "환율", "변동성", "원자재", "암호화폐", "채권"];

export function getOrderedGroups(groups: Record<string, MarketIndex[]>) {
  return GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => ({
    name: g,
    indices: groups[g],
  }));
}

const GROUP_ICONS: Record<string, string> = {
  "미국 지수": "🇺🇸",
  "선물": "📊",
  "한국 지수": "🇰🇷",
  "환율": "💱",
  "변동성": "⚡",
  "원자재": "🛢️",
  "암호화폐": "₿",
  "채권": "📜",
};

export function getGroupIcon(group: string) {
  return GROUP_ICONS[group] ?? "📈";
}
