"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card border border-border/50 shadow-lg shadow-black/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-200 animate-fade-in-up"
      aria-label="맨 위로"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}
