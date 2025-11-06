import type { ModelKey } from "../types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";
const CLAUDE_URL = "https://api.anthropic.com/v1/messages";

const requireKey = (envName: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Configure ${envName} no arquivo .env.`);
  }
  return value;
};

const callOpenAI = async (prompt: string, apiKey: string) => {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Falha ao consultar o OpenAI.");
  }

  const message = data.choices?.[0]?.message?.content;
  return (Array.isArray(message) ? message.join("\n\n") : message ?? "").trim() ||
    "(Sem conte\u00fado retornado pelo OpenAI.)";
};

const callGemini = async (prompt: string, apiKey: string) => {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Falha ao consultar o Gemini.");
  }

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((part: { text?: string }) => part.text ?? "").join("\n\n");
  return text.trim() || "(Sem conte\u00fado retornado pelo Gemini.)";
};

const callClaude = async (prompt: string, apiKey: string) => {
  const response = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Falha ao consultar o Claude.");
  }

  const segments = data.content ?? [];
  const text = segments
    .map((segment: { text?: string }) => segment.text ?? "")
    .join("\n\n");

  return text.trim() || "(Sem conte\u00fado retornado pelo Claude.)";
};

export async function fetchModelResponse(model: ModelKey, prompt: string): Promise<string> {
  switch (model) {
    case "openai":
      return callOpenAI(prompt, requireKey("VITE_OPENAI_API_KEY", import.meta.env.VITE_OPENAI_API_KEY));
    case "gemini":
      return callGemini(prompt, requireKey("VITE_GEMINI_API_KEY", import.meta.env.VITE_GEMINI_API_KEY));
    case "claude":
      return callClaude(prompt, requireKey("VITE_CLAUDE_API_KEY", import.meta.env.VITE_CLAUDE_API_KEY));
    default:
      throw new Error("Modelo n\u00e3o suportado.");
  }
}
