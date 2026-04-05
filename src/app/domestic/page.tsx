import { fetchNewsByCategory } from "@/lib/rss";
import CategoryPageLayout from "@/components/news/CategoryPageLayout";

export const revalidate = 60;

export const metadata = {
  title: "국내뉴스 — InvestNews",
  description: "국내 경제, 증권, 정책 관련 투자 뉴스",
};

export default async function DomesticPage() {
  const items = await fetchNewsByCategory("domestic", 100);
  return <CategoryPageLayout icon="🇰🇷" title="국내뉴스" category="domestic" items={items} />;
}
