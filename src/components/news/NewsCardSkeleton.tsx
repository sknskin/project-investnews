export function NewsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/30 bg-card/30 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 rounded-full bg-muted/30" />
        <div className="h-3 w-12 rounded bg-muted/20" />
      </div>
      <div className="h-4 w-full rounded bg-muted/30 mb-2" />
      <div className="h-4 w-3/4 rounded bg-muted/20 mb-3" />
      <div className="h-3 w-full rounded bg-muted/15" />
      <div className="h-3 w-2/3 rounded bg-muted/15 mt-1.5" />
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
