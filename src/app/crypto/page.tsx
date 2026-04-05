import { fetchNewsByCategory } from "@/lib/rss";
import { CATEGORY_LABELS } from "@/types";
import CategoryPageLayout from "@/components/news/CategoryPageLayout";

export const revalidate = 60;

export const metadata = {
  title: `${CATEGORY_LABELS.crypto} — InvestNews`,
};

export default async function CryptoPage() {
  const items = await fetchNewsByCategory("crypto", 100);
  return <CategoryPageLayout icon="₿" title={CATEGORY_LABELS.crypto} category="crypto" items={items} />;
}
