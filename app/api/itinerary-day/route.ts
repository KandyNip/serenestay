import { createChatCompletion } from '../../../lib/deepseek';
import { buildItineraryDayMessages, buildHealingDayMessages } from '../../../lib/prompts';
import { getDestinationBySlug } from '@/lib/destinations';
import { computeJourneyPhase } from '@/lib/healing-types';
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
    const {
      slug, proToken, dayNumber,
      // Legacy fields
      moodChips, previousDaysContext, focus, chatContext,
      // Healing journey fields
      currentState, intentions, journeyPhase, experiencePortrait, previousDaysContext: healingPrevDays, chatContext: healingChatContext,
    } = body;

    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });
    if (!dayNumber) return Response.json({ error: 'dayNumber is required' }, { status: 400 });

    const isPro = proToken ? verifyProToken(proToken) : false;
    if (!isPro) return Response.json({ error: 'Pro access required' }, { status: 403 });

    const destination = await getDestinationBySlug(slug);
    if (!destination) return Response.json({ error: 'Destination not found' }, { status: 404 });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 500 });

    // Determine which path to take: healing journey or legacy mood chips
    const isHealing = !!currentState;

    if (isHealing) {
      // ── Healing Journey Path ──
      const portrait = experiencePortrait || { coveredIntentions: [], uncoveredIntentions: intentions || [], daysGenerated: 0 };
      const phase = journeyPhase || computeJourneyPhase(dayNumber, portrait, healingChatContext || undefined);

      const messages = buildHealingDayMessages(
        destination,
        dayNumber,
        currentState,
        intentions || [],
        phase,
        portrait,
        healingPrevDays || '',
        healingChatContext,
      );

      const maxTokens = 3000;
      const raw = await createChatCompletion(messages, { apiKey, maxTokens });

      // Parse JSON from AI response
      let dayData;
      try {
        let jsonStr = raw.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        const parsed = JSON.parse(jsonStr);

        if (parsed && typeof parsed === 'object' && parsed.energyBlocks && Array.isArray(parsed.energyBlocks)) {
          dayData = parsed;
        } else {
          throw new Error('Missing required energyBlocks field');
        }
      } catch (parseError) {
        console.error('[api/itinerary-day] Healing JSON parse failed:', parseError);
        return Response.json({
          dayContent: raw,
          format: 'markdown',
        });
      }

      return Response.json({
        dayContent: dayData,
        format: 'healing-json',
      });
    } else {
      // ── Legacy Mood Chips Path ──
      const messages = buildItineraryDayMessages(
        destination,
        dayNumber,
        moodChips || ['Chill'],
        previousDaysContext || '',
        focus || 'wellness',
        chatContext,
      );

      const maxTokens = 2000;
      const raw = await createChatCompletion(messages, { apiKey, maxTokens });

      let dayData;
      let format: 'json' | 'markdown' = 'markdown';
      try {
        let jsonStr = raw.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        const parsed = JSON.parse(jsonStr);

        if (parsed && typeof parsed === 'object' && parsed.sections && Array.isArray(parsed.sections)) {
          dayData = parsed;
          format = 'json';
        } else {
          throw new Error('Missing required sections field');
        }
      } catch (parseError) {
        console.error('[api/itinerary-day] JSON parse failed, returning raw markdown:', parseError);
        return Response.json({
          dayContent: raw,
          format: 'markdown',
        });
      }

      return Response.json({
        dayContent: dayData,
        format: 'json',
      });
    }
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
