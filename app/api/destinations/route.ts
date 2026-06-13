// app/api/destinations/route.ts — Destinations listing endpoint
//
// Usage:
//   GET /api/destinations?region=Southeast%20Asia&tag=yoga&sort=serenity
//
// Response:
//   { destinations: [...], total: 56 }

import {
  loadDestinations,
  getDestinationsByRegion,
  getDestinationsByTag,
} from '../../../lib/destinations';
import type { Destination, DestinationScores } from '../../../lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') as keyof DestinationScores | null;
    const order = (searchParams.get('order') as 'asc' | 'desc') ?? 'desc';

    let destinations: Destination[];

    // Apply filters (composable)
    if (region) {
      destinations = await getDestinationsByRegion(region);
    } else if (tag) {
      destinations = await getDestinationsByTag(tag);
    } else {
      destinations = await loadDestinations();
    }

    // Apply sorting (sort the already-filtered array, don't reload all data)
    if (sort && sort in (destinations[0]?.scores ?? {})) {
      destinations = [...destinations].sort((a, b) => {
        const diff = (a.scores[sort] as number) - (b.scores[sort] as number);
        return order === 'desc' ? -diff : diff;
      });
    }

    return Response.json(
      { destinations, total: destinations.length },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    );
  } catch (error) {
    console.error('[api/destinations] Error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to load destinations' } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  });
}
