import { Badge } from "@/components/ui/badge";

// 소스 prefix → 고정 색상 HSL
const COLOR_MAP: [string, string][] = [
  // 국내
  ["한국경제", "217 90% 61%"],
  ["매일경제", "190 80% 50%"],
  ["머니투데이", "168 70% 50%"],
  ["이데일리", "152 70% 50%"],
  ["서울경제", "140 60% 50%"],
  ["아시아경제", "80 60% 50%"],
  ["헤럴드", "200 70% 55%"],
  ["조선비즈", "220 20% 55%"],
  ["뉴시스", "330 70% 60%"],
  ["연합뉴스", "0 75% 55%"],
  ["SBS", "197 80% 55%"],
  ["MBC", "152 70% 50%"],
  ["KBS", "217 80% 55%"],
  // 해외
  ["BBC", "350 65% 60%"],
  ["CNBC", "40 80% 55%"],
  ["Yahoo", "270 65% 60%"],
  ["WSJ", "30 15% 55%"],
  ["NYT", "220 15% 55%"],
  ["Bloomberg", "275 65% 55%"],
  ["Guardian", "210 70% 55%"],
  ["Reuters", "25 80% 55%"],
  ["FT", "340 55% 60%"],
  ["MarketWatch", "90 55% 50%"],
  ["Economist", "0 65% 55%"],
  ["Al Jazeera", "40 70% 55%"],
  ["AP News", "0 70% 55%"],
  // 코인
  ["CoinDesk", "25 80% 55%"],
  ["CoinTelegraph", "170 65% 50%"],
  ["CryptoSlate", "240 60% 60%"],
  ["Decrypt", "145 60% 50%"],
  ["The Block", "220 15% 55%"],
  ["Bitcoin", "40 80% 55%"],
  ["CryptoNews", "190 70% 50%"],
  ["BeInCrypto", "275 60% 58%"],
  ["NewsBTC", "25 75% 55%"],
  ["U.Today", "350 60% 58%"],
  ["AMBCrypto", "217 70% 55%"],
  ["DailyHodl", "152 60% 50%"],
  ["Blockonomi", "265 55% 58%"],
  ["CryptoPotato", "80 55% 50%"],
  ["블록미디어", "240 55% 58%"],
  ["코인니스", "197 65% 55%"],
  // 증권
  ["Investing", "145 55% 50%"],
  ["Seeking Alpha", "25 70% 55%"],
  ["Motley Fool", "217 65% 55%"],
  ["Benzinga", "170 60% 50%"],
  // Google
  ["Google", "220 15% 55%"],
];

function getHsl(source: string): string {
  for (const [prefix, hsl] of COLOR_MAP) {
    if (source.startsWith(prefix)) return hsl;
  }
  return "220 15% 55%";
}

export default function SourceBadge({ source }: { source: string }) {
  const hsl = getHsl(source);

  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium px-2 py-0 h-5"
      style={{
        backgroundColor: `hsl(${hsl} / 0.1)`,
        color: `hsl(${hsl})`,
        borderColor: `hsl(${hsl} / 0.2)`,
      }}
    >
      {source}
    </Badge>
  );
}
