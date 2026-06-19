import { createChatCompletion } from '../../../lib/deepseek';
import { buildInsightsMessages } from '../../../lib/prompts';
import { getDestinationBySlug } from '@/lib/destinations';
import crypto from 'crypto';

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
    const { slug, proToken } = body;
    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });

    // Pro check
    const isPro = proToken ? verifyProToken(proToken) : false;
    if (!isPro) return Response.json({ error: 'Pro access required' }, { status: 403 });

    const destination = await getDestinationBySlug(slug);
    if (!destination) return Response.json({ error: 'Destination not found' }, { status: 404 });

    const messages = buildInsightsMessages(destination);
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 500 });

    const content = await createChatCompletion(messages, { apiKey });
    return Response.json({ insights: content });
  } catch (error) {
    console.error('[api/insights] Error:', error);
    return Response.json({ error: 'Failed to generate insights' }, { status: 500 });
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
