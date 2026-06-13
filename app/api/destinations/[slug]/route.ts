// app/api/destinations/[slug]/route.ts — Single destination endpoint
//
// Usage:
//   GET /api/destinations/chiang-mai
//
// Response:
//   { destination: {...} } or 404

import { getDestinationBySlug, hasHardVeto } from '../../../../lib/destinations';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;
    const destination = await getDestinationBySlug(slug);

    if (!destination) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: `Destination "${slug}" not found` } },
        { status: 404 }
      );
    }

    // Check for hard veto conditions
    const veto = hasHardVeto(destination);

    return Response.json(
      {
        destination,
        warnings: veto.reasons.length > 0 ? veto.reasons : undefined,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    );
  } catch (error) {
    console.error('[api/destinations/[slug]] Error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to load destination' } },
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
