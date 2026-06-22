import { createChatCompletion } from '../../../lib/deepseek';
import { buildInsightsMessages } from '../../../lib/prompts';
import { getDestinationBySlug } from '@/lib/destinations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;
    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });

    const destination = await getDestinationBySlug(slug);
    if (!destination) return Response.json({ error: 'Destination not found' }, { status: 404 });

    const messages = buildInsightsMessages(destination);
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 500 });

    const content = await createChatCompletion(messages, { apiKey });
    return Response.json({ insights: content });
  } catch (error) {
    console.error('[api/insights] Error:', error);
    return Response.json({ error: 'Failed to generate insights' }, { status: 500 });
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
