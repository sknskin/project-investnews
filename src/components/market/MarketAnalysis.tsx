"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { MarketIndex } from "@/lib/market";
import AnalysisContent from "@/components/common/AnalysisContent";

export default function MarketAnalysis({ indices }: { indices: MarketIndex[] }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // AI 분석 API 호출
  // Fetch AI market analysis from API
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = indices.map((idx) => ({
        nameKo: idx.nameKo,
        name: idx.name,
        price: idx.price,
        change: idx.change,
        changePercent: idx.changePercent,
        group: idx.group,
      }));

      const res = await fetch("/api/analyze-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indices: payload }),
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

  // 모달 열기 및 분석 자동 시작
  // Open modal and auto-start analysis if not loaded
  const handleOpenModal = () => {
    setOpen(true);
    if (!analysis && !loading && !error) {
      handleAnalyze();
    }
  };

  return (
    <>
      {/* AI 분석 트리거 버튼 — 항상 표시 */}
      {/* AI analysis trigger button — always visible */}
      <Button
        onClick={handleOpenModal}
        variant="outline"
        size="sm"
        className="gap-1.5 border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-300 hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-200 hover:border-blue-500/30 transition-all text-xs"
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI 시장 분석
      </Button>

      {/* AI 분석 결과 모달 */}
      {/* AI analysis result modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-300" />
              </div>
              AI 시장 분석 리포트
            </DialogTitle>
            <DialogDescription>
              AI가 현재 시장 지수를 종합 분석합니다
            </DialogDescription>
          </DialogHeader>

          {/* 스크롤 가능한 모달 본문 */}
          {/* Scrollable modal body */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
            {/* 로딩 상태 */}
            {/* Loading state */}
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
                    <p className="text-sm font-medium text-foreground/80">AI가 시장 지수를 분석하고 있습니다</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">글로벌 지수 데이터를 종합 분석중...</p>
                  </div>
                </div>
              </div>
            )}

            {/* 에러 상태 */}
            {/* Error state */}
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

            {/* 분석 결과 */}
            {/* Analysis result */}
            {analysis && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-end mb-3">
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
                <AnalysisContent text={analysis} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
