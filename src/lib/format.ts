/**
 * 가격/통화 포맷팅 유틸리티
 * Price/currency formatting utilities
 */

/** 지수별 통화 접두사 / Currency prefix by symbol */
export function getCurrencyPrefix(symbol: string): string {
  // 원화 표시 / Korean Won
  if (symbol === "KRW=X") return "\u20A9";
  // 채권 금리 / Bond yield (%)
  if (symbol.startsWith("^TNX") || symbol.startsWith("^TYX")) return "";
  // VIX (포인트) / VIX (points)
  if (symbol === "^VIX") return "";
  // 환율 (무단위) / Exchange rates (no unit)
  if (symbol.includes("=X") || symbol.includes("JPY")) return "";
  // 달러 표시 / Dollar sign
  return "$";
}

/** 지수별 단위 접미사 / Unit suffix by symbol */
export function getCurrencySuffix(symbol: string): string {
  if (symbol.startsWith("^TNX") || symbol.startsWith("^TYX")) return "%";
  if (symbol === "^VIX") return "pt";
  if (symbol === "KRW=X") return "";
  if (symbol.includes("=X") || symbol.includes("JPY")) return "";
  return "";
}

/** 지수 가격 포맷 / Format index price */
export function formatPrice(price: number, symbol: string): string {
  if (symbol.includes("=X") || symbol.includes("JPY")) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (symbol.startsWith("^TNX") || symbol.startsWith("^TYX")) {
    return price.toFixed(3);
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
