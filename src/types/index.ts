export type Category = "domestic" | "international" | "crypto";

export interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  source: string;
  pubDate: string;
  category: Category;
  isBreaking?: boolean;
}

export interface FeedSource {
  name: string;
  url: string;
  category: Category;
  /** true = 범용 피드, 관련성 키워드 필터링 적용 */
  broad?: boolean;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  domestic: "국내뉴스",
  international: "해외뉴스",
  crypto: "코인뉴스",
};

// 유효한 카테고리 목록 — API 라우트 검증용
// Valid categories — for API route validation
export const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
