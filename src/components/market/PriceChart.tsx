"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";

/**
 * 순수 SVG 기반 인트라데이 가격 차트 컴포넌트 (호버 크로스헤어 포함)
 * Pure SVG-based intraday price chart component with hover crosshair
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
const CHART_WIDTH = 800;
const CHART_HEIGHT = 400;
const PADDING_LEFT = 85;
const PADDING_RIGHT = 20;
const PADDING_TOP = 25;
const PADDING_BOTTOM = 55;
const DRAW_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const DRAW_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const Y_TICK_COUNT = 5;

// 시간 갭 감지 임계값 (1시간 이상이면 별도 세그먼트로 분리)
// Time gap threshold — split into separate segments if gap > 1 hour
const GAP_THRESHOLD_SEC = 3600;

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function formatDateTime(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getMonth() + 1}/${d.getDate()} ${formatTime(ts)}`;
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
  // 호버 포인트 인덱스
  // Hovered point index
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
        if (!cancelled) setError(err instanceof Error ? err.message : "오류 발생");
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
    const margin = priceRange * 0.1;
    const yMin = minPrice - margin;
    const yMax = maxPrice + margin;
    const yRange = yMax - yMin;

    const firstTs = points[0].timestamp;
    const lastTs = points[points.length - 1].timestamp;
    const tsRange = lastTs - firstTs || 1;

    const toX = (ts: number) => PADDING_LEFT + ((ts - firstTs) / tsRange) * DRAW_WIDTH;
    const toY = (price: number) => PADDING_TOP + (1 - (price - yMin) / yRange) * DRAW_HEIGHT;

    // 포인트 좌표 미리 계산 (호버용)
    // Precompute point coordinates (for hover)
    const pointCoords = points.map((p) => ({ x: toX(p.timestamp), y: toY(p.price) }));

    // 세그먼트 생성
    // Build segments
    const lineSegments: string[] = [];
    const areaSegments: string[] = [];
    let segStart = 0;

    for (let i = 0; i <= points.length; i++) {
      const isGap = i < points.length && i > 0 &&
        (points[i].timestamp - points[i - 1].timestamp) > GAP_THRESHOLD_SEC;
      const isEnd = i === points.length;

      if (isGap || isEnd) {
        const segEnd = isEnd ? points.length : i;
        if (segEnd - segStart >= 2) {
          const lineParts: string[] = [];
          const areaParts: string[] = [];
          for (let j = segStart; j < segEnd; j++) {
            const cmd = j === segStart ? "M" : "L";
            lineParts.push(`${cmd}${pointCoords[j].x.toFixed(1)},${pointCoords[j].y.toFixed(1)}`);
            areaParts.push(`${cmd}${pointCoords[j].x.toFixed(1)},${pointCoords[j].y.toFixed(1)}`);
          }
          const bottomY = PADDING_TOP + DRAW_HEIGHT;
          areaParts.push(`L${pointCoords[segEnd - 1].x.toFixed(1)},${bottomY}`);
          areaParts.push(`L${pointCoords[segStart].x.toFixed(1)},${bottomY}Z`);
          lineSegments.push(lineParts.join(""));
          areaSegments.push(areaParts.join(""));
        }
        if (isGap) segStart = i;
      }
    }

    const lastPrice = prices[prices.length - 1];
    const isUp = previousClose > 0 ? lastPrice >= previousClose : lastPrice >= prices[0];

    let prevCloseY: number | null = null;
    if (previousClose > 0 && previousClose >= yMin && previousClose <= yMax) {
      prevCloseY = toY(previousClose);
    }

    const yTicks: { value: number; y: number }[] = [];
    for (let i = 0; i <= Y_TICK_COUNT; i++) {
      const value = yMin + (yRange * i) / Y_TICK_COUNT;
      yTicks.push({ value, y: PADDING_TOP + (1 - i / Y_TICK_COUNT) * DRAW_HEIGHT });
    }

    const gaps: { x1: number; x2: number }[] = [];
    for (let i = 1; i < points.length; i++) {
      if (points[i].timestamp - points[i - 1].timestamp > GAP_THRESHOLD_SEC) {
        gaps.push({ x1: toX(points[i - 1].timestamp), x2: toX(points[i].timestamp) });
      }
    }

    const dateBoundaries: { x: number; label: string }[] = [];
    let prevDate = "";
    for (let i = 0; i < points.length; i++) {
      const date = formatDate(points[i].timestamp);
      if (date !== prevDate) {
        dateBoundaries.push({ x: toX(points[i].timestamp), label: date });
        prevDate = date;
      }
    }

    // X축 라벨 — 4개만 (겹침 방지)
    // X-axis labels — 4 only (prevent overlap)
    const X_LABEL_COUNT = 4;
    const xLabels: { x: number; label: string }[] = [];
    for (let i = 0; i < X_LABEL_COUNT; i++) {
      const idx = Math.round((i / (X_LABEL_COUNT - 1)) * (points.length - 1));
      xLabels.push({ x: toX(points[idx].timestamp), label: formatDateTime(points[idx].timestamp) });
    }

    return { lineSegments, areaSegments, isUp, prevCloseY, yTicks, xLabels, dateBoundaries, gaps, pointCoords };
  }, [points, previousClose]);

  // 마우스/터치 호버 핸들러 — SVG 좌표를 기반으로 가장 가까운 포인트 찾기
  // Mouse/touch hover handler — find nearest point based on SVG coordinates
  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || !chartData) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    // 화면 좌표 → SVG viewBox 좌표 변환
    // Screen coords → SVG viewBox coords
    const scaleX = CHART_WIDTH / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;

    if (svgX < PADDING_LEFT || svgX > CHART_WIDTH - PADDING_RIGHT) {
      setHoverIdx(null);
      return;
    }

    // 가장 가까운 포인트 찾기 (이진 탐색 대신 선형 — 최대 ~200 포인트)
    // Find nearest point (linear scan — max ~200 points)
    let nearest = 0;
    let nearestDist = Math.abs(chartData.pointCoords[0].x - svgX);
    for (let i = 1; i < chartData.pointCoords.length; i++) {
      const dist = Math.abs(chartData.pointCoords[i].x - svgX);
      if (dist < nearestDist) {
        nearest = i;
        nearestDist = dist;
      }
    }
    setHoverIdx(nearest);
  }, [chartData]);

  const handlePointerLeave = useCallback(() => setHoverIdx(null), []);

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

  const { lineSegments, areaSegments, isUp, prevCloseY, yTicks, xLabels, dateBoundaries, gaps, pointCoords } = chartData;
  const lineColor = isUp ? "#f87171" : "#60a5fa";
  const gradientId = `chart-gradient-${symbol.replace(/[^a-zA-Z0-9]/g, "")}`;

  // 호버 포인트 데이터
  // Hovered point data
  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;
  const hoverCoord = hoverIdx !== null ? pointCoords[hoverIdx] : null;

  return (
    <div className="rounded-xl border border-border/30 bg-muted/10 p-2 sm:p-4 mb-5">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-auto lg:min-h-[420px] touch-none"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
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
              x1={PADDING_LEFT} y1={tick.y}
              x2={CHART_WIDTH - PADDING_RIGHT} y2={tick.y}
              stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5"
            />
            <text
              x={PADDING_LEFT - 10} y={tick.y + 5}
              textAnchor="end"
              className="fill-muted-foreground/60"
              fontSize="13" fontFamily="system-ui, sans-serif"
            >
              {formatPriceLabel(tick.value)}
            </text>
          </g>
        ))}

        {/* 갭 영역 */}
        {/* Gap area */}
        {gaps.map((gap, i) => (
          <rect key={`gap-${i}`} x={gap.x1} y={PADDING_TOP}
            width={gap.x2 - gap.x1} height={DRAW_HEIGHT}
            fill="currentColor" fillOpacity="0.03"
          />
        ))}

        {/* 날짜 구분선 */}
        {/* Date boundary lines */}
        {dateBoundaries.map((b, i) => (
          <g key={`date-${i}`}>
            <line x1={b.x} y1={PADDING_TOP} x2={b.x} y2={PADDING_TOP + DRAW_HEIGHT}
              stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" strokeDasharray="4,4"
            />
            <text x={b.x + 5} y={PADDING_TOP + 15}
              textAnchor="start" className="fill-muted-foreground/40"
              fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif"
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* 전일 종가 기준선 */}
        {/* Previous close reference line */}
        {prevCloseY !== null && (
          <g>
            <line x1={PADDING_LEFT} y1={prevCloseY}
              x2={CHART_WIDTH - PADDING_RIGHT} y2={prevCloseY}
              stroke="#a78bfa" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="6,4"
            />
            <text x={PADDING_LEFT - 10} y={prevCloseY + 4}
              textAnchor="end" fill="#a78bfa" fillOpacity="0.7"
              fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif"
            >
              전일
            </text>
          </g>
        )}

        {/* 영역 채우기 */}
        {/* Area fill */}
        {areaSegments.map((seg, i) => (
          <path key={`area-${i}`} d={seg} fill={`url(#${gradientId})`} />
        ))}

        {/* 가격 라인 */}
        {/* Price line */}
        {lineSegments.map((seg, i) => (
          <path key={`line-${i}`} d={seg} fill="none"
            stroke={lineColor} strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round"
          />
        ))}

        {/* X축 시간 라벨 */}
        {/* X-axis time labels */}
        {xLabels.map((label, i) => (
          <text key={i} x={label.x} y={CHART_HEIGHT - 15}
            textAnchor="middle" className="fill-muted-foreground/50"
            fontSize="12" fontFamily="system-ui, sans-serif"
          >
            {label.label}
          </text>
        ))}

        {/* 호버 크로스헤어 + 값 표시 */}
        {/* Hover crosshair + value display */}
        {hoverPoint && hoverCoord && (
          <g>
            {/* 수직선 (시간축) */}
            {/* Vertical line (time axis) */}
            <line x1={hoverCoord.x} y1={PADDING_TOP}
              x2={hoverCoord.x} y2={PADDING_TOP + DRAW_HEIGHT}
              stroke={lineColor} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3,3"
            />
            {/* 수평선 (가격축) */}
            {/* Horizontal line (price axis) */}
            <line x1={PADDING_LEFT} y1={hoverCoord.y}
              x2={CHART_WIDTH - PADDING_RIGHT} y2={hoverCoord.y}
              stroke={lineColor} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3,3"
            />
            {/* 포인트 원 */}
            {/* Point circle */}
            <circle cx={hoverCoord.x} cy={hoverCoord.y} r="4.5"
              fill={lineColor} stroke="white" strokeWidth="2"
            />
            {/* Y축 가격 라벨 (배경 포함) */}
            {/* Y-axis price label (with background) */}
            <rect
              x={0} y={hoverCoord.y - 11}
              width={PADDING_LEFT - 14} height={22}
              rx="4" fill={lineColor} fillOpacity="0.9"
            />
            <text x={(PADDING_LEFT - 14) / 2} y={hoverCoord.y + 4}
              textAnchor="middle" fill="white"
              fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif"
            >
              {formatPriceLabel(hoverPoint.price)}
            </text>
            {/* X축 시간 라벨 (배경 포함) */}
            {/* X-axis time label (with background) */}
            <rect
              x={hoverCoord.x - 48} y={PADDING_TOP + DRAW_HEIGHT + 4}
              width={96} height={22}
              rx="4" fill={lineColor} fillOpacity="0.9"
            />
            <text x={hoverCoord.x} y={PADDING_TOP + DRAW_HEIGHT + 19}
              textAnchor="middle" fill="white"
              fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif"
            >
              {formatDateTime(hoverPoint.timestamp)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
