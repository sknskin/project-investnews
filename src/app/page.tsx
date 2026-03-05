import { fetchAllCategories } from "@/lib/rss";
import { Category } from "@/types";
import CategorySection from "@/components/news/CategorySection";

export const revalidate = 60;

const CATEGORY_ORDER: Category[] = [
  "economy",
  "politics",
  "world",
  "crypto",
  "stocks",
];

export default async function HomePage() {
  const data = await fetchAllCategories(6);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          투자 뉴스,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            한눈에
          </span>
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-2">
          국내외 경제·정치·코인·주식 뉴스를 실시간으로 수집합니다
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
