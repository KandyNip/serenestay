// app/api/pro/verify/route.ts — Creem signature verification & Pro token issuance
// Verifies Creem redirect signature and issues our own signed Pro token

import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Live product IDs
const VALID_PRODUCT_IDS = [
  'prod_4Tswoy49WmcyoR0XrxO0SR', // Monthly
  'prod_4D1Yb4ziXDLQ3ky8VufgdU', // Annual
];

// Creem redirect parameters to verify (excluding signature)
const CREEM_PARAMS = ['checkout_id', 'order_id', 'customer_id', 'subscription_id', 'product_id'];

// base64url encoding: replace + with -, / with _, remove = padding
function base64url(data: string | Buffer): string {
  const base64 = typeof data === 'string' ? Buffer.from(data).toString('base64') : data.toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// base64url decoding
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Verify Creem signature using HMAC-SHA256
function verifyCreemSignature(params: Record<string, string>, signature: string, apiKey: string): boolean {
  // Build parameter string: sort non-empty params by key alphabetically
  const sortedKeys = Object.keys(params)
    .filter((key) => key !== 'signature' && params[key])
    .sort();

  const paramString = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');

  // Compute expected HMAC-SHA256
  const expected = crypto.createHmac('sha256', apiKey).update(paramString).digest('hex');

  // Timing-safe comparison
  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

// Sign our own Pro token payload
function signProToken(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check required parameters
    const checkout_id = body.checkout_id || '';
    const order_id = body.order_id || '';
    const customer_id = body.customer_id || '';
    const subscription_id = body.subscription_id || '';
    const product_id = body.product_id || '';
    const signature = body.signature || '';

    if (!checkout_id || !order_id || !customer_id || !subscription_id || !product_id || !signature) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Get environment variables
    const creemApiKey = process.env.CREEM_API_KEY;
    const signingSecret = process.env.PRO_SIGNING_SECRET;

    if (!creemApiKey || !signingSecret) {
      console.error('[pro/verify] Missing CREEM_API_KEY or PRO_SIGNING_SECRET');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Validate product_id is in our live product list
    if (!VALID_PRODUCT_IDS.includes(product_id)) {
      return Response.json({ error: 'Invalid product' }, { status: 401 });
    }

    // Verify Creem signature
    const creemParams: Record<string, string> = {
      checkout_id,
      order_id,
      customer_id,
      subscription_id,
      product_id,
    };

    const isValid = verifyCreemSignature(creemParams, signature, creemApiKey);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Signature verified — issue Pro token
    const tokenPayload = JSON.stringify({
      isPro: true,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      pid: product_id,
    });

    const payloadB64 = base64url(tokenPayload);
    const tokenSignature = signProToken(payloadB64, signingSecret);
    const token = `${payloadB64}.${tokenSignature}`;

    return Response.json({ token });
  } catch (error) {
    console.error('[pro/verify] Error:', error);
    return Response.json({ error: 'Verification failed' }, { status: 500 });
  }
}
