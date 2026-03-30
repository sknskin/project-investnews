"use client";

import type { MarketIndex } from "@/lib/market";

// VIX 점수 기준값
// VIX score thresholds
const VIX_LOW = 15;
const VIX_MID_LOW = 20;
const VIX_MID_HIGH = 30;

// VIX 점수 가중치
// VIX score weights
const VIX_STRONG_GREED = 25;
const VIX_MILD_GREED = 10;
const VIX_MILD_FEAR = -10;
const VIX_STRONG_FEAR = -25;

// 시장 변동률 기준값
// Market change thresholds
const CHANGE_STRONG_THRESHOLD = 1;

// 시장 변동률 가중치
// Market change weights
const CHANGE_STRONG_GREED = 15;
const CHANGE_MILD_GREED = 8;
const CHANGE_MILD_FEAR = -8;
const CHANGE_STRONG_FEAR = -15;

// 기본 점수 및 범위
// Base score and range
const BASE_SCORE = 50;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

// 게이지 SVG 관련 상수
// Gauge SVG constants
const GAUGE_NEEDLE_LENGTH = 70;
const GAUGE_CENTER_X = 100;
const GAUGE_CENTER_Y = 100;
const GAUGE_CENTER_RADIUS = 4;
const GAUGE_MAX_ANGLE = 180;

// 공포/탐욕 라벨 및 색상
// Fear/Greed labels and colors
const LABELS = [
  { max: 20, label: "극도의 공포", labelEn: "Extreme Fear", color: "text-red-500" },
  { max: 40, label: "공포", labelEn: "Fear", color: "text-orange-500" },
  { max: 60, label: "중립", labelEn: "Neutral", color: "text-yellow-500" },
  { max: 80, label: "탐욕", labelEn: "Greed", color: "text-lime-500" },
  { max: 101, label: "극도의 탐욕", labelEn: "Extreme Greed", color: "text-green-500" },
];

// 공포/탐욕 점수 계산
// Compute Fear & Greed score from market indices
function computeScore(indices: MarketIndex[]): number {
  let score = BASE_SCORE;

  // VIX 기반 점수 가감
  // VIX-based score adjustment
  const vix = indices.find((i) => i.symbol === "^VIX");
  if (vix) {
    if (vix.price < VIX_LOW) score += VIX_STRONG_GREED;
    else if (vix.price < VIX_MID_LOW) score += VIX_MILD_GREED;
    else if (vix.price < VIX_MID_HIGH) score += VIX_MILD_FEAR;
    else score += VIX_STRONG_FEAR;
  }

  // S&P 500, NASDAQ 평균 변동률 기반 가감
  // Adjustment based on average change of S&P 500 and NASDAQ
  const sp = indices.find((i) => i.symbol === "^GSPC");
  const nq = indices.find((i) => i.symbol === "^IXIC");
  const changes = [sp?.changePercent, nq?.changePercent].filter(
    (v): v is number => v !== undefined
  );
  if (changes.length > 0) {
    const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
    if (avg > CHANGE_STRONG_THRESHOLD) score += CHANGE_STRONG_GREED;
    else if (avg > 0) score += CHANGE_MILD_GREED;
    else if (avg > -CHANGE_STRONG_THRESHOLD) score += CHANGE_MILD_FEAR;
    else score += CHANGE_STRONG_FEAR;
  }

  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

// 점수에 해당하는 라벨 정보 반환
// Return label info for the given score
function getLabel(score: number) {
  return LABELS.find((l) => score < l.max) ?? LABELS[LABELS.length - 1];
}

export default function FearGreedGauge({
  indices,
}: {
  indices: MarketIndex[];
}) {
  const score = computeScore(indices);
  const info = getLabel(score);

  // 바늘 각도: 0=왼쪽(공포), 180=오른쪽(탐욕)
  // Needle angle: 0=left(fear), 180=right(greed)
  const angle = (score / MAX_SCORE) * GAUGE_MAX_ANGLE;

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">
        공포 &middot; 탐욕 지수
      </h3>
      <div className="flex flex-col items-center">
        {/* 반원형 게이지 SVG */}
        {/* Semicircular gauge SVG */}
        <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
          {/* 배경 아크 */}
          {/* Background arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className="text-muted-foreground/10"
          />
          {/* 그라데이션 아크 */}
          {/* Gradient arc */}
          <defs>
            <linearGradient id="fg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#fg-grad)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* 바늘 */}
          {/* Needle */}
          <line
            x1={GAUGE_CENTER_X}
            y1={GAUGE_CENTER_Y}
            x2={
              GAUGE_CENTER_X +
              GAUGE_NEEDLE_LENGTH *
                Math.cos((Math.PI * (GAUGE_MAX_ANGLE - angle)) / GAUGE_MAX_ANGLE)
            }
            y2={
              GAUGE_CENTER_Y -
              GAUGE_NEEDLE_LENGTH *
                Math.sin((Math.PI * (GAUGE_MAX_ANGLE - angle)) / GAUGE_MAX_ANGLE)
            }
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground/70"
          />
          <circle
            cx={GAUGE_CENTER_X}
            cy={GAUGE_CENTER_Y}
            r={GAUGE_CENTER_RADIUS}
            className="fill-foreground/70"
          />
          {/* 점수 텍스트 */}
          {/* Score text */}
          <text
            x={GAUGE_CENTER_X}
            y="88"
            textAnchor="middle"
            className="fill-foreground text-2xl font-bold"
            fontSize="24"
          >
            {score}
          </text>
        </svg>
        <p className={`text-sm font-bold mt-1 ${info.color}`}>{info.label}</p>
      </div>
    </div>
  );
}
