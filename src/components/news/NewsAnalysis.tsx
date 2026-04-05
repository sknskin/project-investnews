"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category, NewsItem } from "@/types";
import AnalysisContent from "@/components/common/AnalysisContent";

// 강조 대상 지수/종목명 키워드
// Index/ticker name keywords for highlighting
const HIGHLIGHT_TICKERS = [
  "나스닥", "S&P", "코스피", "코스닥", "다우", "비트코인", "이더리움",
  "NASDAQ", "KOSPI", "KOSDAQ", "BTC", "ETH", "금", "원유", "VIX", "달러", "엔화", "유로",
];

/**
 * HTML 특수문자 이스케이프 — XSS 방지
 * Escape HTML special characters — prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 분석 텍스트에서 숫자/퍼센트와 주요 지수명을 강조 처리
 * Highlight numbers/percentages and major index names in analysis text
 */
function highlightAnalysis(text: string): string {
  // HTML 이스케이프 먼저 적용 — XSS 방지
  // Apply HTML escape first — prevent XSS
  let result = escapeHtml(text);

  // 숫자/퍼센트 강조
  // Highlight numbers/percentages
  result = result.replace(
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
          <Sparkles className="w-4 h-4" />
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
                <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-300" />
              </div>
              <span className="text-[13px] font-semibold text-foreground/80">AI 분석 리포트</span>
            </div>
            <Button
              onClick={handleAnalyze}
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground/50 hover:text-foreground/70 gap-1 px-2"
            >
              <RefreshCw className="w-3 h-3" />
              새로고침
            </Button>
          </div>

          {/* Body */}
          <AnalysisContent text={analysis} highlightFn={highlightAnalysis} />
        </div>
      )}
    </div>
  );
}
