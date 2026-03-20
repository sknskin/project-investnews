import { NextResponse } from "next/server";
import { fetchNewsByCategory } from "@/lib/rss";
import { Category } from "@/types";

const VALID_CATEGORIES: Category[] = [
  "economy",
  "politics",
  "world",
  "crypto",
  "stocks",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    const items = await fetchNewsByCategory(category as Category, 100);

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "뉴스 조회 실패";
    console.error(`[News API] ${category} error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
