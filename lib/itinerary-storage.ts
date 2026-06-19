const ITINERARIES_KEY = 'serenestay_saved_itineraries';

export interface SavedItinerary {
  slug: string;
  name: string;
  duration: number;
  focus: string;
  savedAt: string; // ISO时间
  parsed: any; // 完整parsed数据
  overview?: string;
  coverImage?: string;
}

export function getSavedItineraries(): SavedItinerary[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(ITINERARIES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveItinerary(itinerary: SavedItinerary): SavedItinerary[] {
  const list = getSavedItineraries();
  // 同slug+duration+focus视为同一条，覆盖更新
  const idx = list.findIndex(
    i => i.slug === itinerary.slug && i.duration === itinerary.duration && i.focus === itinerary.focus
  );
  if (idx >= 0) {
    list[idx] = itinerary;
  } else {
    list.unshift(itinerary); // 新的放最前面
  }
  localStorage.setItem(ITINERARIES_KEY, JSON.stringify(list));
  return list;
}

export function removeItinerary(slug: string, duration: number, focus: string): SavedItinerary[] {
  const list = getSavedItineraries().filter(
    i => !(i.slug === slug && i.duration === duration && i.focus === focus)
  );
  localStorage.setItem(ITINERARIES_KEY, JSON.stringify(list));
  return list;
}

export function isItinerarySaved(slug: string, duration: number, focus: string): boolean {
  return getSavedItineraries().some(
    i => i.slug === slug && i.duration === duration && i.focus === focus
  );
}

export function clearItineraries(): void {
  localStorage.removeItem(ITINERARIES_KEY);
}
