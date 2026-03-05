import Parser from "rss-parser";
import { FEEDS } from "./feeds";
import { Category, NewsItem } from "@/types";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  // 미래 날짜 또는 30일 이상 오래된 뉴스 제외
  const now = Date.now();
  if (d.getTime() > now + 3600000) return null; // 1시간 이후 미래
  if (now - d.getTime() > 30 * 86400000) return null; // 30일 초과
  return d.toISOString();
}

// 카테고리별 관련성 키워드
const RELEVANCE_KEYWORDS: Record<Category, RegExp> = {
  economy: /경제|금리|물가|GDP|수출|수입|무역|환율|부동산|고용|실업|인플|디플|성장률|경기|소비자|기업|산업|재정|예산|세금|투자|금융|은행|채권|펀드|자산|부채|대출|stock|market|trade|economy|inflation|rate|growth/i,
  politics: /정치|국회|대통령|총리|여당|야당|선거|법안|입법|탄핵|청문|외교|안보|통일|북한|정부|장관|의원|정당|개혁|인사|politics|government|election|congress|parliament|policy|minister/i,
  world: /경제|금융|시장|무역|관세|금리|인플|GDP|석유|원유|달러|유로|위안|엔화|연준|Fed|ECB|IMF|OPEC|economy|market|trade|tariff|rate|inflation|stock|oil|dollar|growth|recession|bank|finance|invest|business|fiscal|monetary/i,
  crypto: /비트코인|이더리움|암호화폐|코인|토큰|블록체인|NFT|디파이|DeFi|거래소|채굴|스테이킹|알트코인|리플|솔라나|bitcoin|ethereum|crypto|blockchain|token|defi|nft|mining|altcoin|exchange|BTC|ETH|XRP|SOL|binance|coinbase/i,
  stocks: /주식|주가|증시|코스피|코스닥|나스닥|다우|S&P|상장|IPO|배당|실적|매출|영업이익|시가총액|PER|EPS|공매도|기관|외국인|개인|ETF|펀드|종목|stock|share|equity|nasdaq|dow|market|earnings|dividend|rally|bull|bear|index|portfolio/i,
};

function isRelevant(title: string, snippet: string, category: Category): boolean {
  const text = `${title} ${snippet}`;
  return RELEVANCE_KEYWORDS[category].test(text);
}

// 제목 기반 중복 제거
function deduplicateByTitle(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    // 제목에서 공백·특수문자 제거 후 앞 30자로 비교
    const key = item.title
      .replace(/[\s\-–—·|:：""''「」\[\]()（）]/g, "")
      .toLowerCase()
      .slice(0, 30);
    if (key.length < 5) return false; // 너무 짧은 제목 제외
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function parseFeed(
  url: string,
  sourceName: string,
  category: Category,
  needsRelevanceCheck: boolean
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    const items: NewsItem[] = [];

    for (const item of feed.items || []) {
      const title = item.title?.trim();
      if (!title || title === "제목 없음") continue;

      const pubDate = parseDate(item.pubDate) || parseDate(item.isoDate);
      if (!pubDate) continue;

      const snippet = truncate(
        stripHtml(item.contentSnippet || item.content || item.summary || ""),
        150
      );

      // 관련성 체크 (일반 피드만 — 전문 피드는 스킵)
      if (needsRelevanceCheck && !isRelevant(title, snippet, category)) {
        continue;
      }

      items.push({
        title,
        link: item.link || "#",
        snippet,
        source: sourceName,
        pubDate,
        category,
      });
    }

    return items;
  } catch {
    // 서버 로그만 남기고 조용히 실패
    return [];
  }
}

export async function fetchNewsByCategory(
  category: Category,
  limit = 100
): Promise<NewsItem[]> {
  const categoryFeeds = FEEDS.filter((f) => f.category === category);
  const results = await Promise.allSettled(
    categoryFeeds.map((f) =>
      parseFeed(f.url, f.name, f.category, f.broad ?? false)
    )
  );

  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // 시간순 정렬
  allItems.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // 중복 제거
  const unique = deduplicateByTitle(allItems);

  return unique.slice(0, limit);
}

export async function fetchAllCategories(
  limitPerCategory = 6
): Promise<Record<Category, NewsItem[]>> {
  const categories: Category[] = [
    "economy",
    "politics",
    "world",
    "crypto",
    "stocks",
  ];

  const results = await Promise.allSettled(
    categories.map((cat) => fetchNewsByCategory(cat, limitPerCategory))
  );

  const data = {} as Record<Category, NewsItem[]>;
  categories.forEach((cat, i) => {
    const result = results[i];
    data[cat] = result.status === "fulfilled" ? result.value : [];
  });

  return data;
}
