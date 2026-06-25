// app/api/dna-match/route.ts — 根据DNA画像匹配Top目的地（支持hardFilters硬约束过滤）
// POST /api/dna-match
// Body: { weights: Record<ScoreKey, number>, hardFilters?: HardFilters }
// Response: { matches: Array, filteredByGeoTags?: string[] }

import { loadDestinations } from '../../../lib/destinations';
import { calculateMatchScore, type ScoreKey, type DNAProfile } from '../../../lib/dna-quiz';
import type { Destination } from '../../../lib/types';

interface HardFilters {
  requiredGeoTags?: string[];
  excludedGeoTags?: string[];
  budgetMax?: number | null;
  requiredTags?: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const weights: Record<ScoreKey, number> = body.weights;
    const hardFilters: HardFilters = body.hardFilters || {};

    if (!weights || Object.keys(weights).length !== 9) {
      return Response.json({ error: 'Invalid weights' }, { status: 400 });
    }

    const destinations = await loadDestinations();

    // 第一步：如果有硬约束，先过滤目的地
    let filteredDestinations = destinations;
    const hasFilters = 
      (hardFilters.requiredGeoTags && hardFilters.requiredGeoTags.length > 0) ||
      (hardFilters.excludedGeoTags && hardFilters.excludedGeoTags.length > 0) ||
      hardFilters.budgetMax ||
      (hardFilters.requiredTags && hardFilters.requiredTags.length > 0);

    if (hasFilters) {
      filteredDestinations = destinations.filter((d: Destination) => {
        // 必须包含所有 requiredGeoTags
        if (hardFilters.requiredGeoTags && hardFilters.requiredGeoTags.length > 0) {
          const geoTags = d.geoTags || [];
          if (!hardFilters.requiredGeoTags.every(tag => geoTags.includes(tag as any))) {
            return false;
          }
        }

        // 不能包含任何 excludedGeoTags
        if (hardFilters.excludedGeoTags && hardFilters.excludedGeoTags.length > 0) {
          const geoTags = d.geoTags || [];
          if (hardFilters.excludedGeoTags.some(tag => geoTags.includes(tag as any))) {
            return false;
          }
        }

        // 月费用不超过预算上限
        if (hardFilters.budgetMax) {
          if (d.monthlyCost.budget > hardFilters.budgetMax) {
            return false;
          }
        }

        // 必须包含至少一个 requiredTag
        if (hardFilters.requiredTags && hardFilters.requiredTags.length > 0) {
          if (!hardFilters.requiredTags.some(tag => d.healingTags.includes(tag))) {
            return false;
          }
        }

        return true;
      });

      // 如果过滤后为空，返回空结果+提示，不静默回退全量
      if (filteredDestinations.length === 0) {
        return Response.json({
          matches: [],
          noMatchReason: 'No destinations match your current filters. Try adjusting your budget or location requirements.',
        });
      }
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
      filteredByGeoTags: hardFilters.requiredGeoTags && hardFilters.requiredGeoTags.length > 0 
        ? hardFilters.requiredGeoTags 
        : undefined,
    });
  } catch (error) {
    console.error('[api/dna-match] Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
