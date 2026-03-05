import { NewsGridSkeleton } from "@/components/news/NewsCardSkeleton";

export default function Loading() {
  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="text-center py-4">
        <div className="h-8 w-48 mx-auto rounded bg-muted/20 animate-pulse" />
        <div className="h-4 w-64 mx-auto rounded bg-muted/10 animate-pulse mt-3" />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-6 rounded bg-muted/20 animate-pulse" />
          <div className="h-5 w-24 rounded bg-muted/20 animate-pulse" />
        </div>
        <NewsGridSkeleton count={5} />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-6 rounded bg-muted/20 animate-pulse" />
          <div className="h-5 w-24 rounded bg-muted/20 animate-pulse" />
        </div>
        <NewsGridSkeleton count={5} />
      </div>
    </div>
  );
}
