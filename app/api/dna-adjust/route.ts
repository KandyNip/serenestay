// app/api/dna-adjust/route.ts — 解析用户自然语言意图，调整9维权重 + 提取硬约束
// POST /api/dna-adjust
// Body: { message: string, currentWeights: Record<ScoreKey, number> }
// Response: { adjustedWeights: Record<ScoreKey, number>, hardFilters: HardFilters, explanation: string }

import { createChatCompletion } from '../../../lib/deepseek';
import type { ScoreKey } from '../../../lib/dna-quiz';

const ADJUST_SYSTEM_PROMPT = `You analyze a user's message about their healing travel preferences and output TWO things: (1) soft weight adjustments to their 9-dimension profile, and (2) hard filter constraints that exclude non-matching destinations.

The 9 dimensions (currently 1-10, where 10 = most important):
- serenity: Peace, quiet, escape from noise
- nature: Natural environment access
- climate: Weather comfort
- affordability: Budget-friendliness
- wellness: Healing programs, spa, yoga
- community: Social scene, expat community
- wifi: Internet reliability
- visa: Visa ease
- medical: Healthcare access

Available geoTags for hard filtering:
- "coastal" — seaside, beach, oceanfront
- "island" — independent island
- "mountain" — highland, mountain area
- "forest" — forest, jungle, woodland
- "lake" — lakeside
- "river" — riverside
- "city" — urban environment
- "countryside" — rural, small town

Available healingTags for hard filtering (sample):
ocean-therapy, surf-therapy, forest-bathing, temple-stay, meditation, yoga, thai-massage, hot-springs, digital-detox, sound-healing, ayurveda, vipassana, cacao-ceremony, temazcal, zen-retreat, tea-ceremony, etc.

Rules for adjustments:
1. Only adjust dimensions that the user's message clearly implies
2. Most adjustments should be +1 or +2, occasionally +3 for very strong signals
3. When increasing some dimensions, you may decrease the LOWEST importance dimensions by 1 to keep balance
4. If the message doesn't relate to travel preferences, return empty adjustments with a friendly explanation

Rules for hardFilters (CRITICAL):
1. When the user specifies a LOCATION TYPE requirement (e.g., "seaside", "beach", "ocean", "mountain", "island", "city", "countryside"), put it in requiredGeoTags — NOT in adjustments. For example, "I want to stay in a seaside city" → requiredGeoTags: ["coastal", "city"], NOT nature+1.
2. When the user specifies a BUDGET requirement (e.g., "under $700/month", "budget-friendly"), put the max monthly cost in budgetMax (USD integer).
3. When the user specifies a SPECIFIC ACTIVITY requirement (e.g., "must have surfing", "I need meditation centers"), put the matching healingTag in requiredTags.
4. When the user says something NEGATIVE (e.g., "no cities", "not interested in mountains", "avoid islands"), put the matching geoTag in excludedGeoTags.
5. If no hard constraints are implied, return empty hardFilters.

Output format (JSON only, no markdown):
{
  "adjustments": { "dimension": +/-amount, ... },
  "hardFilters": {
    "requiredGeoTags": [],
    "excludedGeoTags": [],
    "budgetMax": null,
    "requiredTags": []
  },
  "explanation": "Brief 1-sentence explanation"
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, currentWeights } = body as { message: string; currentWeights: Record<ScoreKey, number> };

    if (!message || !currentWeights) {
      return Response.json({ error: 'message and currentWeights required' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const userMessage = `Current weights: ${JSON.stringify(currentWeights)}\n\nUser says: "${message}"\n\nSuggest adjustments.`;

    const content = await createChatCompletion(
      [
        { role: 'system', content: ADJUST_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { apiKey, temperature: 0.3, maxTokens: 300 }
    );

    // 解析AI返回的JSON
    let parsed;
    try {
      // 尝试从content中提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {}

    if (!parsed || !parsed.adjustments) {
      return Response.json({
        adjustedWeights: currentWeights,
        explanation: "I couldn't adjust your profile from that message. Could you tell me more specifically about your travel preferences?",
      });
    }

    // 应用调整
    const adjustedWeights = { ...currentWeights };
    for (const [key, value] of Object.entries(parsed.adjustments)) {
      if (key in adjustedWeights && typeof value === 'number') {
        adjustedWeights[key as ScoreKey] = Math.max(1, Math.min(10, adjustedWeights[key as ScoreKey] + value));
      }
    }

    // 提取硬约束（hardFilters）
    const parsedFilters = parsed.hardFilters || {};
    const hardFilters = {
      requiredGeoTags: Array.isArray(parsedFilters.requiredGeoTags) ? parsedFilters.requiredGeoTags : [],
      excludedGeoTags: Array.isArray(parsedFilters.excludedGeoTags) ? parsedFilters.excludedGeoTags : [],
      budgetMax: typeof parsedFilters.budgetMax === 'number' ? parsedFilters.budgetMax : null,
      requiredTags: Array.isArray(parsedFilters.requiredTags) ? parsedFilters.requiredTags : [],
    };

    return Response.json({
      adjustedWeights,
      hardFilters,
      explanation: parsed.explanation || 'Profile adjusted based on your input.',
    });
  } catch (error) {
    console.error('[api/dna-adjust] Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
