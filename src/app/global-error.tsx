"use client";

/**
 * 최상위 에러 바운더리 — 레이아웃 포함 전체 에러 처리
 * Top-level error boundary — handles errors including layout
 */

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold">심각한 오류가 발생했습니다</h2>
          <p className="text-sm text-gray-500">페이지를 새로고침하거나 아래 버튼을 눌러주세요.</p>
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
