import { callWithFallback } from "./ai-providers";

interface IndexInput {
  nameKo: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  group: string;
}

// 시장 분석용 시스템 메시지
// System message for market analysis
const SYSTEM_MESSAGE = "당신은 골드만삭스 수석 투자 전략가입니다. 실시간 시장 지수 데이터를 분석하여 구체적이고 실행 가능한 투자 인사이트를 제공합니다. 모든 분석에 실제 숫자를 인용하세요.";

function buildPrompt(indices: IndexInput[]): string {
  const data = indices
    .map((idx) => {
      const sign = idx.change >= 0 ? "+" : "";
      return `- ${idx.nameKo} (${idx.name}): ${idx.price.toLocaleString("en-US", { maximumFractionDigits: 2 })} (${sign}${idx.change.toFixed(2)}, ${sign}${idx.changePercent.toFixed(2)}%) [${idx.group}]`;
    })
    .join("\n");

  // 현재 시각을 프롬프트에 포함
  // Include current timestamp in prompt
  const now = new Date();
  const timestamp = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 ${now.getMinutes()}분 (KST 기준)`;

  return `당신은 골드만삭스 출신 20년 경력의 수석 투자 전략가입니��. 아래는 현재 실시간 글로벌 시장 지수 데이터입니다.

분석 시점: ${timestamp}

${data}

위 데이터를 기반으로 종합적인 시장 분석 리포트를 작성해주세요.

[분석 규칙]
- 실제 지수 데이터의 숫자(가격, 변동폭, 변동률)를 인용하며 분석
- 지수 간 상관관계와 인과관계 분석 (예: 미국 하락 → 한국 선물 영향)
- 추상적 표현 금지, 구체적 수치와 자산명 포함
- 각 섹션별로 충분히 상세하게 작성 (총 분석 길이: 최소 1000자 이상)

다음 형식으로 작성해주세요:

## 글로벌 시장 현황 종합
현재 시장 전반의 분위기를 지수 데이터 기반으로 요약. 주요 지수들의 방향성과 특이점을 3~4문장으로 서술.

## 지역별 시장 분석
- **미국 시장**: 나스닥, S&P 500, 다우존스, 러셀 2000, 반도체 지수의 움직임 분석. 어떤 섹터가 주도/하락하는지.
- **한국 시장**: 코스피/코스닥 동향, 외국인/기관 수급 추정, 미국 시장 영향 분석.
- **선��� 시장**: 나스닥/S&P/다우 선물이 시사하는 다음 거래일 방향성.

## 환율·원자재·변동성
- **환율**: 달러/원, 유로/달러, 달러/엔 변동 원인과 영향
- **VIX**: 공포지수 수준이 의미하는 시장 심리
- **원자재**: 금, 원유, 은의 움직임과 배경
- **암호화폐**: 비트코인, 이더리움 동향

## 투자 전략 제안
- **공격적 투자자**: 현재 지수 데이터 기반 매수/매도 기회
- **보수적 투자자**: 방어 전략, 안전자산 비중 조정
- **단기 트레이더**: 주목할 지수 레벨과 변곡점

## 리스크 요인 & 주요 변수
- 현재 시장을 뒤집을 수 있는 변수 3~4개
- 주의해야 할 지수 레벨 (지지선/저항선)
- 향후 1주일 주요 이벤트

한국어로 상세하게 작성해주세요. 투자자가 바로 행동에 옮길 수 있을 정도로 구체적이어야 합니다.`;
}

export async function analyzeMarketIndices(indices: IndexInput[]): Promise<string> {
  const prompt = buildPrompt(indices);
  return callWithFallback(prompt, SYSTEM_MESSAGE);
}
