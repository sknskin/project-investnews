/**
 * 404 페이지 — 존재하지 않는 경로 접근 시 표시
 * 404 page — shown when accessing non-existent routes
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="text-6xl font-bold text-muted-foreground/20 mb-2">404</p>
        <h2 className="text-lg font-semibold text-foreground mb-1">페이지를 찾을 수 없습니다</h2>
        <p className="text-sm text-muted-foreground/60">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      </div>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium rounded-lg border border-border/30 bg-card/50 hover:bg-card/80 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
