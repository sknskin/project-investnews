import { NewsGridSkeleton } from "./NewsCardSkeleton";

export default function CategoryPageSkeleton() {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-muted/20 animate-pulse" />
          <div className="h-7 w-32 rounded bg-muted/20 animate-pulse" />
        </div>
        <div className="h-4 w-24 rounded bg-muted/10 animate-pulse ml-11" />
      </div>
      <div className="h-10 w-36 rounded-full bg-muted/15 animate-pulse mb-6" />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-muted/10 animate-pulse" />
        ))}
      </div>
      <NewsGridSkeleton count={9} />
    </div>
  );
}
