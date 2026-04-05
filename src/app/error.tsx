"use client";

/**
 * 전역 에러 바운더리 — 런타임 에러 발생 시 표시
 * Global error boundary — shown when runtime errors occur
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 animate-fade-in-up">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <span className="text-2xl text-red-400">!</span>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">문제가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground/60 max-w-md">
          {error.message || "페이지를 불러오는 중 오류가 발생했습니다."}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium rounded-lg border border-border/30 bg-card/50 hover:bg-card/80 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
