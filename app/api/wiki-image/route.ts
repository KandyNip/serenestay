// Wikipedia image API - fetches thumbnail images from Wikipedia REST API
// Memory cache for 24 hours to avoid repeated API calls

interface CacheEntry {
  url: string | null;
  timestamp: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const imageCache = new Map<string, CacheEntry>();

function getCached(title: string): string | null | undefined {
  const entry = imageCache.get(title);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    imageCache.delete(title);
    return undefined;
  }
  return entry.url;
}

function setCache(title: string, url: string | null) {
  imageCache.set(title, { url, timestamp: Date.now() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return Response.json({ url: null }, { status: 400 });
  }

  // Check cache first
  const cached = getCached(title);
  if (cached !== undefined) {
    return Response.json({ url: cached });
  }

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          'User-Agent': 'SereneStay/1.0 (https://serenestay.ai)',
        },
      }
    );

    if (!response.ok) {
      setCache(title, null);
      return Response.json({ url: null });
    }

    const data = await response.json();
    const thumbnail = data.thumbnail;

    if (!thumbnail || !thumbnail.source) {
      setCache(title, null);
      return Response.json({ url: null });
    }

    // Check width >= 200
    if (thumbnail.width < 200) {
      setCache(title, null);
      return Response.json({ url: null });
    }

    // Replace with 600px high-res version
    const hdUrl = thumbnail.source.replace(/\/(\d+)px-/, '/600px-');
    setCache(title, hdUrl);

    return Response.json({ url: hdUrl });
  } catch (error) {
    console.error('[api/wiki-image] Error:', error);
    setCache(title, null);
    return Response.json({ url: null });
  }
}
