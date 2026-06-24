// app/api/dna-match/route.ts — 根据DNA画像匹配Top目的地（支持geoTags硬约束过滤）
// POST /api/dna-match
// Body: { weights: Record<ScoreKey, number>, requiredGeoTags?: string[] }
// Response: { matches: Array<{ slug, name, country, emoji, matchScore, topTags, monthlyCostMid }>, filteredByGeoTags?: string[] }

import { loadDestinations } from '../../../lib/destinations';
import { calculateMatchScore, type ScoreKey, type DNAProfile } from '../../../lib/dna-quiz';
import type { Destination } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const weights: Record<ScoreKey, number> = body.weights;
    const requiredGeoTags: string[] = body.requiredGeoTags || [];

    if (!weights || Object.keys(weights).length !== 9) {
      return Response.json({ error: 'Invalid weights' }, { status: 400 });
    }

    const destinations = await loadDestinations();

    // 第一步：如果有硬约束，先过滤目的地
    let filteredDestinations = destinations;
    if (requiredGeoTags.length > 0) {
      filteredDestinations = destinations.filter((d: Destination) => {
        // 目的地必须包含所有必需的 geoTags
        return requiredGeoTags.every(tag => d.geoTags?.includes(tag as any));
      });
    }

    // 第二步：计算每个目的地的匹配度
    const scored = filteredDestinations.map((d: Destination) => ({
      slug: d.slug,
      name: d.name,
      country: d.country,
      matchScore: calculateMatchScore(
        { type: '', emoji: '', description: '', traits: [], weights, createdAt: 0 } as DNAProfile,
        d.scores
      ),
      topTags: d.healingTags.slice(0, 3),
      monthlyCostMid: d.monthlyCost.mid,
      scores: d.scores,
      emotionalTagline: d.emotionalTagline,
      image: d.images?.[0] || null,
    }));

    // 按匹配度排序，取Top 5
    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scored.slice(0, 5);

    return Response.json({
      matches: topMatches,
      filteredByGeoTags: requiredGeoTags.length > 0 ? requiredGeoTags : undefined,
    });
  } catch (error) {
    console.error('[api/dna-match] Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
