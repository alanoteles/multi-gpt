export type ModelKey = "openai" | "gemini" | "claude";

export interface ModelOption {
  key: ModelKey;
  label: string;
  helper: string;
  cardClasses: string;
  badgeClasses: string;
}

export interface ModelResponse {
  id: ModelKey;
  loading: boolean;
  text?: string;
  error?: string;
}
