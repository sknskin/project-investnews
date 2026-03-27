import { NextResponse } from "next/server";
import { analyzeHeadlines } from "@/lib/ai";
import { Category } from "@/types";

export const maxDuration = 60;

const VALID_CATEGORIES: Category[] = [
  "domestic",
  "international",
  "crypto",
];

// 인메모리 캐시 (카테고리+headlines 해시 기반)
// In-memory cache (category + headlines hash based)
const analysisCache = new Map<
  string,
  { result: string; timestamp: number }
>();
const CACHE_TTL = 3 * 60 * 1000; // 3분 — 시장 변동 반영을 위해 단축
// 3 minutes — shortened to reflect market changes
const MAX_CACHE_SIZE = 50;

// 만료된 캐시 엔트리 정리
// Clean up expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of analysisCache) {
    if (now - entry.timestamp > CACHE_TTL) {
      analysisCache.delete(key);
    }
  }
}

// headlines 기반 간단한 해시 생성
// Generate simple hash from headlines
function hashHeadlines(headlines: { title: string }[]): string {
  const str = headlines.map((h) => h.title).join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const headlines = body.headlines;

    // 입력 검증 — headlines 배열 구조 확인
    // Input validation — verify headlines array structure
    if (!Array.isArray(headlines) || headlines.length === 0) {
      return NextResponse.json(
        { error: "headlines must be a non-empty array" },
        { status: 400 }
      );
    }

    const validHeadlines = headlines.filter(
      (h: unknown): h is { title: string; source: string; snippet?: string } =>
        typeof h === "object" && h !== null &&
        typeof (h as Record<string, unknown>).title === "string" &&
        typeof (h as Record<string, unknown>).source === "string"
    );

    if (validHeadlines.length === 0) {
      return NextResponse.json(
        { error: "headlines must contain objects with title and source" },
        { status: 400 }
      );
    }

    // 캐시 키: 카테고리 + headlines 해시
    // Cache key: category + headlines hash
    const cacheKey = `${category}:${hashHeadlines(validHeadlines)}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ analysis: cached.result, cached: true });
    }

    const analysis = await analyzeHeadlines(validHeadlines, category as Category);

    // 캐시 크기 제한 — 오래된 엔트리 정리
    // Cache size limit — clean up old entries
    if (analysisCache.size >= MAX_CACHE_SIZE) {
      cleanExpiredCache();
    }

    analysisCache.set(cacheKey, { result: analysis, timestamp: Date.now() });

    return NextResponse.json({ analysis, cached: false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    console.error(`[Analyze API] ${category} error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
