import { NextRequest, NextResponse } from "next/server";

/**
 * 인메모리 Rate Limiter — API 라우트 보호
 * In-memory rate limiter — protects API routes
 *
 * 서버리스 환경에서는 인스턴스별로 독립적으로 동작합니다.
 * In serverless, each instance maintains its own rate limit state.
 */

// Rate limit 설정 / Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1분 / 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 분당 최대 요청 수 / Max requests per minute

// IP별 요청 기록 / Per-IP request tracking
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// 오래된 엔트리 정리 주기 / Stale entry cleanup interval
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5분 / 5 minutes
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, record] of requestCounts) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}

function isRateLimited(ip: string): boolean {
  cleanupStaleEntries();

  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count++;
  return record.count > RATE_LIMIT_MAX_REQUESTS;
}

export function middleware(request: NextRequest) {
  // API 라우트에만 rate limiting 적용
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 클라이언트 IP 추출 / Extract client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
