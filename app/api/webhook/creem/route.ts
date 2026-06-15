// app/api/webhook/creem/route.ts — Creem payment webhook handler
// Receives payment events from Creem and verifies signature
//
// Events handled:
//   - checkout.completed: One-time payment completed
//   - subscription.active: Subscription activated/renewed
//
// Creem sends webhooks to this endpoint after payment events.
// We verify the signature using HMAC-SHA256 with the webhook secret.
//
// Environment variables required:
//   CREEM_WEBHOOK_SECRET: The webhook secret from Creem dashboard

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// ============================================================
// Signature Verification
// ============================================================

/**
 * Verify Creem webhook signature using HMAC-SHA256
 *
 * Creem typically sends signature in one of these headers:
 * - X-Creem-Signature (most likely)
 * - X-Signature
 * - X-Webhook-Signature
 *
 * Signature format is usually: sha256=<hash> or just the hash
 */
function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    console.error('[Creem Webhook] No signature header found');
    return false;
  }

  // Extract the hash from signature (handle "sha256=xxx" format)
  const sigHash = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  // Compute expected signature
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  // Timing-safe comparison
  const sigBuffer = Buffer.from(sigHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    console.error('[Creem Webhook] Signature length mismatch');
    return false;
  }

  const isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!isValid) {
    console.error('[Creem Webhook] Signature verification failed');
    console.error('[Creem Webhook] Received:', sigHash.substring(0, 16) + '...');
    console.error('[Creem Webhook] Expected:', expectedHash.substring(0, 16) + '...');
  }

  return isValid;
}

/**
 * Extract signature from request headers
 * Checks multiple possible header names (Creem docs may specify one)
 */
function extractSignature(headers: Headers): string | null {
  // Try common signature header names (order: most likely first)
  const headerNames = [
    'x-creem-signature',
    'x-signature',
    'x-webhook-signature',
    'creem-signature',
  ];

  for (const name of headerNames) {
    const value = headers.get(name);
    if (value) {
      console.log(`[Creem Webhook] Found signature in header: ${name}`);
      return value;
    }
  }

  return null;
}

// ============================================================
// Event Handlers
// ============================================================

interface CreemWebhookEvent {
  event: string;
  data: {
    id?: string;
    product_id?: string;
    customer_email?: string;
    customer_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    [key: string]: unknown;
  };
}

function handleCheckoutCompleted(event: CreemWebhookEvent): void {
  console.log('[Creem Webhook] ✅ checkout.completed received');
  console.log('[Creem Webhook] Event data:', JSON.stringify(event.data, null, 2));

  // TODO: Store payment confirmation in database
  // For now, we just log it. The success page handles Pro activation client-side.
  // Later, we can implement server-side Pro verification.

  const { customer_email, product_id, amount, currency } = event.data;
  console.log(
    `[Creem Webhook] Payment confirmed: ${customer_email} purchased ${product_id} for ${amount} ${currency}`
  );
}

function handleSubscriptionActive(event: CreemWebhookEvent): void {
  console.log('[Creem Webhook] ✅ subscription.active received');
  console.log('[Creem Webhook] Event data:', JSON.stringify(event.data, null, 2));

  // TODO: Store subscription status in database
  // For now, we just log it.

  const { customer_email, product_id, status } = event.data;
  console.log(
    `[Creem Webhook] Subscription activated: ${customer_email} subscribed to ${product_id} (status: ${status})`
  );
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Creem Webhook] CREEM_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Read raw body as text (required for signature verification)
    const payload = await request.text();

    // Extract and verify signature
    const signature = extractSignature(request.headers);
    const isValid = verifySignature(payload, signature, webhookSecret);

    if (!isValid) {
      console.error('[Creem Webhook] Invalid signature, rejecting request');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('[Creem Webhook] ✅ Signature verified successfully');

    // Parse payload
    let event: CreemWebhookEvent;
    try {
      event = JSON.parse(payload);
    } catch (error) {
      console.error('[Creem Webhook] Failed to parse JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log(`[Creem Webhook] Received event: ${event.event}`);

    // Handle different event types
    switch (event.event) {
      case 'checkout.completed':
        handleCheckoutCompleted(event);
        break;

      case 'subscription.active':
        handleSubscriptionActive(event);
        break;

      case 'subscription.cancelled':
        console.log('[Creem Webhook] Subscription cancelled:', event.data.customer_email);
        // TODO: Handle subscription cancellation
        break;

      case 'subscription.past_due':
        console.log('[Creem Webhook] Subscription past due:', event.data.customer_email);
        // TODO: Handle past due subscription
        break;

      default:
        console.log(`[Creem Webhook] Unhandled event type: ${event.event}`);
        // Still return 200 to acknowledge receipt
    }

    // Always return 200 to acknowledge receipt (otherwise Creem will retry)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Creem Webhook] Unexpected error:', error);
    // Return 500 so Creem retries
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler (for testing/debugging)
// ============================================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Creem webhook endpoint is active',
    events: ['checkout.completed', 'subscription.active', 'subscription.cancelled', 'subscription.past_due'],
  });
}
