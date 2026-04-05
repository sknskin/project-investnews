import { NextResponse } from "next/server";
import { fetchNewsByCategory } from "@/lib/rss";
import { Category, VALID_CATEGORIES } from "@/types";

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
    // 내부 에러 상세를 클라이언트에 노출하지 않음
    // Do not expose internal error details to client
    console.error(`[News API] ${category} error:`, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "뉴스를 불러오는데 실패했습니다" }, { status: 500 });
  }
}
