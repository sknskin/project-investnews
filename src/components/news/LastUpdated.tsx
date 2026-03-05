"use client";

import { useEffect, useState } from "react";

export default function LastUpdated() {
  const [time, setTime] = useState<string>("--:--");

  useEffect(() => {
    setTime(
      new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  return (
    <span
      className="text-[11px] text-muted-foreground/40 flex items-center gap-1"
      suppressHydrationWarning
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
      {time} 기준
    </span>
  );
}
