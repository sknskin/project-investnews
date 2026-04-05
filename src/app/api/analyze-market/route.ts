import { NextResponse } from "next/server";
import { analyzeMarketIndices } from "@/lib/ai-market";
import { djb2Hash } from "@/lib/hash";

export const maxDuration = 60;

// 인메모리 캐시 (해시 기반)
// In-memory cache (hash based)
const cache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3분 — 시장 변동 반영을 위해 단축
// 3 minutes — shortened to reflect market changes
const MAX_CACHE_SIZE = 50;

// 만료된 캐시 엔트리 정리
// Clean up expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const indices = body.indices;

    // 입력 검증 — indices 배열 구조 확인
    // Input validation — verify indices array structure
    if (!Array.isArray(indices) || indices.length === 0) {
      return NextResponse.json(
        { error: "indices must be a non-empty array" },
        { status: 400 }
      );
    }

    const validIndices = indices.filter(
      (i: unknown): i is { nameKo: string; name: string; price: number; change: number; changePercent: number; group: string } =>
        typeof i === "object" && i !== null &&
        typeof (i as Record<string, unknown>).name === "string" &&
        typeof (i as Record<string, unknown>).price === "number"
    );

    if (validIndices.length === 0) {
      return NextResponse.json(
        { error: "indices must contain objects with name and price" },
        { status: 400 }
      );
    }

    // 캐시 키: indices 해시 기반
    // Cache key: based on indices hash
    const cacheKey = `market:${djb2Hash(validIndices.map((i) => `${i.name}:${i.price}`).join("|"))}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ analysis: cached.result, cached: true });
    }

    const analysis = await analyzeMarketIndices(validIndices);

    // 캐시 크기 제한 — 오래된 엔트리 정리
    // Cache size limit — clean up old entries
    if (cache.size >= MAX_CACHE_SIZE) {
      cleanExpiredCache();
    }

    cache.set(cacheKey, { result: analysis, timestamp: Date.now() });

    return NextResponse.json({ analysis, cached: false });
  } catch (error) {
    // 내부 에러 상세를 클라이언트에 노출하지 않음
    // Do not expose internal error details to client
    console.error("[Analyze Market API] error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "시장 분석에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
