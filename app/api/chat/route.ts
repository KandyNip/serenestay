// app/api/chat/route.ts — AI Chat streaming endpoint
// Handles SSE streaming from DeepSeek API
//
// Usage:
//   POST /api/chat
//   Body: { messages: [{role, content}], stream?: boolean }
//
// Response (streaming):
//   text/event-stream with data: {"content": "..."} chunks

import crypto from 'crypto';
import {
  createStreamingCompletion,
  createChatCompletion,
  transformStream,
  DeepSeekAPIError,
} from '../../../lib/deepseek';

// Extend Vercel function timeout for streaming responses
export const maxDuration = 60;

import { buildChatMessages } from '../../../lib/prompts';
import { loadDestinations } from '../../../lib/destinations';
import type { ChatMessage, ChatRequest } from '../../../lib/types';

// Use Node.js runtime (not Edge) to support fs.readFileSync for JSON data
export const dynamic = 'force-dynamic';


// Live product IDs
const VALID_PRODUCT_IDS = [
  'prod_4Tswoy49WmcyoR0XrxO0SR', // Monthly
  'prod_4D1Yb4ziXDLQ3ky8VufgdU', // Annual
];

// ============================================================
// Pro Token Verification
// ============================================================

function verifyProToken(token: string): boolean {
  try {
    const signingSecret = process.env.PRO_SIGNING_SECRET;
    if (!signingSecret) return false;

    // Split token into payload and signature
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [payloadB64, signatureB64] = parts;

    // Compute expected signature
    const expectedSig = crypto.createHmac('sha256', signingSecret).update(payloadB64).digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Timing-safe comparison
    const sigBuffer = Buffer.from(signatureB64);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

    // Decode payload
    let base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

    // Check expiration, isPro flag, and product ID
    if (payload.exp <= Date.now()) return false;
    if (payload.isPro !== true) return false;
    if (!VALID_PRODUCT_IDS.includes(payload.pid)) return false;

    return true;
  } catch {
    return false;
  }
}

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

    // Verify Pro status server-side via token (ignore client's isProUser claim)
    const proToken = typeof body.proToken === 'string' ? body.proToken : '';
    const isProUser = proToken ? verifyProToken(proToken) : false;

    // 2. Load destination data for AI context
    const destinations = await loadDestinations();

    // 3. Build full message array with system prompt + destination data + pro status
    const fullMessages = buildChatMessages(messages, destinations, isProUser);

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
