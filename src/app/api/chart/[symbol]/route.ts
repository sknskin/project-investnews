import { NextRequest, NextResponse } from "next/server";

/**
 * Yahoo Finance 인트라데이 차트 데이터 API
 * Yahoo Finance intraday chart data API
 */

// 차트 데이터 포인트 타입
// Chart data point type
interface ChartPoint {
  timestamp: number;
  price: number;
}

const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const decodedSymbol = decodeURIComponent(symbol);

    // Yahoo Finance 차트 API 호출 (2일간 15분 간격)
    // Fetch 2-day chart data with 15-minute intervals
    const url = `${YAHOO_CHART_URL}/${encodeURIComponent(decodedSymbol)}?range=2d&interval=15m`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Yahoo Finance API 오류" },
        { status: res.status }
      );
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json(
        { error: "차트 데이터 없음" },
        { status: 404 }
      );
    }

    const timestamps: number[] = result.timestamp ?? [];
    const closes: (number | null)[] =
      result.indicators?.quote?.[0]?.close ?? [];
    const previousClose: number =
      result.meta?.chartPreviousClose ?? result.meta?.previousClose ?? 0;

    // null 값 필터링 후 차트 포인트 생성
    // Filter null values and create chart points
    const points: ChartPoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null) {
        points.push({ timestamp: timestamps[i], price: closes[i] as number });
      }
    }

    return NextResponse.json(
      { points, previousClose },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
