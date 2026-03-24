import { fetchNewsByCategory } from "@/lib/rss";
import FilterableNewsList from "@/components/news/FilterableNewsList";
import NewsAnalysis from "@/components/news/NewsAnalysis";
import LastUpdated from "@/components/news/LastUpdated";

export const revalidate = 60;

export const metadata = {
  title: "해외뉴스 — InvestNews",
  description: "해외 경제, 글로벌 시장, 원자재, 지정학 관련 투자 뉴스",
};

export default async function InternationalPage() {
  const items = await fetchNewsByCategory("international", 100);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🌍</span>
          <h1 className="text-2xl font-bold tracking-tight">해외뉴스</h1>
        </div>
        <div className="flex items-center gap-3 pl-0 sm:pl-10">
          <p className="text-sm text-muted-foreground/50">{items.length}건의 뉴스</p>
          <LastUpdated />
        </div>
      </div>
      <NewsAnalysis category="international" items={items} />
      <FilterableNewsList items={items} />
    </div>
  );
}
