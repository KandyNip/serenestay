import { createChatCompletion } from '../../../lib/deepseek';
import { buildItineraryDayMessages } from '../../../lib/prompts';
import { getDestinationBySlug } from '@/lib/destinations';
import crypto from 'crypto';

export const maxDuration = 60;

const VALID_PRODUCT_IDS = [
  'prod_4Tswoy49WmcyoR0XrxO0SR',
  'prod_4D1Yb4ziXDLQ3ky8VufgdU',
];

function verifyProToken(token: string): boolean {
  try {
    const signingSecret = process.env.PRO_SIGNING_SECRET;
    if (!signingSecret) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, signatureB64] = parts;
    const expectedSig = crypto.createHmac('sha256', signingSecret).update(payloadB64).digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const sigBuffer = Buffer.from(signatureB64);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;
    let base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    if (payload.exp <= Date.now()) return false;
    if (payload.isPro !== true) return false;
    if (!VALID_PRODUCT_IDS.includes(payload.pid)) return false;
    return true;
  } catch { return false; }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, proToken, dayNumber, totalDays, moodChips, previousDaysContext, focus, chatContext } = body;

    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });
    if (!dayNumber || !totalDays) return Response.json({ error: 'dayNumber and totalDays are required' }, { status: 400 });

    const isPro = proToken ? verifyProToken(proToken) : false;
    if (!isPro) return Response.json({ error: 'Pro access required' }, { status: 403 });

    const destination = await getDestinationBySlug(slug);
    if (!destination) return Response.json({ error: 'Destination not found' }, { status: 404 });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 500 });

    const messages = buildItineraryDayMessages(
      destination,
      dayNumber,
      totalDays,
      moodChips || ['Chill'],
      previousDaysContext || '',
      focus || 'wellness',
      chatContext
    );

    // Single day needs fewer tokens
    const maxTokens = 2000;

    const raw = await createChatCompletion(messages, { apiKey, maxTokens });

    // Try to parse JSON response from AI
    let dayContent: string;
    let title: string | undefined;
    let note: string | undefined;

    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object') {
        title = parsed.title;
        note = parsed.note;
        dayContent = parsed.content || raw;
      } else {
        dayContent = raw;
      }
    } catch {
      // Fallback: treat entire response as markdown content
      dayContent = raw;
    }

    return Response.json({ dayContent, title, note });
  } catch (error) {
    console.error('[api/itinerary-day] Error:', error);
    return Response.json({ error: 'Failed to generate day itinerary' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
