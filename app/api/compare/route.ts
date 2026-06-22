import { createChatCompletion } from '../../../lib/deepseek';
import { buildComparisonMessages } from '../../../lib/prompts';
import { loadDestinations } from '@/lib/destinations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slugs, userContext } = body;
    if (!Array.isArray(slugs) || slugs.length < 2 || slugs.length > 4) {
      return Response.json({ error: '2-4 destination slugs required' }, { status: 400 });
    }

    const allDestinations = await loadDestinations();
    const messages = buildComparisonMessages(slugs, allDestinations, userContext);
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 500 });

    const content = await createChatCompletion(messages, { apiKey });
    return Response.json({ comparison: content });
  } catch (error) {
    console.error('[api/compare] Error:', error);
    return Response.json({ error: 'Failed to generate comparison' }, { status: 500 });
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
