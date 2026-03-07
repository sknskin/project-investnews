import { NextResponse } from "next/server";
import { analyzeMarketIndices } from "@/lib/ai-market";

export const maxDuration = 60;

const cache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

export async function POST(request: Request) {
  const cacheKey = "market-summary";
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ analysis: cached.result, cached: true });
  }

  try {
    const body = await request.json();
    const indices: { nameKo: string; name: string; price: number; change: number; changePercent: number; group: string }[] = body.indices;

    if (!indices || indices.length === 0) {
      return NextResponse.json({ error: "No indices provided" }, { status: 400 });
    }

    const analysis = await analyzeMarketIndices(indices);
    cache.set(cacheKey, { result: analysis, timestamp: Date.now() });

    return NextResponse.json({ analysis, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("[Analyze Market API] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
