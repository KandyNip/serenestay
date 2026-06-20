// app/api/match/route.ts — AI-powered destination matching endpoint
//
// Usage:
//   POST /api/match
//   Body: {
//     preferences: {
//       budget?: number,
//       climate?: string,
//       healingFocus?: string,
//       community?: boolean,
//       nature?: boolean,
//       wifi?: boolean
//     },
//     chatHistory?: ChatMessage[]
//   }
//
// Response:
//   { matches: Destination[], reasoning: string, followUpQuestions: string[] }

import { loadDestinations, hasHardVeto } from '../../../lib/destinations';
import { createChatCompletion, DeepSeekAPIError } from '../../../lib/deepseek';
import type { Destination, ChatMessage } from '../../../lib/types';

export const dynamic = 'force-dynamic';

interface MatchRequest {
  preferences?: {
    budget?: number;
    region?: string;
    healingFocus?: string;
    community?: boolean;
    nature?: boolean;
    wifi?: boolean;
    tags?: string[];
  };
  chatHistory?: ChatMessage[];
}

// ============================================================
// POST Handler — AI-powered matching
// ============================================================

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MatchRequest;
    const { preferences, chatHistory } = body;

    // 1. Load all destinations
    const allDestinations = await loadDestinations();

    // 2. Filter destinations based on preferences
    let candidates = allDestinations;

    if (preferences) {
      candidates = filterByPreferences(candidates, preferences);
    }

    // 3. Score and rank destinations
    const scored = scoreDestinations(candidates, preferences);
    const topMatches = scored.slice(0, 5);

    // 4. Generate AI reasoning for top matches
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: { code: 'CONFIG_ERROR', message: 'AI service not configured' } },
        { status: 500 }
      );
    }

    const reasoning = await generateMatchReasoning(
      topMatches.map((s) => s.destination),
      preferences,
      chatHistory,
      apiKey
    );

    // 5. Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(preferences);

    return Response.json(
      {
        matches: topMatches.map((s) => s.destination),
        scores: topMatches.map((s) => ({
          slug: s.destination.slug,
          matchScore: s.matchScore,
        })),
        reasoning,
        followUpQuestions,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('[api/match] Error:', error);

    if (error instanceof DeepSeekAPIError) {
      return Response.json(
        {
          error: {
            code: error.clientErrorCode,
            message: 'AI matching service temporarily unavailable.',
          },
        },
        { status: error.statusCode >= 500 ? 502 : error.statusCode }
      );
    }

    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Matching failed.' } },
      { status: 500 }
    );
  }
}

// ============================================================
// Filtering Logic
// ============================================================

function filterByPreferences(
  destinations: Destination[],
  preferences: MatchRequest['preferences']
): Destination[] {
  let filtered = [...destinations];

  if (!preferences) return filtered;

  // Filter by budget (monthly cost mid tier)
  if (preferences.budget) {
    filtered = filtered.filter((d) => d.monthlyCost.mid <= preferences.budget! * 1.2);
  }

  // Filter by region
  if (preferences.region) {
    filtered = filtered.filter(
      (d) => d.region.toLowerCase() === preferences.region!.toLowerCase()
    );
  }

  // Filter by tags
  if (preferences.tags && preferences.tags.length > 0) {
    filtered = filtered.filter((d) =>
      preferences.tags!.some((tag) =>
        d.tags.some((dt) => dt.toLowerCase() === tag.toLowerCase())
      )
    );
  }

  // Filter by WiFi requirement
  if (preferences.wifi) {
    filtered = filtered.filter((d) => d.scores.wifi >= 3);
  }

  return filtered;
}

// ============================================================
// Scoring Logic
// ============================================================

interface ScoredDestination {
  destination: Destination;
  matchScore: number;
}

function scoreDestinations(
  destinations: Destination[],
  preferences?: MatchRequest['preferences']
): ScoredDestination[] {
  if (!preferences) {
    // No preferences — sort by overall score
    return destinations
      .map((d) => ({
        destination: d,
        matchScore: calculateOverallScore(d),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  return destinations
    .map((d) => ({
      destination: d,
      matchScore: calculateMatchScore(d, preferences),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function calculateOverallScore(destination: Destination): number {
  const scores = destination.scores;
  const total =
    scores.serenity +
    scores.nature +
    scores.climate +
    scores.affordability +
    scores.wellness +
    scores.community +
    scores.wifi +
    scores.visa +
    scores.medical;
  return Math.round((total / 45) * 100); // 9 dimensions * 5 max = 45
}

function calculateMatchScore(
  destination: Destination,
  preferences: MatchRequest['preferences']
): number {
  let score = 0;
  const weights = {
    serenity: 1,
    nature: 1,
    climate: 1,
    affordability: 1,
    wellness: 1,
    community: 1,
    wifi: 1,
    visa: 1,
    medical: 1,
  };

  // Adjust weights based on preferences
  if (preferences?.healingFocus) {
    const focus = preferences.healingFocus.toLowerCase();
    if (focus.includes('burnout') || focus.includes('stress')) {
      weights.serenity = 2;
      weights.nature = 1.5;
      weights.wellness = 1.5;
    } else if (focus.includes('yoga') || focus.includes('meditation')) {
      weights.wellness = 2;
      weights.serenity = 1.5;
      weights.nature = 1.5;
    } else if (focus.includes('work') || focus.includes('digital nomad')) {
      weights.wifi = 2;
      weights.community = 1.5;
      weights.affordability = 1.5;
    }
  }

  if (preferences?.community) weights.community = 1.5;
  if (preferences?.nature) weights.nature = 1.5;
  if (preferences?.wifi) weights.wifi = 2;

  const scores = destination.scores;
  const weightedSum =
    scores.serenity * weights.serenity +
    scores.nature * weights.nature +
    scores.climate * weights.climate +
    scores.affordability * weights.affordability +
    scores.wellness * weights.wellness +
    scores.community * weights.community +
    scores.wifi * weights.wifi +
    scores.visa * weights.visa +
    scores.medical * weights.medical;

  const maxPossible =
    5 * (weights.serenity +
    weights.nature +
    weights.climate +
    weights.affordability +
    weights.wellness +
    weights.community +
    weights.wifi +
    weights.visa +
    weights.medical);

  score = Math.round((weightedSum / maxPossible) * 100);

  // Penalty for hard veto conditions
  const veto = hasHardVeto(destination);
  if (veto.hasVeto) {
    score = Math.max(0, score - 20);
  }

  return score;
}

// ============================================================
// AI Reasoning Generation
// ============================================================

async function generateMatchReasoning(
  matches: Destination[],
  preferences: MatchRequest['preferences'],
  chatHistory: ChatMessage[] | undefined,
  apiKey: string
): Promise<string> {
  const matchSummaries = matches
    .map(
      (d, i) =>
        `${i + 1}. ${d.name} (${d.country}) — Match Score: ${calculateMatchScore(d, preferences)}%
   Scores: serenity=${d.scores.serenity}, nature=${d.scores.nature}, wellness=${d.scores.wellness}, wifi=${d.scores.wifi}, medical=${d.scores.medical}
   Cost: $${d.monthlyCost.mid}/mo | Best for: ${d.tags.slice(0, 3).join(', ')}`
    )
    .join('\n');

  const systemPrompt = `You are Serene, the AI wellness travel guide for SereneStay.ai.
Generate a warm, concise explanation (3-4 sentences) for why these destinations were recommended based on the user's preferences.

User Preferences:
- Budget: ${preferences?.budget ? `$${preferences.budget}/mo` : 'Flexible'}
- Healing Focus: ${preferences?.healingFocus || 'General wellness'}
- Community: ${preferences?.community ? 'Important' : 'Not specified'}
- Nature: ${preferences?.nature ? 'Important' : 'Not specified'}
- WiFi: ${preferences?.wifi ? 'Essential' : 'Not specified'}

Top Matches:
${matchSummaries}

Write in a warm, conversational tone. Explain WHY these destinations match their needs. Be specific about which scores drove the recommendation.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Why did you recommend these destinations for me?' },
  ];

  return createChatCompletion(messages, { apiKey, maxTokens: 500 });
}

// ============================================================
// Follow-up Questions
// ============================================================

function generateFollowUpQuestions(
  preferences?: MatchRequest['preferences']
): string[] {
  const questions: string[] = [
    'What matters most to you — quiet solitude or vibrant community?',
    'Do you need reliable WiFi for remote work?',
  ];

  if (!preferences?.budget) {
    questions.push('What\'s your approximate monthly budget?');
  }

  if (!preferences?.healingFocus) {
    questions.push('What\'s your primary goal — burnout recovery, yoga healing stay, or something else?');
  }

  if (!preferences?.nature) {
    questions.push('How important is access to nature (mountains, beaches, forests)?');
  }

  return questions.slice(0, 3);
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
