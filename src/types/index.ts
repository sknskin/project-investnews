export type Category = "economy" | "politics" | "world" | "crypto" | "stocks";

export interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  source: string;
  pubDate: string;
  category: Category;
}

export interface FeedSource {
  name: string;
  url: string;
  category: Category;
  /** true = 범용 피드, 관련성 키워드 필터링 적용 */
  broad?: boolean;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  economy: "국내 경제",
  politics: "국내 정치",
  world: "해외 경제/정치",
  crypto: "코인/크립토",
  stocks: "주식/증권",
};
