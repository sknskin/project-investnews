/**
 * djb2 해시 함수 — 캐시 키 생성용
 * djb2 hash function — for cache key generation
 */
export function djb2Hash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}
