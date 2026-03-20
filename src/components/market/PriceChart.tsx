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

// 차트 레이아웃 상수 (큰 viewBox → 반응형으로 축소)
// Chart layout constants (large viewBox → scales down responsively)
const CHART_WIDTH = 800;
const CHART_HEIGHT = 400;
const PADDING_LEFT = 80;
const PADDING_RIGHT = 20;
const PADDING_TOP = 25;
const PADDING_BOTTOM = 50;
const DRAW_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const DRAW_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// Y축 라벨 개수
// Number of Y-axis labels
const Y_TICK_COUNT = 5;

// 시간 갭 감지 임계값 (1시간 이상이면 별도 세그먼트로 분리)
// Time gap threshold — split into separate segments if gap > 1 hour
const GAP_THRESHOLD_SEC = 3600;

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDateTime(ts: number): string {
  const d = new Date(ts * 1000);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${h}:${m}`;
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
    const margin = priceRange * 0.1;
    const yMin = minPrice - margin;
    const yMax = maxPrice + margin;
    const yRange = yMax - yMin;

    const firstTs = points[0].timestamp;
    const lastTs = points[points.length - 1].timestamp;
    const tsRange = lastTs - firstTs || 1;

    // X/Y 좌표 변환 함수
    // Coordinate conversion helpers
    const toX = (ts: number) => PADDING_LEFT + ((ts - firstTs) / tsRange) * DRAW_WIDTH;
    const toY = (price: number) => PADDING_TOP + (1 - (price - yMin) / yRange) * DRAW_HEIGHT;

    // 시간 갭 감지하여 세그먼트별로 SVG path 생성
    // Detect time gaps and generate separate path segments
    const lineSegments: string[] = [];
    const areaSegments: string[] = [];
    let segStart = 0;

    for (let i = 0; i <= points.length; i++) {
      const isGap = i < points.length && i > 0 &&
        (points[i].timestamp - points[i - 1].timestamp) > GAP_THRESHOLD_SEC;
      const isEnd = i === points.length;

      if (isGap || isEnd) {
        // 현재 세그먼트 종료 — path 생성
        // End current segment — build path
        const segEnd = isEnd ? points.length : i;
        if (segEnd - segStart >= 2) {
          const lineParts: string[] = [];
          const areaParts: string[] = [];

          for (let j = segStart; j < segEnd; j++) {
            const x = toX(points[j].timestamp);
            const y = toY(points[j].price);
            const cmd = j === segStart ? "M" : "L";
            lineParts.push(`${cmd}${x.toFixed(1)},${y.toFixed(1)}`);
            areaParts.push(`${cmd}${x.toFixed(1)},${y.toFixed(1)}`);
          }

          // 영역 채우기 경로 닫기
          // Close area path
          const segLastX = toX(points[segEnd - 1].timestamp);
          const segFirstX = toX(points[segStart].timestamp);
          const bottomY = PADDING_TOP + DRAW_HEIGHT;
          areaParts.push(`L${segLastX.toFixed(1)},${bottomY}`);
          areaParts.push(`L${segFirstX.toFixed(1)},${bottomY}`);
          areaParts.push("Z");

          lineSegments.push(lineParts.join(""));
          areaSegments.push(areaParts.join(""));
        }

        if (isGap) segStart = i;
      }
    }

    // 상승/하락 판단 (전일 종가 대비)
    // Determine up/down based on previous close
    const lastPrice = prices[prices.length - 1];
    const isUp = previousClose > 0 ? lastPrice >= previousClose : lastPrice >= prices[0];

    // 전일 종가 기준선 Y 좌표
    // Previous close reference line Y coordinate
    let prevCloseY: number | null = null;
    if (previousClose > 0 && previousClose >= yMin && previousClose <= yMax) {
      prevCloseY = toY(previousClose);
    }

    // Y축 눈금
    // Y-axis ticks
    const yTicks: { value: number; y: number }[] = [];
    for (let i = 0; i <= Y_TICK_COUNT; i++) {
      const value = yMin + (yRange * i) / Y_TICK_COUNT;
      const y = PADDING_TOP + (1 - i / Y_TICK_COUNT) * DRAW_HEIGHT;
      yTicks.push({ value, y });
    }

    // 시간 갭 위치 (장 마감~개장 사이 회색 영역 표시용)
    // Time gap positions (for rendering gap indicator)
    const gaps: { x1: number; x2: number }[] = [];
    for (let i = 1; i < points.length; i++) {
      if (points[i].timestamp - points[i - 1].timestamp > GAP_THRESHOLD_SEC) {
        gaps.push({ x1: toX(points[i - 1].timestamp), x2: toX(points[i].timestamp) });
      }
    }

    // X축 날짜 구분선 (2일 데이터에서 날짜 변경 지점 찾기)
    // X-axis date separator (find date boundary in 2-day data)
    const dateBoundaries: { x: number; label: string }[] = [];
    let prevDate = "";
    for (let i = 0; i < points.length; i++) {
      const date = formatDate(points[i].timestamp);
      if (date !== prevDate) {
        dateBoundaries.push({ x: toX(points[i].timestamp), label: date });
        prevDate = date;
      }
    }

    // X축 시간 라벨 (균등 간격)
    // X-axis time labels (evenly spaced)
    const X_LABEL_COUNT = 6;
    const xLabels: { x: number; label: string }[] = [];
    for (let i = 0; i < X_LABEL_COUNT; i++) {
      const idx = Math.round((i / (X_LABEL_COUNT - 1)) * (points.length - 1));
      xLabels.push({ x: toX(points[idx].timestamp), label: formatDateTime(points[idx].timestamp) });
    }

    return { lineSegments, areaSegments, isUp, prevCloseY, yTicks, xLabels, dateBoundaries, gaps };
  }, [points, previousClose]);

  // 로딩 스켈레톤
  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 sm:p-4 mb-5">
        <div className="h-[240px] sm:h-[340px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground/40 text-sm">
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
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 sm:p-4 mb-5">
        <div className="h-[100px] flex items-center justify-center text-muted-foreground/40 text-sm">
          차트 데이터를 불러올 수 없습니다
        </div>
      </div>
    );
  }

  const { lineSegments, areaSegments, isUp, prevCloseY, yTicks, xLabels, dateBoundaries, gaps } = chartData;
  const lineColor = isUp ? "#f87171" : "#60a5fa";
  const gradientId = `chart-gradient-${symbol.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="rounded-xl border border-border/30 bg-muted/10 p-2 sm:p-4 mb-5">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
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
              strokeOpacity="0.08"
              strokeWidth="0.5"
            />
            <text
              x={PADDING_LEFT - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-muted-foreground/60"
              fontSize="14"
              fontFamily="system-ui, sans-serif"
            >
              {formatPriceLabel(tick.value)}
            </text>
          </g>
        ))}

        {/* 장 마감~개장 사이 갭 영역 (회색 표시) */}
        {/* Market close-to-open gap area (gray indicator) */}
        {gaps.map((gap, i) => (
          <rect
            key={`gap-${i}`}
            x={gap.x1}
            y={PADDING_TOP}
            width={gap.x2 - gap.x1}
            height={DRAW_HEIGHT}
            fill="currentColor"
            fillOpacity="0.03"
          />
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
              strokeOpacity="0.12"
              strokeWidth="0.5"
              strokeDasharray="4,4"
            />
            <text
              x={b.x + 4}
              y={PADDING_TOP + 14}
              textAnchor="start"
              className="fill-muted-foreground/40"
              fontSize="13"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {b.label}
            </text>
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
              stroke="#a78bfa"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              strokeDasharray="6,4"
            />
            <text
              x={PADDING_LEFT - 8}
              y={prevCloseY + 4}
              textAnchor="end"
              fill="#a78bfa"
              fillOpacity="0.7"
              fontSize="12"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              전일
            </text>
          </g>
        )}

        {/* 영역 채우기 (세그먼트별 그라데이션) */}
        {/* Area fill per segment (gradient) */}
        {areaSegments.map((seg, i) => (
          <path key={`area-${i}`} d={seg} fill={`url(#${gradientId})`} />
        ))}

        {/* 가격 라인 (세그먼트별 — 갭 구간에서 선 끊김) */}
        {/* Price line per segment — line breaks at gaps */}
        {lineSegments.map((seg, i) => (
          <path
            key={`line-${i}`}
            d={seg}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* X축 시간 라벨 */}
        {/* X-axis time labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={CHART_HEIGHT - 10}
            textAnchor="middle"
            className="fill-muted-foreground/50"
            fontSize="13"
            fontFamily="system-ui, sans-serif"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
