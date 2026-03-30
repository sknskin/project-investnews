"use client";

import { useState, useEffect } from "react";

interface MarketInfo {
  name: string;
  status: string;
  color: string;
  icon: string;
}

// 미국 시장 시간 기준값 (분 단위, ET)
// US market time thresholds (in minutes, ET)
const US_PREMARKET_START = 240; // 4:00 AM
const US_REGULAR_START = 570; // 9:30 AM
const US_REGULAR_END = 960; // 4:00 PM
const US_AFTERHOURS_END = 1200; // 8:00 PM

// 한국 시장 시간 기준값 (분 단위, KST)
// Korean market time thresholds (in minutes, KST)
const KR_REGULAR_START = 540; // 9:00 AM
const KR_REGULAR_END = 930; // 3:30 PM

// 상태 갱신 주기 (밀리초)
// Status refresh interval (milliseconds)
const REFRESH_INTERVAL_MS = 60000;

// 시장 상태 계산 (ET 기준)
// Calculate market status (ET timezone)
function getMarketStatuses(): MarketInfo[] {
  const now = new Date();

  // ET 시간 계산
  // Calculate ET time
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et = new Date(etStr);
  const etHour = et.getHours();
  const etMinute = et.getMinutes();
  const etTime = etHour * 60 + etMinute;
  const day = et.getDay(); // 0=Sun

  // KST 시간 계산
  // Calculate KST time
  const kstStr = now.toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  const kst = new Date(kstStr);
  const kstHour = kst.getHours();
  const kstMinute = kst.getMinutes();
  const kstTime = kstHour * 60 + kstMinute;
  const kstDay = kst.getDay();

  const results: MarketInfo[] = [];

  // 미국 시장 상태
  // US market status
  const isWeekend = day === 0 || day === 6;
  if (isWeekend) {
    results.push({
      name: "미국",
      status: "휴장",
      color: "text-muted-foreground/60",
      icon: "🇺🇸",
    });
  } else if (etTime < US_PREMARKET_START) {
    results.push({
      name: "미국",
      status: "장 마감",
      color: "text-muted-foreground/60",
      icon: "🇺🇸",
    });
  } else if (etTime < US_REGULAR_START) {
    results.push({
      name: "미국",
      status: "프리마켓",
      color: "text-yellow-500",
      icon: "🇺🇸",
    });
  } else if (etTime < US_REGULAR_END) {
    results.push({
      name: "미국",
      status: "정규장",
      color: "text-green-500",
      icon: "🇺🇸",
    });
  } else if (etTime < US_AFTERHOURS_END) {
    results.push({
      name: "미국",
      status: "시간외",
      color: "text-yellow-500",
      icon: "🇺🇸",
    });
  } else {
    results.push({
      name: "미국",
      status: "장 마감",
      color: "text-muted-foreground/60",
      icon: "🇺🇸",
    });
  }

  // 한국 시장 상태
  // Korean market status
  const isKstWeekend = kstDay === 0 || kstDay === 6;
  if (isKstWeekend) {
    results.push({
      name: "한국",
      status: "휴장",
      color: "text-muted-foreground/60",
      icon: "🇰🇷",
    });
  } else if (kstTime < KR_REGULAR_START) {
    results.push({
      name: "한국",
      status: "장 전",
      color: "text-muted-foreground/60",
      icon: "🇰🇷",
    });
  } else if (kstTime < KR_REGULAR_END) {
    results.push({
      name: "한국",
      status: "정규장",
      color: "text-green-500",
      icon: "🇰🇷",
    });
  } else {
    results.push({
      name: "한국",
      status: "장 마감",
      color: "text-muted-foreground/60",
      icon: "🇰🇷",
    });
  }

  return results;
}

export default function MarketStatus() {
  const [statuses, setStatuses] = useState<MarketInfo[]>([]);

  useEffect(() => {
    setStatuses(getMarketStatuses());
    const timer = setInterval(
      () => setStatuses(getMarketStatuses()),
      REFRESH_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, []);

  if (statuses.length === 0) return null;

  return (
    <div className="flex gap-3 flex-wrap">
      {statuses.map((m) => (
        <div
          key={m.name}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/30 bg-card/50 text-xs"
        >
          <span>{m.icon}</span>
          <span className="text-foreground/70 font-medium">{m.name}</span>
          <span className={`font-semibold ${m.color}`}>{m.status}</span>
        </div>
      ))}
    </div>
  );
}
