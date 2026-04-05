"use client";

// 주요 경제 이벤트 (정적 데이터 — 매월 업데이트 필요)
// Major economic events (static data — needs monthly updates)
const EVENTS = [
  { date: "2026-04-01", event: "ISM 제조업지수", flag: "🇺🇸", impact: "high" },
  {
    date: "2026-04-02",
    event: "JOLTS 구인건수",
    flag: "🇺🇸",
    impact: "medium",
  },
  {
    date: "2026-04-04",
    event: "미국 비농업고용",
    flag: "🇺🇸",
    impact: "high",
  },
  {
    date: "2026-04-10",
    event: "미국 CPI 소비자물가",
    flag: "🇺🇸",
    impact: "high",
  },
  {
    date: "2026-04-11",
    event: "미국 PPI 생산자물가",
    flag: "🇺🇸",
    impact: "medium",
  },
  {
    date: "2026-04-14",
    event: "한국 금통위 금리결정",
    flag: "🇰🇷",
    impact: "high",
  },
  { date: "2026-04-17", event: "ECB 금리결정", flag: "🇪🇺", impact: "high" },
  {
    date: "2026-04-24",
    event: "미국 내구재 주문",
    flag: "🇺🇸",
    impact: "medium",
  },
  {
    date: "2026-04-25",
    event: "미국 GDP (1차)",
    flag: "🇺🇸",
    impact: "high",
  },
  { date: "2026-04-30", event: "FOMC 금리결정", flag: "🇺🇸", impact: "high" },
] as const;

// 영향도별 스타일 / Impact level styles
const IMPACT_STYLE = {
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/15 text-green-400 border-green-500/30",
};

// 최대 표시 이벤트 수 / Maximum events to display
const MAX_DISPLAY_EVENTS = 6;

export default function EconomicCalendar() {
  const today = new Date().toISOString().split("T")[0];

  // 오늘 이후 이벤트 필터링 — 없으면 최근 완료 이벤트 표시
  // Filter upcoming events — show recent past events if none upcoming
  const upcoming = EVENTS.filter((e) => e.date >= today).slice(0, MAX_DISPLAY_EVENTS);
  const isStale = upcoming.length === 0;
  const displayEvents = isStale
    ? EVENTS.slice(-MAX_DISPLAY_EVENTS)
    : upcoming;

  if (displayEvents.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">
        📅 경제 캘린더
      </h3>
      {/* 이벤트 데이터 만료 경고 / Stale data warning */}
      {isStale && (
        <p className="text-[10px] text-yellow-400/70 mb-2">
          ⚠ 경제 캘린더 데이터 업데이트가 필요합니다 (최근 이벤트 표시 중)
        </p>
      )}
      <div className="space-y-2">
        {displayEvents.map((ev, i) => {
          const dateObj = new Date(ev.date + "T00:00:00");
          const dayStr = dateObj.toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          });
          const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
            weekday: "short",
          });
          const isToday = ev.date === today;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isToday ? "bg-blue-500/10 ring-1 ring-blue-500/20" : "hover:bg-accent/50"} transition-colors`}
            >
              <div className="text-center shrink-0 w-12">
                <p
                  className={`text-xs font-bold ${isToday ? "text-blue-400" : "text-foreground/70"}`}
                >
                  {dayStr}
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  {dayOfWeek}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/80 truncate">
                  {ev.flag} {ev.event}
                </p>
              </div>
              <span
                className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded border ${IMPACT_STYLE[ev.impact as keyof typeof IMPACT_STYLE]}`}
              >
                {ev.impact === "high" ? "중요" : "보통"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
