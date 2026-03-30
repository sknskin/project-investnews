import { fetchAllCategories } from "@/lib/rss";
import { Category, NewsItem } from "@/types";
import CategorySection from "@/components/news/CategorySection";
import BreakingBanner from "@/components/news/BreakingBanner";

export const revalidate = 60;

const CATEGORY_ORDER: Category[] = [
  "domestic",
  "international",
  "crypto",
];

export default async function HomePage() {
  const data = await fetchAllCategories(6);

  // 전체 카테고리 뉴스를 모아 속보 배너에 전달
  // Gather all category items for breaking banner
  const allItems: NewsItem[] = Object.values(data).flat();

  return (
    <div className="space-y-10">
      {/* 속보 배너 / Breaking news banner */}
      <BreakingBanner items={allItems} />

      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          투자 뉴스,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            한눈에
          </span>
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-2">
          국내·해외·코인 투자 뉴스를 실시간으로 수집합니다
        </p>
      </div>

      {/* Category sections */}
      {CATEGORY_ORDER.map((cat, i) => (
        <div key={cat}>
          <CategorySection category={cat} items={data[cat]} />
          {i < CATEGORY_ORDER.length - 1 && (
            <div className="mt-8 border-b border-border/20" />
          )}
        </div>
      ))}
    </div>
  );
}
