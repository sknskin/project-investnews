"use client";

import { useEffect, useState, useMemo } from "react";

/**
 * 순수 SVG 기반 인트라데이 가격 차트 컴포넌트
 * Pure SVG-based intraday price chart component
 */

interface ChartPoint {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  symbol: string;
}

// 차트 레이아웃 상수
// Chart layout constants
const CHART_WIDTH = 400;
const CHART_HEIGHT = 160;
const PADDING_LEFT = 55;
const PADDING_RIGHT = 10;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 28;
const DRAW_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const DRAW_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// Y축 라벨 개수
// Number of Y-axis labels
const Y_TICK_COUNT = 4;

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatPriceLabel(price: number): string {
  if (price >= 10000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 100) return price.toFixed(1);
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

export default function PriceChart({ symbol }: PriceChartProps) {
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [previousClose, setPreviousClose] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChart() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/chart/${encodeURIComponent(symbol)}`);
        if (!res.ok) throw new Error("차트 데이터 로드 실패");
        const data = await res.json();
        if (!cancelled) {
          setPoints(data.points ?? []);
          setPreviousClose(data.previousClose ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "오류 발생");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChart();
    return () => { cancelled = true; };
  }, [symbol]);

  // 차트 계산
  // Chart calculations
  const chartData = useMemo(() => {
    if (points.length < 2) return null;

    const prices = points.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    // 가격 범위에 여유 추가
    // Add margin to price range
    const margin = priceRange * 0.08;
    const yMin = minPrice - margin;
    const yMax = maxPrice + margin;
    const yRange = yMax - yMin;

    const firstTs = points[0].timestamp;
    const lastTs = points[points.length - 1].timestamp;
    const tsRange = lastTs - firstTs || 1;

    // SVG path 생성
    // Generate SVG path
    const pathParts: string[] = [];
    const areaParts: string[] = [];

    for (let i = 0; i < points.length; i++) {
      const x = PADDING_LEFT + ((points[i].timestamp - firstTs) / tsRange) * DRAW_WIDTH;
      const y = PADDING_TOP + (1 - (points[i].price - yMin) / yRange) * DRAW_HEIGHT;
      pathParts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
      areaParts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }

    // 영역 채우기용 경로 닫기
    // Close area path for fill
    const lastX = PADDING_LEFT + DRAW_WIDTH;
    const firstX = PADDING_LEFT;
    const bottomY = PADDING_TOP + DRAW_HEIGHT;
    areaParts.push(`L${lastX},${bottomY}`);
    areaParts.push(`L${firstX},${bottomY}`);
    areaParts.push("Z");

    const linePath = pathParts.join("");
    const areaPath = areaParts.join("");

    // 상승/하락 판단 (전일 종가 대비)
    // Determine up/down based on previous close
    const lastPrice = prices[prices.length - 1];
    const isUp = previousClose > 0 ? lastPrice >= previousClose : prices[prices.length - 1] >= prices[0];

    // 전일 종가 기준선 Y 좌표
    // Previous close reference line Y coordinate
    let prevCloseY: number | null = null;
    if (previousClose > 0 && previousClose >= yMin && previousClose <= yMax) {
      prevCloseY = PADDING_TOP + (1 - (previousClose - yMin) / yRange) * DRAW_HEIGHT;
    }

    // Y축 눈금
    // Y-axis ticks
    const yTicks: { value: number; y: number }[] = [];
    for (let i = 0; i <= Y_TICK_COUNT; i++) {
      const value = yMin + (yRange * i) / Y_TICK_COUNT;
      const y = PADDING_TOP + (1 - i / Y_TICK_COUNT) * DRAW_HEIGHT;
      yTicks.push({ value, y });
    }

    // X축 날짜 구분선 (2일 데이터에서 날짜 변경 지점 찾기)
    // X-axis date separator (find date boundary in 2-day data)
    const dateBoundaries: { x: number; label: string }[] = [];
    let prevDate = "";
    for (let i = 0; i < points.length; i++) {
      const date = formatDate(points[i].timestamp);
      if (date !== prevDate) {
        const x = PADDING_LEFT + ((points[i].timestamp - firstTs) / tsRange) * DRAW_WIDTH;
        dateBoundaries.push({ x, label: date });
        prevDate = date;
      }
    }

    // X축 시간 라벨 (균등 간격 4~5개)
    // X-axis time labels (evenly spaced 4-5 labels)
    const X_LABEL_COUNT = 5;
    const xLabels: { x: number; label: string }[] = [];
    for (let i = 0; i < X_LABEL_COUNT; i++) {
      const idx = Math.round((i / (X_LABEL_COUNT - 1)) * (points.length - 1));
      const x = PADDING_LEFT + ((points[idx].timestamp - firstTs) / tsRange) * DRAW_WIDTH;
      xLabels.push({ x, label: formatTime(points[idx].timestamp) });
    }

    return { linePath, areaPath, isUp, prevCloseY, yTicks, xLabels, dateBoundaries };
  }, [points, previousClose]);

  // 로딩 스켈레톤
  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 mb-5">
        <div className="h-[160px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground/40 text-xs">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            차트 로딩 중...
          </div>
        </div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 mb-5">
        <div className="h-[80px] flex items-center justify-center text-muted-foreground/40 text-xs">
          차트 데이터를 불러올 수 없습니다
        </div>
      </div>
    );
  }

  const { linePath, areaPath, isUp, prevCloseY, yTicks, xLabels, dateBoundaries } = chartData;
  const lineColor = isUp ? "#f87171" : "#60a5fa";
  const areaColor = isUp ? "rgba(248,113,113,0.12)" : "rgba(96,165,250,0.12)";
  const gradientId = `chart-gradient-${symbol.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="rounded-xl border border-border/30 bg-muted/10 p-3 mb-5">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y축 그리드 라인 + 가격 라벨 */}
        {/* Y-axis grid lines + price labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PADDING_LEFT}
              y1={tick.y}
              x2={CHART_WIDTH - PADDING_RIGHT}
              y2={tick.y}
              stroke="currentColor"
              strokeOpacity="0.06"
              strokeWidth="0.5"
            />
            <text
              x={PADDING_LEFT - 6}
              y={tick.y + 3}
              textAnchor="end"
              className="fill-muted-foreground/40"
              fontSize="8"
            >
              {formatPriceLabel(tick.value)}
            </text>
          </g>
        ))}

        {/* 날짜 구분선 */}
        {/* Date boundary lines */}
        {dateBoundaries.map((b, i) => (
          <g key={`date-${i}`}>
            <line
              x1={b.x}
              y1={PADDING_TOP}
              x2={b.x}
              y2={PADDING_TOP + DRAW_HEIGHT}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
          </g>
        ))}

        {/* 전일 종가 기준선 */}
        {/* Previous close reference line */}
        {prevCloseY !== null && (
          <g>
            <line
              x1={PADDING_LEFT}
              y1={prevCloseY}
              x2={CHART_WIDTH - PADDING_RIGHT}
              y2={prevCloseY}
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="0.5"
              strokeDasharray="4,4"
            />
            <text
              x={PADDING_LEFT - 6}
              y={prevCloseY + 3}
              textAnchor="end"
              className="fill-muted-foreground/50"
              fontSize="7"
              fontWeight="bold"
            >
              전일
            </text>
          </g>
        )}

        {/* 영역 채우기 (그라데이션) */}
        {/* Area fill (gradient) */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* 가격 라인 */}
        {/* Price line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X축 시간 라벨 */}
        {/* X-axis time labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={CHART_HEIGHT - 6}
            textAnchor="middle"
            className="fill-muted-foreground/40"
            fontSize="8"
          >
            {label.label}
          </text>
        ))}

        {/* 날짜 라벨 */}
        {/* Date labels */}
        {dateBoundaries.map((b, i) => (
          <text
            key={`dlabel-${i}`}
            x={b.x + 2}
            y={PADDING_TOP + 9}
            textAnchor="start"
            className="fill-muted-foreground/30"
            fontSize="7"
          >
            {b.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
