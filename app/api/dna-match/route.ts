// app/api/dna-match/route.ts — 根据DNA画像匹配Top目的地
// POST /api/dna-match
// Body: { weights: Record<ScoreKey, number> }
// Response: { matches: Array<{ slug, name, country, emoji, matchScore, topTags, monthlyCostMid }> }

import { loadDestinations } from '../../../lib/destinations';
import { calculateMatchScore, type ScoreKey } from '../../../lib/dna-quiz';
import type { Destination } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const weights: Record<ScoreKey, number> = body.weights;

    if (!weights || Object.keys(weights).length !== 9) {
      return Response.json({ error: 'Invalid weights' }, { status: 400 });
    }

    const destinations = await loadDestinations();

    // 计算每个目的地的匹配度
    const scored = destinations.map((d: Destination) => ({
      slug: d.slug,
      name: d.name,
      country: d.country,
      matchScore: calculateMatchScore({ weights } as any, d.scores),
      topTags: d.healingTags.slice(0, 3),
      monthlyCostMid: d.monthlyCost.mid,
      scores: d.scores,
      emotionalTagline: d.emotionalTagline,
      image: d.images?.[0] || null,
    }));

    // 按匹配度排序，取Top 5
    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scored.slice(0, 5);

    return Response.json({ matches: topMatches });
  } catch (error) {
    console.error('[api/dna-match] Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
