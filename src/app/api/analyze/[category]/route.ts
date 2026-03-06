import { NextResponse } from "next/server";
import { fetchNewsByCategory } from "@/lib/rss";
import { analyzeNews } from "@/lib/ai";
import { Category } from "@/types";

export const maxDuration = 60;

const VALID_CATEGORIES: Category[] = [
  "economy",
  "politics",
  "world",
  "crypto",
  "stocks",
];

// Simple in-memory cache for analysis results
const analysisCache = new Map<
  string,
  { result: string; timestamp: number }
>();
const CACHE_TTL = 10 * 60 * 1000; // 10분

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Check cache
  const cached = analysisCache.get(category);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ analysis: cached.result, cached: true });
  }

  try {
    const items = await fetchNewsByCategory(category as Category, 15);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No news items available for analysis" },
        { status: 404 }
      );
    }

    const analysis = await analyzeNews(items, category as Category);

    // Store in cache
    analysisCache.set(category, { result: analysis, timestamp: Date.now() });

    return NextResponse.json({ analysis, cached: false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`[Analyze API] ${category} error:`, message, stack);
    return NextResponse.json({
      error: message,
      debug: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        groqKeyPrefix: process.env.GROQ_API_KEY?.slice(0, 8),
        geminiKeyPrefix: process.env.GEMINI_API_KEY?.slice(0, 8),
      },
    }, { status: 500 });
  }
}
