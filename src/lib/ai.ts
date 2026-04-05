import { NewsItem, Category } from "@/types";
import { fetchMarketIndices } from "./market";
import { callWithFallback } from "./ai-providers";

const CATEGORY_CONTEXT: Record<Category, string> = {
  domestic: "국내 투자 뉴스 (경제, 증권, 정책, 부동산, 금리 등)",
  international: "해외 투자 뉴스 (글로벌 경제, 미국/유럽/아시아 시장, 원자재, 지정학 등)",
  crypto: "암호화폐/코인 뉴스",
};

// 주요 시장 지수를 간결하게 포맷 — AI 프롬프트 컨텍스트용
// Format key market indices concisely — for AI prompt context
function formatIndicesForPrompt(indices: { nameKo: string; price: number; change: number; changePercent: number }[]): string {
  if (indices.length === 0) return "(지수 데이터 조회 실패)";
  return indices
    .map((idx) => {
      const sign = idx.change >= 0 ? "+" : "";
      return `${idx.nameKo}: ${idx.price.toLocaleString("en-US", { maximumFractionDigits: 2 })} (${sign}${idx.changePercent.toFixed(2)}%)`;
    })
    .join(" | ");
}

// 뉴스 분석용 시스템 메시지
// System message for news analysis
const SYSTEM_MESSAGE = "당신은 골드만삭스 수석 투자 전략가입니다. 항상 구체적인 자산명, 섹터, 종목군을 언급하며, 투자자가 즉시 행동할 수 있는 수준의 상세한 분석을 제공합니다. 절대 간략하게 쓰지 마세요. 각 섹션을 충분히 상세하게 작성하세요.";

async function buildPrompt(items: NewsItem[], category: Category): Promise<string> {
  const headlines = items
    .slice(0, 20)
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}${item.snippet ? ` — ${item.snippet}` : ""}`)
    .join("\n");

  // 현재 시각을 프롬프트에 포함 — AI가 시점을 인지하도록
  // Include current timestamp so AI is aware of the exact point in time
  const now = new Date();
  const timestamp = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 ${now.getMinutes()}분 (KST 기준)`;

  // 실시간 시장 지수 조회 — AI가 현재 시장 상황을 정확히 인지하도록
  // Fetch live market indices — so AI knows the exact current market state
  let marketContext = "";
  try {
    const indices = await fetchMarketIndices();
    if (indices.length > 0) {
      marketContext = `\n\n[현재 주요 시장 지수 (실시간)]\n${formatIndicesForPrompt(indices)}`;
    }
  } catch {
    // 지수 조회 실패 시 뉴스만으로 분석 진행
    // If index fetch fails, proceed with news-only analysis
  }

  return `당신은 골드만삭스 출신 20년 경력의 수석 투자 전략가입니다. 모든 뉴스를 "투자 자산(주식, 채권, 코인, 원자재, 환율, 부동산 등)에 어떤 영향을 미치는가"의 관점에서 깊이 있게 분석합니다.

현재 시각: ${timestamp}${marketContext}

아래는 최신 ${CATEGORY_CONTEXT[category]} 헤드라인과 요약입니다.

${headlines}

[분석 규칙]
- 모든 분석은 구체적인 투자 자산명(코스피, 코스닥, S&P500, 나스닥, 다우존스, 비트코인, 이더리움, 원/달러, 엔/달러, 국채 10년물, 금, WTI유, 천연가스 등)과 연결
- "~로 인해 ~가 상승/하락/변동 전망" 형태의 인과관계 중심 서술
- 정치·사회 뉴스도 반드시 시장·투자 영향으로 연결 (예: "이란 전쟁 리스크 → WTI유 +3~5% 상승 전망 → 항공·운송주 하락 압력, 정유·방산주 수혜")
- 추상적 표현 금지, 구체적 섹터/종목군/자산명/예상 변동폭 포함
- 각 섹션별로 충분히 상세하게 작성 (총 분석 길이: 최소 800자 이상)

다음 형식으로 상세하게 작성해주세요:

## 핵심 이슈 & 시장 영향
각 주요 뉴스(5~6개)를 아래 형태로 깊이 있게 분석:
- **[뉴스 제목 요약]**: 배경 설명 → 직접 영향받는 자산/섹터 나열 → 예상 방향(상승/하락/관망) 및 근거 → 관련 종목군이나 ETF 언급

## 자산별 영향 전망
각 자산별로 현재 상황과 뉴스 영향을 2~3문장씩 구체적으로:
- **주식(코스피/코스닥)**: 현재 지수 수준 대비 영향, 수혜/피해 업종
- **미국 주식(S&P500/나스���)**: 해당 뉴스가 미국 시장에 미칠 영향
- **코인(BTC/ETH/알트코인)**: 규제, 유동성, 심리 관점에서 분석
- **환율(원/달러)**: 수급 요인, 정책 방향 반영
- **채권/금리**: 중앙은행 정책, 인플레이션 연동 분석
- **원자재(금/유가/구리)**: 공급·수요 변동 요인
(해당 카테고리와 관련 높은 자산 위주, 관련 낮으면 간략히)

## 섹터별 투자 전략
- **수혜 예상 섹터**: 구체적 업종과 대표 종목군, 매수 타이밍 근거
- **주의 필요 섹터**: 리스크가 있는 업종, 비중 축소 근거
- **관망 추천 섹터**: 방향성 불확실한 영역

## 포트폴리오 액션 플랜
- 공격적 투자자: 구체적 포지션 제안
- 보수적 투자자: 방어 전략 제안
- 단기 트레이더: 주목할 이벤트와 타이밍

## 리스크 요인 & 변수
- 현재 시나리오를 뒤집을 수 있는 변수 3~4개
- 향후 1~2주 내 주요 경제 이벤트 일정 (있다면)
- 최악의 시나리오와 대응 방안

한국어로 상세하게 작성해주세요. 투자자가 바로 행동에 옮길 수 있을 정도로 구체적이어야 합니다.`;
}

export async function analyzeHeadlines(
  headlines: { title: string; source: string; snippet?: string }[],
  category: Category
): Promise<string> {
  const items = headlines.map((h) => ({
    title: h.title,
    source: h.source,
    snippet: h.snippet || "",
    link: "",
    pubDate: "",
    category,
  })) as NewsItem[];
  const prompt = await buildPrompt(items, category);

  return callWithFallback(prompt, SYSTEM_MESSAGE);
}
