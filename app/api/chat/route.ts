// app/api/chat/route.ts — AI Chat streaming endpoint
// Handles SSE streaming from DeepSeek API
//
// Usage:
//   POST /api/chat
//   Body: { messages: [{role, content}], stream?: boolean }
//
// Response (streaming):
//   text/event-stream with data: {"content": "..."} chunks

import {
  createStreamingCompletion,
  createChatCompletion,
  transformStream,
  DeepSeekAPIError,
} from '../../../lib/deepseek';
import { buildChatMessages } from '../../../lib/prompts';
import { loadDestinations } from '../../../lib/destinations';
import type { ChatMessage, ChatRequest } from '../../../lib/types';

// Use Node.js runtime (not Edge) to support fs.readFileSync for JSON data
export const dynamic = 'force-dynamic';

// ============================================================
// Input Validation
// ============================================================

function validateRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body is required');
  }

  const { messages, stream } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ValidationError('messages array is required and must not be empty');
  }

  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      throw new ValidationError('Each message must have role and content');
    }
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      throw new ValidationError(`Invalid message role: ${msg.role}`);
    }
  }

  return {
    messages: messages as ChatMessage[],
    stream: typeof stream === 'boolean' ? stream : true,
  };
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================
// POST Handler — Main chat endpoint
// ============================================================

export async function POST(request: Request) {
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const { messages, stream } = validateRequest(body);

    // 2. Load destination data for AI context
    const destinations = await loadDestinations();

    // 3. Build full message array with system prompt + destination data
    const fullMessages = buildChatMessages(messages, destinations);

    // 4. Get API key from environment
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: { code: 'CONFIG_ERROR', message: 'AI service not configured' } },
        { status: 500 }
      );
    }

    // 5. Call DeepSeek API
    if (stream) {
      return handleStreamingResponse(fullMessages, apiKey);
    } else {
      return handleNonStreamingResponse(fullMessages, apiKey);
    }
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================
// Streaming Response
// ============================================================

async function handleStreamingResponse(
  messages: ChatMessage[],
  apiKey: string
): Promise<Response> {
  const upstream = await createStreamingCompletion(messages, { apiKey });
  const transformed = transformStream(upstream);

  return new Response(transformed, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ============================================================
// Non-Streaming Response
// ============================================================

async function handleNonStreamingResponse(
  messages: ChatMessage[],
  apiKey: string
): Promise<Response> {
  const content = await createChatCompletion(messages, { apiKey });

  return Response.json(
    {
      message: {
        role: 'assistant',
        content,
      },
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

// ============================================================
// Error Handler
// ============================================================

function handleError(error: unknown): Response {
  console.error('[api/chat] Error:', error);

  if (error instanceof ValidationError) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: error.message } },
      { status: 400 }
    );
  }

  if (error instanceof DeepSeekAPIError) {
    // Log detailed DeepSeek API error for debugging on Vercel
    console.error('[api/chat] DeepSeek API Error:', {
      statusCode: error.statusCode,
      clientErrorCode: error.clientErrorCode,
      responseBody: error.responseBody,
    });

    return Response.json(
      {
        error: {
          code: error.clientErrorCode,
          message:
            error.statusCode === 429
              ? 'Too many requests. Please try again in a moment.'
              : 'AI service temporarily unavailable.',
        },
      },
      { status: error.statusCode >= 500 ? 502 : error.statusCode }
    );
  }

  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
    { status: 500 }
  );
}

// ============================================================
// OPTIONS Handler — CORS preflight
// ============================================================

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
