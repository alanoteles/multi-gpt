import type { ModelKey, ModelResult } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

type QueryModelsPayload = {
  prompt: string;
  models: ModelKey[];
};

export type QueryModelsResponse = {
  prompt: string;
  results: Array<ModelResult>;
};

export const submitPrompt = async (payload: QueryModelsPayload): Promise<QueryModelsResponse> => {
  const response = await fetch(`${API_BASE_URL}/models/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      data?.message ||
      data?.error ||
      `Erro ao consultar o backend (${response.status} ${response.statusText}).`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return response.json();
};
