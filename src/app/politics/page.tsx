import { fetchNewsByCategory } from "@/lib/rss";
import { CATEGORY_LABELS } from "@/types";
import FilterableNewsList from "@/components/news/FilterableNewsList";
import NewsAnalysis from "@/components/news/NewsAnalysis";
import LastUpdated from "@/components/news/LastUpdated";

export const revalidate = 60;

export const metadata = {
  title: `${CATEGORY_LABELS.politics} — InvestNews`,
};

export default async function PoliticsPage() {
  const items = await fetchNewsByCategory("politics", 100);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🏛️</span>
          <h1 className="text-2xl font-bold tracking-tight">{CATEGORY_LABELS.politics}</h1>
        </div>
        <div className="flex items-center gap-3 pl-0 sm:pl-10">
          <p className="text-sm text-muted-foreground/50">{items.length}건의 뉴스</p>
          <LastUpdated />
        </div>
      </div>
      <NewsAnalysis category="politics" />
      <FilterableNewsList items={items} />
    </div>
  );
}
