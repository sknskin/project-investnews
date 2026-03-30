"use client";

import { useState, useMemo } from "react";
import type { MarketIndex } from "@/lib/market";

// 지원 통화 / Supported currencies
const CURRENCIES = ["USD", "KRW", "EUR", "JPY"] as const;
type Currency = (typeof CURRENCIES)[number];

// 통화 심볼 / Currency symbols
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  KRW: "₩",
  EUR: "€",
  JPY: "¥",
};

/**
 * 시장 지수에서 환율 정보를 추출하여 USD 기준 환율 맵을 생성
 * Build a USD-based rate map from market indices
 */
function buildRates(indices: MarketIndex[]): Record<string, number> {
  const rates: Record<string, number> = { USD: 1 };
  const krw = indices.find((i) => i.symbol === "KRW=X");
  const eur = indices.find((i) => i.symbol === "EURUSD=X");
  const jpy = indices.find((i) => i.symbol === "JPY=X");

  if (krw) rates.KRW = krw.price;
  // EUR/USD -> USD/EUR 변환
  // EUR/USD -> convert to USD/EUR
  if (eur) rates.EUR = 1 / eur.price;
  if (jpy) rates.JPY = jpy.price;

  return rates;
}

export default function CurrencyConverter({
  indices,
}: {
  indices: MarketIndex[];
}) {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState<Currency>("USD");
  const [to, setTo] = useState<Currency>("KRW");

  const rates = useMemo(() => buildRates(indices), [indices]);

  // 환율 변환 계산
  // Calculate currency conversion
  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || !rates[from] || !rates[to]) return null;
    // 변환: from 통화 -> USD -> to 통화
    // Convert: amount in 'from' -> USD -> 'to'
    const inUsd = from === "USD" ? val : val / rates[from];
    const converted = to === "USD" ? inUsd : inUsd * rates[to];
    return converted;
  }, [amount, from, to, rates]);

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">
        💱 환율 계산기
      </h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-border/40 bg-background/50 text-foreground"
            placeholder="금액 입력"
          />
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as Currency)}
            className="px-2 py-2 text-sm rounded-lg border border-border/40 bg-background/50 text-foreground cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            className="mx-auto p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground/60"
            title="교환"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1 px-3 py-2 text-sm rounded-lg border border-border/40 bg-background/30 text-foreground font-semibold tabular-nums">
            {result !== null
              ? `${CURRENCY_SYMBOLS[to]}${result.toLocaleString("en-US", { maximumFractionDigits: to === "KRW" || to === "JPY" ? 0 : 2 })}`
              : "-"}
          </div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value as Currency)}
            className="px-2 py-2 text-sm rounded-lg border border-border/40 bg-background/50 text-foreground cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
