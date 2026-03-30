import Parser from "rss-parser";
import { FEEDS } from "./feeds";
import { Category, NewsItem } from "@/types";

const parser = new Parser({
  timeout: 3000,
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
  if (now - d.getTime() > 7 * 86400000) return null; // 7일로 축소
  return d.toISOString();
}

// 카테고리별 관련성 키워드
// Relevance keywords per category
const RELEVANCE_KEYWORDS: Record<Category, RegExp> = {
  domestic:
    /경제|금리|물가|GDP|수출|수입|무역|환율|부동산|고용|실업|인플|디플|성장률|경기|소비자|기업|산업|재정|예산|세금|투자|금융|은행|채권|펀드|자산|부채|대출|연금|보험|증권|주식|stock|market|trade|economy|inflation|rate|growth|fiscal|monetary|bank|fed|ecb|정치|국회|대통령|총리|여당|야당|선거|법안|입법|탄핵|청문|외교|안보|통일|북한|정부|장관|의원|정당|개혁|인사|정책|규제|예산|전쟁|war|군사|military|중동|이란|Iran|미사일|missile|공습|airstrike|휴전|ceasefire|NATO|핵|nuclear|테러|terror|politics|government|election|congress|parliament|policy|minister|sanction|diplomacy|주가|증시|코스피|코스닥|나스닥|다우|S&P|상장|IPO|배당|실적|매출|영업이익|시가총액|PER|EPS|PBR|ROE|공매도|기관|외국인|개인|ETF|펀드|종목|반도체|2차전지|바이오|채권|선물|옵션|파생|공모주|부동산정책|금감원|한은/i,
  international:
    /경제|금융|시장|무역|관세|금리|인플|GDP|석유|원유|달러|유로|위안|엔화|연준|Fed|ECB|BOJ|IMF|OPEC|G7|G20|전쟁|war|군사|military|미사일|missile|공습|airstrike|폭격|bombing|침공|invasion|휴전|ceasefire|제재|sanction|중동|Middle East|이란|Iran|이스라엘|Israel|NATO|핵|nuclear|테러|terror|분쟁|conflict|난민|refugee|러시아|Russia|우크라이나|Ukraine|크렘린|Kremlin|푸틴|Putin|젤렌스키|Zelensky|economy|market|trade|tariff|rate|inflation|stock|oil|dollar|growth|recession|bank|finance|invest|business|fiscal|monetary|treasury|bond|yield|share|equity|nasdaq|dow|earnings|dividend|rally|bull|bear|index|portfolio|valuation|S&P|IPO|ETF/i,
  crypto:
    /비트코인|이더리움|암호화폐|코인|토큰|블록체인|NFT|디파이|DeFi|거래소|채굴|스테이킹|알트코인|리플|솔라나|도지|밈코인|레이어|에어드랍|bitcoin|ethereum|crypto|blockchain|token|defi|nft|mining|altcoin|exchange|BTC|ETH|XRP|SOL|DOGE|binance|coinbase|wallet|stablecoin/i,
};

function isRelevant(title: string, snippet: string, category: Category): boolean {
  const text = `${title} ${snippet}`;
  return RELEVANCE_KEYWORDS[category].test(text);
}

// 속보 감지 키워드
// Breaking news detection keywords
const BREAKING_KEYWORDS =
  /속보|긴급|breaking|급등|급락|폭락|폭등|서킷브레이커|금리인상|금리인하/i;

// 속보 감지 시간 기준 (밀리초)
// Breaking news time threshold (ms)
const BREAKING_TIME_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2시간

// 대폭 변동률 언급 패턴 (±3% 이상)
// Large change percent mention pattern (±3% or more)
const LARGE_CHANGE_PATTERN = /[+-]?\d{1,2}(\.\d+)?%/;
const MIN_CHANGE_PERCENT = 3;

/**
 * 속보 여부를 감지한다.
 * Detects whether a news item qualifies as breaking news.
 */
function detectBreaking(item: NewsItem): boolean {
  const now = Date.now();
  const articleTime = new Date(item.pubDate).getTime();
  const isRecent = now - articleTime < BREAKING_TIME_THRESHOLD_MS;

  if (!isRecent) return false;

  // 제목에 속보 키워드가 포함된 경우
  // Title contains breaking keywords
  if (BREAKING_KEYWORDS.test(item.title)) return true;

  // 제목에 ±3% 이상 변동률 언급이 있는 경우
  // Title mentions ±3% or larger change percent
  const match = item.title.match(LARGE_CHANGE_PATTERN);
  if (match) {
    const percent = Math.abs(parseFloat(match[0].replace("%", "")));
    if (percent >= MIN_CHANGE_PERCENT) return true;
  }

  return false;
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
      .slice(0, 35);
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
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  return [];
}

// 서버 사이드 인메모리 캐시
// Server-side in-memory cache
const newsCache = new Map<string, { items: NewsItem[]; timestamp: number }>();
const NEWS_CACHE_TTL = 60_000; // 1분 — 메뉴 이동 시 최신 뉴스 반영
// 1 minute — ensures fresh news on navigation

export async function fetchNewsByCategory(
  category: Category,
  limit = 100
): Promise<NewsItem[]> {
  // 캐시 확인
  // Check cache first
  const cacheKey = `${category}:${limit}`;
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL) {
    return cached.items;
  }

  const categoryFeeds = FEEDS.filter((f) => f.category === category);

  // 피드를 배치로 나눠서 동시 요청 수 제한 (서버 과부하 방지)
  const BATCH_SIZE = 15;
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
  const sliced = unique.slice(0, limit);

  // 속보 감지 적용
  // Apply breaking news detection
  for (const item of sliced) {
    item.isBreaking = detectBreaking(item);
  }

  // 캐시에 저장
  // Store in cache
  newsCache.set(cacheKey, { items: sliced, timestamp: Date.now() });

  return sliced;
}

export async function fetchAllCategories(
  limitPerCategory = 6
): Promise<Record<Category, NewsItem[]>> {
  const categories: Category[] = [
    "domestic",
    "international",
    "crypto",
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
