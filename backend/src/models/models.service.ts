import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubmitPromptDto } from './dto/submit-prompt.dto';
import { ModelKey, ModelResult } from './model.types';

type ModelHandler = (
  prompt: string,
  maxTokens: number,
) => Promise<Omit<ModelResult, 'id'>>;

@Injectable()
export class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

  constructor(private readonly configService: ConfigService) {}

  async queryModels({ prompt, models }: SubmitPromptDto) {
    const normalizedPrompt = prompt?.trim();
    if (!normalizedPrompt) {
      throw new BadRequestException('PROMPT_REQUIRED');
    }

    if (!Array.isArray(models) || models.length === 0) {
      throw new BadRequestException('MODEL_SELECTION_REQUIRED');
    }

    const uniqueModels = Array.from(new Set(models)) as ModelKey[];
    const invalid = uniqueModels.filter((model) => !this.isSupportedModel(model));
    if (invalid.length > 0) {
      throw new BadRequestException(`UNSUPPORTED_MODELS:${invalid.join(',')}`);
    }

    const maxTokens = this.getMaxTokens();
    const results = await Promise.all(
      uniqueModels.map(async (model) => {
        try {
          const handler = this.getModelHandler(model);
          const data = await handler(normalizedPrompt, maxTokens);
          return { id: model, ...data } satisfies ModelResult;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error while querying the model.';
          this.logger.error(`Model ${model} failed: ${message}`);
          return { id: model, error: message } satisfies ModelResult;
        }
      }),
    );

    return {
      prompt: normalizedPrompt,
      results,
    };
  }

  private isSupportedModel(model: string): model is ModelKey {
    return model === 'openai' || model === 'gemini' || model === 'claude';
  }

  private getModelHandler(model: ModelKey): ModelHandler {
    switch (model) {
      case 'openai':
        return this.queryOpenAI.bind(this);
      case 'gemini':
        return this.queryGemini.bind(this);
      case 'claude':
        return this.queryClaude.bind(this);
      default:
        throw new BadRequestException(`Unsupported model: ${model}`);
    }
  }

  private getRequiredKey(envName: string): string {
    const value = this.configService.get<string>(envName);
    if (!value) {
      throw new Error(`Environment variable ${envName} is not configured.`);
    }
    return value;
  }

  private getModelName(envName: string, fallback: string) {
    return this.configService.get<string>(envName) || fallback;
  }

  private formatApiError(provider: string, data: any, fallback: string) {
    if (data?.error) {
      const { message, code, type } = data.error;
      const parts = [message, code, type].filter(Boolean);
      if (parts.length > 0) {
        return `${provider}: ${parts.join(' | ')}`;
      }
    }
    return `${provider}: ${fallback}`;
  }

  private getMaxTokens(): number {
    const envValue = this.configService.get<string>('MAX_TOKENS');
    const parsed = Number(envValue);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(Math.floor(parsed), 4000);
    }
    return 800;
  }

  private async queryOpenAI(prompt: string, maxTokens: number) {
    const apiKey = this.getRequiredKey('OPENAI_API_KEY');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        this.formatApiError('OpenAI', data, 'Failed to query OpenAI.'),
      );
    }

    const content = data.choices?.[0]?.message?.content;
    const text =
      (Array.isArray(content) ? content.join('\n\n') : content ?? '').trim() ||
      '(No content returned by OpenAI.)';

    return {
      text,
      tokensUsed: data.usage?.total_tokens,
      tokensRemaining: data.usage?.remaining_tokens ?? data.usage?.tokens_remaining,
    };
  }

  private async queryGemini(prompt: string, maxTokens: number) {
    const apiKey = this.getRequiredKey('GEMINI_API_KEY');
    const model = this.getModelName(
      'GEMINI_MODEL',
      'gemini-1.5-flash-latest',
    );
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        this.formatApiError('Gemini', data, 'Failed to query Gemini.'),
      );
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((part: { text?: string }) => part.text ?? '').join('\n\n');

    return {
      text: text.trim() || '(No content returned by Gemini.)',
      tokensUsed: data.usageMetadata?.totalTokenCount,
      tokensRemaining: data.usageMetadata?.remainingTokenCount,
    };
  }

  private async queryClaude(prompt: string, maxTokens: number) {
    const apiKey = this.getRequiredKey('CLAUDE_API_KEY');
    const model = this.getModelName(
      'CLAUDE_MODEL',
      'claude-3-5-sonnet-20240620',
    );
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        this.formatApiError('Claude', data, 'Failed to query Claude.'),
      );
    }

    const segments = data.content ?? [];
    const text = segments.map((segment: { text?: string }) => segment.text ?? '').join('\n\n');

    return {
      text: text.trim() || '(No content returned by Claude.)',
      tokensUsed: data.usage?.total_tokens ?? data.usage?.output_tokens,
      tokensRemaining: data.usage?.tokens_remaining,
    };
  }
}
