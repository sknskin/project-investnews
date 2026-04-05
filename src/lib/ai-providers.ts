/**
 * AI 프로바이더 공통 로직 — Groq/Gemini 호출 및 폴백 체인
 * Common AI provider logic — Groq/Gemini calls and fallback chain
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// AI 프로바이더 설정 상수
// AI provider configuration constants
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
const MAX_TOKENS = 4000;
const TEMPERATURE = 0.5;
const TIMEOUT_MS = 30000;

async function tryGroq(prompt: string, systemMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      // 서버 로그에만 상세 정보 기록, 에러 메시지에는 포함하지 않음
      // Log details only to server, do not include in error message
      console.error(`[AI] Groq API ${res.status}:`, body.slice(0, 200));
      throw new Error(`Groq API 호출 실패 (${res.status})`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function tryGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { maxOutputTokens: MAX_TOKENS },
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[AI] Gemini ${modelName} failed: ${msg}`);
      // 쿼터/레이트 리밋 에러가 아니면 즉시 throw
      // Throw immediately if not a quota/rate limit error
      if (!msg.includes("429") && !msg.includes("quota") && !msg.includes("rate")) {
        throw error;
      }
    }
  }

  throw new Error("Gemini quota exceeded");
}

/**
 * AI 프로바이더 폴백 체인 — Groq -> Gemini 순서로 시도
 * AI provider fallback chain — tries Groq -> Gemini in order
 */
export async function callWithFallback(prompt: string, systemMessage: string): Promise<string> {
  const providers: { name: string; fn: () => Promise<string> }[] = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({ name: "Groq", fn: () => tryGroq(prompt, systemMessage) });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: "Gemini", fn: () => tryGemini(prompt) });
  }

  if (providers.length === 0) {
    throw new Error("AI API 키가 설정되지 않았습니다. GROQ_API_KEY 또는 GEMINI_API_KEY를 .env.local에 추가해주세요.");
  }

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await provider.fn();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[AI] ${provider.name} failed: ${msg}`);
      errors.push(`${provider.name}: ${msg}`);
    }
  }

  console.error("[AI] All providers failed:", errors.join(" | "));
  throw new Error("AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
}
