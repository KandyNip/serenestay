import { cookies } from 'next/headers';

const FAVORITES_COOKIE = 'serenestay_favorites';

export async function getFavorites(_supabase?: unknown): Promise<Set<string>> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(FAVORITES_COOKIE)?.value;
    if (!raw) return new Set();
    const slugs: string[] = JSON.parse(decodeURIComponent(raw));
    return new Set(Array.isArray(slugs) ? slugs : []);
  } catch {
    return new Set();
  }
}
