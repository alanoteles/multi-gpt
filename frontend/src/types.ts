export type ModelKey = "openai" | "gemini" | "claude";

export interface ModelOption {
  key: ModelKey;
  labelKey: string;
  helperKey: string;
  cardClasses: string;
  badgeClasses: string;
}

export interface ModelUsage {
  tokensUsed?: number;
  tokensRemaining?: number;
}

export interface ModelResult extends ModelUsage {
  id: ModelKey;
  text?: string;
  error?: string;
}

export interface ModelResponse extends ModelResult {
  loading: boolean;
}
