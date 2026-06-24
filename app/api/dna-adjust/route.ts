// app/api/dna-adjust/route.ts — 解析用户自然语言意图，调整9维权重 + 提取硬约束
// POST /api/dna-adjust
// Body: { message: string, currentWeights: Record<ScoreKey, number> }
// Response: { adjustedWeights: Record<ScoreKey, number>, explanation: string, requiredGeoTags?: string[] }

import { createChatCompletion } from '../../../lib/deepseek';
import type { ScoreKey } from '../../../lib/dna-quiz';

const ADJUST_SYSTEM_PROMPT = `You analyze a user's message about their healing travel preferences and:
1. Suggest weight adjustments to a 9-dimension profile
2. Extract HARD CONSTRAINTS (geographic requirements) if present

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

HARD CONSTRAINTS (geoTags):
These are geographic requirements that MUST be satisfied. Only extract if the user explicitly states a geographic preference.
Available geoTags: "coastal", "mountain", "island", "forest", "lake", "river", "city", "countryside"

Examples of HARD CONSTRAINTS:
- "I want a seaside city" → requiredGeoTags: ["coastal", "city"]
- "Looking for a mountain retreat" → requiredGeoTags: ["mountain"]
- "Somewhere on an island" → requiredGeoTags: ["island"]
- "Near a lake" → requiredGeoTags: ["lake"]
- "I prefer forests" → requiredGeoTags: ["forest"]

Examples of SOFT PREFERENCES (NOT hard constraints):
- "I like warm weather" → adjust climate weight, NO geoTags
- "Budget under $700" → adjust affordability weight, NO geoTags
- "Need good WiFi" → adjust wifi weight, NO geoTags

Rules:
1. Only adjust dimensions that the user's message clearly implies
2. Most adjustments should be +1 or +2, occasionally +3 for very strong signals
3. When increasing some dimensions, you may decrease the LOWEST importance dimensions by 1 to keep balance
4. Only extract requiredGeoTags if the user explicitly mentions geographic features (sea, mountain, island, etc.)
5. If the message doesn't relate to travel preferences, return empty adjustments with a friendly explanation
6. Respond in JSON only, no markdown

Output format:
{
  "adjustments": { "dimension": +/-amount, ... },
  "requiredGeoTags": ["coastal", "city"],  // ONLY if hard constraint detected, otherwise omit or empty array
  "explanation": "Brief 1-sentence explanation of what you adjusted and why"
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

    // 提取硬约束（requiredGeoTags）
    const requiredGeoTags = Array.isArray(parsed.requiredGeoTags) ? parsed.requiredGeoTags : [];

    return Response.json({
      adjustedWeights,
      requiredGeoTags,
      explanation: parsed.explanation || 'Profile adjusted based on your input.',
    });
  } catch (error) {
    console.error('[api/dna-adjust] Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
