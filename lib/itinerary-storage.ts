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
  // Phase-based fields for preventing repetition
  phase: number; // 1, 2, 3, etc.
  dayRange: string; // e.g., "1-7", "8-14"
  totalTripDays: number; // Total days of the trip (e.g., 30)
  plannedDaysSummary: string; // Summary of what was planned in this phase
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
  // 同slug+phase+focus视为同一条，覆盖更新
  const idx = list.findIndex(
    i => i.slug === itinerary.slug && i.phase === itinerary.phase && i.focus === itinerary.focus
  );
  if (idx >= 0) {
    list[idx] = itinerary;
  } else {
    list.unshift(itinerary); // 新的放最前面
  }
  localStorage.setItem(ITINERARIES_KEY, JSON.stringify(list));
  return list;
}

export function removeItinerary(slug: string, phase: number, focus: string): SavedItinerary[] {
  const list = getSavedItineraries().filter(
    i => !(i.slug === slug && i.phase === phase && i.focus === focus)
  );
  localStorage.setItem(ITINERARIES_KEY, JSON.stringify(list));
  return list;
}

export function isItinerarySaved(slug: string, phase: number, focus: string): boolean {
  return getSavedItineraries().some(
    i => i.slug === slug && i.phase === phase && i.focus === focus
  );
}

export function clearItineraries(): void {
  localStorage.removeItem(ITINERARIES_KEY);
}

// Get all planned phases for a destination
export function getPlannedPhasesForDestination(slug: string): SavedItinerary[] {
  return getSavedItineraries().filter(i => i.slug === slug);
}

// Get the next phase number for a destination
export function getNextPhaseForDestination(slug: string): number {
  const phases = getPlannedPhasesForDestination(slug);
  if (phases.length === 0) return 1;
  const maxPhase = Math.max(...phases.map(p => p.phase));
  return maxPhase + 1;
}

// Generate a summary of planned phases for the AI prompt
export function generatePlannedPhasesSummary(slug: string): string {
  const phases = getPlannedPhasesForDestination(slug);
  if (phases.length === 0) return '';

  const summaries = phases.map(p => {
    return `Phase ${p.phase} (Days ${p.dayRange || 'N/A'}): ${p.plannedDaysSummary || 'No summary available'}`;
  });

  return `Previously planned phases for this destination:\n${summaries.join('\n')}\n\nPlease avoid repeating these activities and locations in the new phase.`;
}

// ============================================================
// Day-by-Day Itinerary Storage (new format)
// ============================================================

const DAYBYDAY_KEY = 'serenestay_daybyday_itineraries';

import type { DayContent } from '@/components/ItineraryDayCard';

// Content format: DayContent (structured with sections)
// Legacy formats (string, DayContentData) still supported at runtime for backward compatibility
export interface SavedDaySummary {
  dayNumber: number;
  title: string;
  content: DayContent;
  moodChips: string[];
}

export interface SavedDayByDayItinerary {
  id: string; // unique ID for this trip
  slug: string;
  destinationName: string;
  totalDays: number;
  focus: string;
  days: SavedDaySummary[];
  savedAt: string;
}

export function getSavedDayByDayItineraries(): SavedDayByDayItinerary[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DAYBYDAY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveDayByDayItinerary(itinerary: SavedDayByDayItinerary): SavedDayByDayItinerary[] {
  const list = getSavedDayByDayItineraries();
  // Same id = overwrite
  const idx = list.findIndex(i => i.id === itinerary.id);
  if (idx >= 0) {
    list[idx] = itinerary;
  } else {
    list.unshift(itinerary);
  }
  localStorage.setItem(DAYBYDAY_KEY, JSON.stringify(list));
  return list;
}

export function removeDayByDayItinerary(id: string): SavedDayByDayItinerary[] {
  const list = getSavedDayByDayItineraries().filter(i => i.id !== id);
  localStorage.setItem(DAYBYDAY_KEY, JSON.stringify(list));
  return list;
}

export function getDayByDayForDestination(slug: string): SavedDayByDayItinerary[] {
  return getSavedDayByDayItineraries().filter(i => i.slug === slug);
}

// ============================================================
// Healing Journey Storage
// ============================================================

const HEALING_JOURNEYS_KEY = 'serenestay_healing_journeys';

import type { HealingDayContent, UserState, UserIntention } from '@/lib/healing-types';

export interface SavedHealingJourneyDay {
  dayNumber: number;
  title: string;
  content: HealingDayContent;
}

export interface SavedHealingJourney {
  id: string;
  slug: string;
  destinationName: string;
  currentState: UserState;
  intentions: UserIntention[];
  totalDays: number;
  days: SavedHealingJourneyDay[];
  savedAt: string;
}

export function getSavedHealingJourneys(): SavedHealingJourney[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HEALING_JOURNEYS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveHealingJourney(journey: SavedHealingJourney): SavedHealingJourney[] {
  const list = getSavedHealingJourneys();
  const idx = list.findIndex(i => i.id === journey.id);
  if (idx >= 0) {
    list[idx] = journey;
  } else {
    list.unshift(journey);
  }
  localStorage.setItem(HEALING_JOURNEYS_KEY, JSON.stringify(list));
  return list;
}

export function removeHealingJourney(id: string): SavedHealingJourney[] {
  const list = getSavedHealingJourneys().filter(i => i.id !== id);
  localStorage.setItem(HEALING_JOURNEYS_KEY, JSON.stringify(list));
  return list;
}

export function getHealingJourneysForDestination(slug: string): SavedHealingJourney[] {
  return getSavedHealingJourneys().filter(i => i.slug === slug);
}
