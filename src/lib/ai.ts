import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { NewsItem, Category } from "@/types";

const CATEGORY_CONTEXT: Record<Category, string> = {
  economy: "국내 경제 뉴스",
  politics: "국내 정치 뉴스 (경제·시장 영향 관점)",
  world: "해외 경제/정치 뉴스",
  crypto: "암호화폐/코인 뉴스",
  stocks: "주식/증권 뉴스",
};

function buildPrompt(items: NewsItem[], category: Category): string {
  const headlines = items
    .slice(0, 15)
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}`)
    .join("\n");

  return `당신은 월스트리트 출신 전문 투자 애널리스트입니다. 모든 뉴스를 반드시 "투자 자산(주식, 채권, 코인, 원자재, 환율 등)에 어떤 영향을 미치는가"의 관점에서만 분석합니다.

아래는 오늘의 ${CATEGORY_CONTEXT[category]} 헤드라인입니다.

${headlines}

[규칙]
- 모든 분석은 구체적인 투자 자산(코스피, S&P500, 비트코인, 원/달러, 국채, 금, 유가 등)과 연결하여 작성
- "~로 인해 ~가 상승/하락/변동 전망" 형태의 인과관계 중심으로 서술
- 정치·사회 뉴스도 반드시 시장·투자 영향으로 연결 (예: "이란 전쟁 리스크 → 유가 상승 → 운송주 하락 압력")
- 추상적 표현 금지, 구체적 섹터/종목군/자산명 언급

다음 형식으로 작성:

## 핵심 이슈 & 시장 영향
- 주요 뉴스 3~4개를 각각 "뉴스 요약 → 영향받는 자산/섹터 → 예상 방향(상승/하락/관망)" 형태로 정리

## 자산별 영향 전망
- 주식(코스피/S&P500):
- 코인(BTC/ETH):
- 환율(원/달러):
- 채권/금리:
- 원자재(금/유가):
(해당 카테고리와 관련 있는 자산 위주로 작성, 관련 없으면 생략)

## 투자 전략 제안
- 현 상황에서 유리한 포지션, 주의해야 할 섹터, 관망/매수/매도 의견

## 리스크 요인
- 시장 반전 가능성, 변수, 주의할 이벤트 일정

한국어로, 핵심만 간결하게 작성해주세요.`;
}

async function tryGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const groq = new Groq({ apiKey });
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 1500,
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");
  return text;
}

async function tryGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[AI] Gemini ${modelName} failed: ${msg}`);
      if (!msg.includes("429") && !msg.includes("quota") && !msg.includes("rate")) {
        throw error;
      }
    }
  }

  throw new Error("Gemini quota exceeded");
}

export async function analyzeNews(
  items: NewsItem[],
  category: Category
): Promise<string> {
  const prompt = buildPrompt(items, category);

  // 1순위: Groq (무료 할당량 넉넉)
  // 2순위: Gemini (폴백)
  const providers: { name: string; fn: () => Promise<string> }[] = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({ name: "Groq", fn: () => tryGroq(prompt) });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: "Gemini", fn: () => tryGemini(prompt) });
  }

  if (providers.length === 0) {
    throw new Error("AI API 키가 설정되지 않았습니다. GROQ_API_KEY 또는 GEMINI_API_KEY를 .env.local에 추가해주세요.");
  }

  for (const provider of providers) {
    try {
      return await provider.fn();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[AI] ${provider.name} failed: ${msg}`);
    }
  }

  throw new Error("AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
}
