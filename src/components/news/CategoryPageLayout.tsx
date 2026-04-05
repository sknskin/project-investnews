/**
 * 카테고리 뉴스 페이지 공통 레이아웃
 * Shared layout for category news pages
 */

import FilterableNewsList from "@/components/news/FilterableNewsList";
import NewsAnalysis from "@/components/news/NewsAnalysis";
import LastUpdated from "@/components/news/LastUpdated";
import { Category, NewsItem } from "@/types";

interface CategoryPageLayoutProps {
  icon: string;
  title: string;
  category: Category;
  items: NewsItem[];
}

export default function CategoryPageLayout({ icon, title, category, items }: CategoryPageLayoutProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{icon}</span>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3 pl-0 sm:pl-10">
          <p className="text-sm text-muted-foreground/50">{items.length}건의 뉴스</p>
          <LastUpdated />
        </div>
      </div>
      <NewsAnalysis category={category} items={items} />
      <FilterableNewsList items={items} />
    </div>
  );
}
