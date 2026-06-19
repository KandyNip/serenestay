import { createChatCompletion } from '../../../lib/deepseek';
import { buildComparisonMessages } from '../../../lib/prompts';
import { loadDestinations } from '@/lib/destinations';
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
    const { slugs, proToken, userContext } = body;
    if (!Array.isArray(slugs) || slugs.length < 2) {
      return Response.json({ error: 'At least 2 destination slugs required' }, { status: 400 });
    }

    const isPro = proToken ? verifyProToken(proToken) : false;
    if (!isPro) return Response.json({ error: 'Pro access required' }, { status: 403 });

    const allDestinations = await loadDestinations();
    const messages = buildComparisonMessages(slugs, allDestinations, userContext);
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 500 });

    const content = await createChatCompletion(messages, { apiKey });
    return Response.json({ comparison: content });
  } catch (error) {
    console.error('[api/compare] Error:', error);
    return Response.json({ error: 'Failed to generate comparison' }, { status: 500 });
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
