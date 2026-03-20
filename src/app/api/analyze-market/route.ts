import { NextResponse } from "next/server";
import { analyzeMarketIndices } from "@/lib/ai-market";

export const maxDuration = 60;

// 인메모리 캐시 (해시 기반)
// In-memory cache (hash based)
const cache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

// indices 기반 간단한 해시 생성
// Generate simple hash from indices
function hashIndices(indices: { name: string; price: number }[]): string {
  const str = indices.map((i) => `${i.name}:${i.price}`).join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
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
    const cacheKey = `market:${hashIndices(validIndices)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ analysis: cached.result, cached: true });
    }

    const analysis = await analyzeMarketIndices(validIndices);
    cache.set(cacheKey, { result: analysis, timestamp: Date.now() });

    return NextResponse.json({ analysis, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("[Analyze Market API] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
