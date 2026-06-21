// Day-by-day itinerary session management
// Tracks state for multi-step itinerary generation flow

export interface DaySummary {
  dayNumber: number;
  title: string;
  activities: string[];
  mood: string[];
}

export interface ItinerarySession {
  slug: string;
  destinationName: string;
  focus: string;
  daysGenerated: DaySummary[];
  currentDay: number;
  createdAt: string;
}

const SESSION_KEY = 'serenestay_itinerary_session';

export function getSession(): ItinerarySession | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: ItinerarySession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save itinerary session:', error);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear itinerary session:', error);
  }
}

export function initSession(
  slug: string,
  destinationName: string,
  focus: string
): ItinerarySession {
  const session: ItinerarySession = {
    slug,
    destinationName,
    focus,
    daysGenerated: [],
    currentDay: 1,
    createdAt: new Date().toISOString(),
  };
  saveSession(session);
  return session;
}

export function addDayToSession(
  session: ItinerarySession,
  daySummary: DaySummary
): ItinerarySession {
  const updated: ItinerarySession = {
    ...session,
    daysGenerated: [...session.daysGenerated, daySummary],
    currentDay: session.currentDay + 1,
  };
  saveSession(updated);
  return updated;
}

export function getPreviousDaysContext(session: ItinerarySession): string {
  if (session.daysGenerated.length === 0) return '';

  return session.daysGenerated
    .map((day) => {
      const activities = day.activities.join(', ');
      return `Day ${day.dayNumber} (${day.title}): ${activities}`;
    })
    .join('\n');
}
