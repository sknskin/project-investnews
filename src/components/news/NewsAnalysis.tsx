"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Category, NewsItem } from "@/types";

// 강조 대상 지수/종목명 키워드
// Index/ticker name keywords for highlighting
const HIGHLIGHT_TICKERS = [
  "나스닥", "S&P", "코스피", "코스닥", "다우", "비트코인", "이더리움",
  "NASDAQ", "KOSPI", "KOSDAQ", "BTC", "ETH", "금", "원유", "VIX", "달러", "엔화", "유로",
];

/**
 * 분석 텍스트에서 숫자/퍼센트와 주요 지수명을 강조 처리
 * Highlight numbers/percentages and major index names in analysis text
 */
function highlightAnalysis(text: string): string {
  // 숫자/퍼센트 강조
  // Highlight numbers/percentages
  let result = text.replace(
    /([+-]?\d+\.?\d*%)/g,
    '<span class="text-blue-400 font-semibold">$1</span>'
  );

  // 지수/종목명 강조
  // Highlight index/ticker names
  for (const ticker of HIGHLIGHT_TICKERS) {
    result = result.replace(
      new RegExp(`(${ticker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "g"),
      '<strong class="text-foreground">$1</strong>'
    );
  }

  return result;
}

function AnalysisContent({ text }: { text: string }) {
  const lines = text.split("\n");
  let lineKey = 0;

  return (
    <div className="space-y-1.5 text-[13px] sm:text-[15px] leading-relaxed">
      {lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const k = `l-${lineKey++}`;

        // ## Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={k}
              className="text-base font-bold text-foreground pt-4 pb-1 first:pt-0 flex items-center gap-2"
              dangerouslySetInnerHTML={{ __html: highlightAnalysis(trimmed.replace("## ", "")) }}
            />
          );
        }

        // **bold** content
        if (trimmed.startsWith("**") && trimmed.includes("**:")) {
          const [label, ...rest] = trimmed.split("**:");
          const restText = rest.join("**:");
          return (
            <p key={k} className="text-muted-foreground pl-1">
              <span className="font-semibold text-foreground/80">
                {label.replace(/\*\*/g, "")}:
              </span>
              <span dangerouslySetInnerHTML={{ __html: highlightAnalysis(restText) }} />
            </p>
          );
        }

        // - Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={k} className="flex gap-2 pl-1 text-muted-foreground">
              <span className="text-blue-400/60 mt-0.5 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: highlightAnalysis(trimmed.slice(2)) }} />
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={k} className="flex gap-2 pl-1 text-muted-foreground">
              <span className="text-blue-400/60 mt-0.5 shrink-0 text-[13px] font-mono">
                {trimmed.match(/^\d+/)?.[0]}.
              </span>
              <span dangerouslySetInnerHTML={{ __html: highlightAnalysis(trimmed.replace(/^\d+\.\s*/, "")) }} />
            </div>
          );
        }

        return (
          <p
            key={k}
            className="text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: highlightAnalysis(trimmed) }}
          />
        );
      })}
    </div>
  );
}

export default function NewsAnalysis({ category, items }: { category: Category; items: NewsItem[] }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const headlines = items.slice(0, 15).map((item) => ({
        title: item.title,
        source: item.source,
        snippet: item.snippet,
      }));
      const res = await fetch(`/api/analyze/${category}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlines }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "분석에 실패했습니다");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Trigger button */}
      {!analysis && !loading && !error && (
        <Button
          onClick={handleAnalyze}
          variant="outline"
          className="h-10 gap-2.5 border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-300 hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-200 hover:border-blue-500/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          AI 뉴스 분석
        </Button>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-3 sm:p-5 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80">AI가 뉴스를 분석하고 있습니다</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">최신 헤드라인을 종합 분석중...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-400 text-xs">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-300/90">{error}</p>
              <Button
                onClick={handleAnalyze}
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs text-red-300/70 hover:text-red-200 hover:bg-red-500/10 px-2"
              >
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {analysis && (
        <div className="rounded-xl border border-blue-500/15 bg-gradient-to-b from-blue-500/5 to-transparent p-3 sm:p-5 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-foreground/80">AI 분석 리포트</span>
            </div>
            <Button
              onClick={handleAnalyze}
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground/50 hover:text-foreground/70 gap-1 px-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              새로고침
            </Button>
          </div>

          {/* Body */}
          <AnalysisContent text={analysis} />
        </div>
      )}
    </div>
  );
}
