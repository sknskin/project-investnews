export default function Footer() {
  return (
    <footer className="border-t border-border/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
              IN
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              InvestNews
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground/50 text-center">
            RSS 피드 기반 · 1분마다 자동 갱신 · AI 뉴스 분석 · 비용 0원
          </div>
        </div>
      </div>
    </footer>
  );
}
