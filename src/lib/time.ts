/**
 * ISO 문자열 → 상대 시간 (서버/클라이언트 동일 출력)
 * ISO 형식 기준이므로 hydration mismatch 없음
 */
export function relativeTime(isoStr: string): string {
  const then = new Date(isoStr).getTime();
  if (isNaN(then)) return "";

  const now = Date.now();
  const diff = now - then;

  if (diff < 0) return "방금 전";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}일 전`;

  // 7일 이상은 날짜 표시 (YYYY.MM.DD 형식 — locale 무관)
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
