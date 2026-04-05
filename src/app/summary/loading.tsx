import { NewsGridSkeleton } from "@/components/news/NewsCardSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded bg-muted/20 animate-pulse" />
        <div className="h-6 w-32 rounded bg-muted/20 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/30 bg-card/50 p-4 h-28 animate-pulse">
            <div className="h-3 w-20 rounded bg-muted/20 mb-3" />
            <div className="h-6 w-24 rounded bg-muted/20 mb-2" />
            <div className="h-3 w-16 rounded bg-muted/15" />
          </div>
        ))}
      </div>
      <NewsGridSkeleton count={4} />
    </div>
  );
}
