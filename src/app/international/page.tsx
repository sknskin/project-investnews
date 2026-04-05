import { fetchNewsByCategory } from "@/lib/rss";
import CategoryPageLayout from "@/components/news/CategoryPageLayout";

export const revalidate = 60;

export const metadata = {
  title: "해외뉴스 — InvestNews",
  description: "해외 경제, 글로벌 시장, 원자재, 지정학 관련 투자 뉴스",
};

export default async function InternationalPage() {
  const items = await fetchNewsByCategory("international", 100);
  return <CategoryPageLayout icon="🌍" title="해외뉴스" category="international" items={items} />;
}
