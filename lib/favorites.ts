const FAVORITES_KEY = 'serenestay_favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addFavorite(slug: string): string[] {
  const favs = getFavorites();
  if (!favs.includes(slug)) {
    favs.push(slug);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }
  return favs;
}

export function removeFavorite(slug: string): string[] {
  const favs = getFavorites().filter(s => s !== slug);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs;
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}

export function clearFavorites(): void {
  localStorage.removeItem(FAVORITES_KEY);
}
