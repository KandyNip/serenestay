// lib/deepseek.ts — DeepSeek API client with SSE streaming support
// DeepSeek API is OpenAI-compatible

import type { ChatMessage, DeepSeekStreamChunk } from './types';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-chat';

interface DeepSeekConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Create a non-streaming chat completion
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  config: DeepSeekConfig
): Promise<string> {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model ?? DEEPSEEK_MODEL,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2048,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new DeepSeekAPIError(
      `DeepSeek API error: ${response.status} ${response.statusText}`,
      response.status,
      error
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

/**
 * Create a streaming chat completion — returns a ReadableStream
 * suitable for SSE (Server-Sent Events) responses.
 */
export async function createStreamingCompletion(
  messages: ChatMessage[],
  config: DeepSeekConfig
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model ?? DEEPSEEK_MODEL,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new DeepSeekAPIError(
      `DeepSeek API error: ${response.status} ${response.statusText}`,
      response.status,
      error
    );
  }

  const reader = response.body;
  if (!reader) {
    throw new DeepSeekAPIError('No response body from DeepSeek API', 500, '');
  }

  return reader;
}

/**
 * Transform DeepSeek SSE stream into a simplified SSE format for the client.
 * This acts as a proxy — strips unnecessary fields, keeps only content deltas.
 */
export function transformStream(
  upstream: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  const reader = upstream.getReader();

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          continue;
        }

        try {
          const chunk: DeepSeekStreamChunk = JSON.parse(data);
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const payload = JSON.stringify({ content });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch {
          // Skip malformed chunks
        }
      }
    },

    cancel() {
      reader.cancel();
    },
  });
}

// ============================================================
// Error Handling
// ============================================================

export class DeepSeekAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody: string
  ) {
    super(message);
    this.name = 'DeepSeekAPIError';
  }

  get clientErrorCode(): string {
    if (this.statusCode === 401) return 'AUTH_FAILED';
    if (this.statusCode === 429) return 'RATE_LIMITED';
    if (this.statusCode >= 500) return 'AI_SERVICE_ERROR';
    return 'AI_REQUEST_ERROR';
  }
}
