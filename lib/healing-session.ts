// lib/healing-session.ts — Session management for the Healing Journey system

import type {
  HealingJourneySession,
  HealingDaySummary,
  UserState,
  UserIntention,
  ExperiencePortrait,
} from './healing-types';
import { computeExperiencePortrait } from './healing-types';

const SESSION_KEY = 'serenestay_itinerary_session';

export function getHealingSession(): HealingJourneySession | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveHealingSession(session: HealingJourneySession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save healing session:', error);
  }
}

export function clearHealingSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear healing session:', error);
  }
}

export function initHealingSession(
  slug: string,
  destinationName: string,
  currentState: UserState,
  intentions: UserIntention[],
  chatContext: string = ''
): HealingJourneySession {
  const session: HealingJourneySession = {
    slug,
    destinationName,
    currentState,
    intentions,
    daysGenerated: [],
    currentDay: 1,
    chatContext,
    createdAt: new Date().toISOString(),
  };
  saveHealingSession(session);
  return session;
}

export function addDayToHealingSession(
  session: HealingJourneySession,
  daySummary: HealingDaySummary
): HealingJourneySession {
  const updated: HealingJourneySession = {
    ...session,
    daysGenerated: [...session.daysGenerated, daySummary],
    currentDay: session.currentDay + 1,
  };
  saveHealingSession(updated);
  return updated;
}

/**
 * Build a context string summarizing previous days for the AI prompt.
 */
export function getHealingPreviousDaysContext(session: HealingJourneySession): string {
  if (session.daysGenerated.length === 0) return '';

  return session.daysGenerated
    .map((day) => {
      const activities = day.activities.join(', ');
      const intentions = day.intentions.join(', ');
      const checkin = day.checkinFeeling ? ` | Check-in: ${day.checkinFeeling}${day.checkinNote ? ` — ${day.checkinNote}` : ''}` : '';
      return `Day ${day.dayNumber} (${day.title}): [${intentions}] ${activities}${checkin}`;
    })
    .join('\n');
}

/**
 * Get the experience portrait from the current session.
 */
export function getHealingExperiencePortrait(session: HealingJourneySession): ExperiencePortrait {
  return computeExperiencePortrait(session.intentions, session.daysGenerated);
}
