export type ModelKey = 'openai' | 'gemini' | 'claude';

export interface ModelResult {
  id: ModelKey;
  text?: string;
  error?: string;
  tokensUsed?: number;
  tokensRemaining?: number;
}
