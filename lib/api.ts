import { Destination, Message, UserPreferences, MatchResult } from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === 'undefined'
    ? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : ''
    : typeof window !== 'undefined'
      ? (() => {
          const host = window.location.hostname;
          return `${window.location.protocol}//${host}`;
        })()
      : '');

/**
 * Fetch all destinations with optional filters
 */
export async function fetchDestinations(params?: {
  region?: string;
  tag?: string;
  sort?: 'name' | 'serenity' | 'affordability' | 'wellness';
}): Promise<{ destinations: Destination[]; total: number }> {
  const searchParams = new URLSearchParams();
  
  if (params?.region) searchParams.set('region', params.region);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.sort) searchParams.set('sort', params.sort);
  
  const queryString = searchParams.toString();
  const url = `${API_BASE}/api/destinations${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      revalidate: 3600, // Revalidate every hour
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch destinations: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch a single destination by slug
 * Backend returns: { destination: Destination, warnings?: string[] }
 */
export async function fetchDestination(slug: string): Promise<{ destination: Destination; warnings?: string[] }> {
  const response = await fetch(`${API_BASE}/api/destinations/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Destination not found');
    }
    throw new Error(`Failed to fetch destination: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get AI-powered destination matches
 * Backend returns: { matches: Destination[], scores: [{slug, matchScore}], reasoning: string, followUpQuestions: string[] }
 */
export async function fetchMatch(
  preferences: UserPreferences,
  chatHistory?: Message[]
): Promise<{ matches: Destination[]; scores: Array<{ slug: string; matchScore: number }>; reasoning: string; followUpQuestions: string[] }> {
  const response = await fetch(`${API_BASE}/api/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      preferences,
      chatHistory,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get matches: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Stream chat messages with SSE
 */
export async function streamChat(
  messages: Message[],
  onChunk: (chunk: string) => void,
  onDone: (done: boolean) => void,
  isProUser?: boolean
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      stream: true,
      isProUser,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Chat error: ${response.status}`);
  }
  
  if (!response.body) {
    throw new Error('No response body');
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onDone(true);
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            onDone(true);
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Check if user has Pro status (simple localStorage check)
 */
export function checkProStatus(): boolean {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem('serenestay_pro');
  return stored === 'true';
}

/**
 * Set Pro status
 */
export function setProStatus(isPro: boolean): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('serenestay_pro', isPro.toString());
}

/**
 * Get remaining free matches
 */
export function getRemainingMatches(): number {
  if (typeof window === 'undefined') return 2;
  
  const used = parseInt(localStorage.getItem('serenestay_matches_used') || '0', 10);
  return Math.max(0, 2 - used);
}

/**
 * Increment match count
 */
export function incrementMatchCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const used = parseInt(localStorage.getItem('serenestay_matches_used') || '0', 10);
  const newCount = used + 1;
  localStorage.setItem('serenestay_matches_used', newCount.toString());
  return newCount;
}
