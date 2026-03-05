import Parser from "rss-parser";
import { FEEDS } from "./feeds";
import { Category, NewsItem } from "@/types";

const parser = new Parser({
  timeout: 5000,
  maxRedirects: 2,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept:
      "application/rss+xml, application/xml, application/atom+xml, text/xml, */*",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  // 단어 단위 자르기
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLength * 0.7 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*[-–|]\s*(속보|긴급|단독|종합|1보|2보|3보|영상|포토|사진)\s*/g, "")
    .replace(/\[.*?\]\s*/g, "")
    .replace(/\(.*?(사진|영상|포토).*?\)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = Date.now();
  if (d.getTime() > now + 3600000) return null;
  if (now - d.getTime() > 14 * 86400000) return null; // 14일로 축소
  return d.toISOString();
}

// 카테고리별 관련성 키워드
const RELEVANCE_KEYWORDS: Record<Category, RegExp> = {
  economy:
    /경제|금리|물가|GDP|수출|수입|무역|환율|부동산|고용|실업|인플|디플|성장률|경기|소비자|기업|산업|재정|예산|세금|투자|금융|은행|채권|펀드|자산|부채|대출|연금|보험|증권|주식|stock|market|trade|economy|inflation|rate|growth|fiscal|monetary|bank|fed|ecb/i,
  politics:
    /정치|국회|대통령|총리|여당|야당|선거|법안|입법|탄핵|청문|외교|안보|통일|북한|정부|장관|의원|정당|개혁|인사|정책|규제|예산|politics|government|election|congress|parliament|policy|minister|sanction|diplomacy/i,
  world:
    /경제|금융|시장|무역|관세|금리|인플|GDP|석유|원유|달러|유로|위안|엔화|연준|Fed|ECB|BOJ|IMF|OPEC|G7|G20|economy|market|trade|tariff|rate|inflation|stock|oil|dollar|growth|recession|bank|finance|invest|business|fiscal|monetary|treasury|bond|yield/i,
  crypto:
    /비트코인|이더리움|암호화폐|코인|토큰|블록체인|NFT|디파이|DeFi|거래소|채굴|스테이킹|알트코인|리플|솔라나|도지|밈코인|레이어|에어드랍|bitcoin|ethereum|crypto|blockchain|token|defi|nft|mining|altcoin|exchange|BTC|ETH|XRP|SOL|DOGE|binance|coinbase|wallet|stablecoin/i,
  stocks:
    /주식|주가|증시|코스피|코스닥|나스닥|다우|S&P|상장|IPO|배당|실적|매출|영업이익|시가총액|PER|EPS|PBR|ROE|공매도|기관|외국인|개인|ETF|펀드|종목|반도체|2차전지|바이오|stock|share|equity|nasdaq|dow|market|earnings|dividend|rally|bull|bear|index|portfolio|valuation/i,
};

function isRelevant(title: string, snippet: string, category: Category): boolean {
  const text = `${title} ${snippet}`;
  return RELEVANCE_KEYWORDS[category].test(text);
}

// 스팸/광고성 콘텐츠 필터
function isSpam(title: string): boolean {
  return /무료\s*상담|지금\s*신청|이벤트\s*참여|광고|제휴|sponsored|ad\b|promotion/i.test(title);
}

// 제목 기반 중복 제거 (유사도 기반)
function deduplicateByTitle(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title
      .replace(/[\s\-–—·|:：""''「」\[\]()（）<>《》『』]/g, "")
      .replace(/[.,!?;·…]/g, "")
      .toLowerCase()
      .slice(0, 25);
    if (key.length < 5) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function parseFeedWithRetry(
  url: string,
  sourceName: string,
  category: Category,
  needsRelevanceCheck: boolean
): Promise<NewsItem[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const feed = await parser.parseURL(url);
      const items: NewsItem[] = [];

      for (const item of feed.items || []) {
        const rawTitle = item.title?.trim();
        if (!rawTitle) continue;

        const title = cleanTitle(rawTitle);
        if (!title || title.length < 5) continue;
        if (isSpam(title)) continue;

        const pubDate = parseDate(item.pubDate) || parseDate(item.isoDate);
        if (!pubDate) continue;

        const rawSnippet = item.contentSnippet || item.content || item.summary || "";
        const snippet = truncate(stripHtml(rawSnippet), 200);

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
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  return [];
}

export async function fetchNewsByCategory(
  category: Category,
  limit = 100
): Promise<NewsItem[]> {
  const categoryFeeds = FEEDS.filter((f) => f.category === category);

  // 피드를 배치로 나눠서 동시 요청 수 제한 (서버 과부하 방지)
  const BATCH_SIZE = 5;
  const allItems: NewsItem[] = [];

  for (let i = 0; i < categoryFeeds.length; i += BATCH_SIZE) {
    const batch = categoryFeeds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((f) =>
        parseFeedWithRetry(f.url, f.name, f.category, f.broad ?? false)
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    }
  }

  allItems.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

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
