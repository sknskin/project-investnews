import Link from "next/link";
import { Category, CATEGORY_LABELS, NewsItem } from "@/types";
import NewsCard from "./NewsCard";

const CATEGORY_ICONS: Record<Category, string> = {
  economy: "💰",
  politics: "🏛️",
  world: "🌍",
  crypto: "₿",
  stocks: "📈",
};

interface Props {
  category: Category;
  items: NewsItem[];
}

export default function CategorySection({ category, items }: Props) {
  return (
    <section className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{CATEGORY_ICONS[category]}</span>
          <h2 className="text-base font-bold tracking-tight">{CATEGORY_LABELS[category]}</h2>
          <span className="text-[11px] text-muted-foreground/50 font-medium">
            {items.length}건
          </span>
        </div>
        <Link
          href={`/${category}`}
          className="text-[12px] text-muted-foreground/60 hover:text-blue-400 transition-colors flex items-center gap-1"
        >
          더보기
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground/50 py-8 text-center">
          뉴스를 불러오는 중...
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {items.map((item, i) => (
            <NewsCard key={`${item.link}-${i}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
