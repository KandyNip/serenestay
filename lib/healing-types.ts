// lib/healing-types.ts — Type definitions and constants for the Healing Journey system

import type { DayContent } from '@/components/ItineraryDayCard';

// ─── Core Types ───

export type UserState =
  | 'exhausted'
  | 'restless'
  | 'numb'
  | 'curious'
  | 'open'
  | 'anxious';

export type UserIntention =
  | 'grounding'
  | 'release'
  | 'connection'
  | 'stillness'
  | 'joy'
  | 'clarity';

export type JourneyPhase = 'arrival' | 'deepening' | 'integration';

export type EnergyLevel = 'gentle' | 'moderate' | 'deep' | 'integration';

export type CheckinFeeling = 'better' | 'same' | 'worse' | 'mixed';

// ─── Energy Slots ───

export interface EnergySlot {
  id: string;
  label: string;
  emoji: string;
  borderColor: string; // tailwind border color class
}

export const ENERGY_SLOTS: EnergySlot[] = [
  { id: 'morning-opening', label: 'Morning Opening', emoji: '🌅', borderColor: 'border-emerald-400' },
  { id: 'mid-morning-practice', label: 'Core Practice', emoji: '🧘', borderColor: 'border-amber-400' },
  { id: 'integration', label: 'Integration', emoji: '🌿', borderColor: 'border-amber-300' },
  { id: 'afternoon-exploration', label: 'Afternoon', emoji: '☀️', borderColor: 'border-sky-400' },
  { id: 'evening-winddown', label: 'Evening Wind-Down', emoji: '🌙', borderColor: 'border-violet-400' },
];

// ─── User State Constants ───

export interface UserStateOption {
  id: UserState;
  label: string;
  emoji: string;
  description: string;
}

export const USER_STATES: UserStateOption[] = [
  { id: 'exhausted', label: 'Exhausted', emoji: '😮‍💨', description: 'Burnt out, depleted, need rest' },
  { id: 'restless', label: 'Restless', emoji: '💨', description: 'Agitated, can\'t settle, seeking movement' },
  { id: 'numb', label: 'Numb', emoji: '🌫️', description: 'Disconnected, flat, lost the spark' },
  { id: 'curious', label: 'Curious', emoji: '🌱', description: 'Open to explore, gently seeking' },
  { id: 'open', label: 'Open', emoji: '✨', description: 'Ready to receive, feeling expansive' },
  { id: 'anxious', label: 'Anxious', emoji: '🌀', description: 'Worried, tight, need grounding' },
];

// ─── User Intention Constants ───

export interface UserIntentionOption {
  id: UserIntention;
  label: string;
  emoji: string;
  description: string;
}

export const USER_INTENTIONS: UserIntentionOption[] = [
  { id: 'grounding', label: 'Grounding', emoji: '🌍', description: 'Feel rooted, stable, present in the body' },
  { id: 'release', label: 'Release', emoji: '🌊', description: 'Let go of tension, emotions, old patterns' },
  { id: 'connection', label: 'Connection', emoji: '🤝', description: 'Connect with self, others, or something larger' },
  { id: 'stillness', label: 'Stillness', emoji: '🧘', description: 'Find inner quiet, peace, spaciousness' },
  { id: 'joy', label: 'Joy', emoji: '🌸', description: 'Rekindle delight, playfulness, lightness' },
  { id: 'clarity', label: 'Clarity', emoji: '💎', description: 'See clearly, gain insight, find direction' },
];

// ─── Activity & Energy Block Types ───

export interface ActivityRecord {
  name: string;
  description: string;
  duration?: string;
  cost?: string;
  imageTags?: string[];
  intentionTags: UserIntention[];
}

export interface EnergyBlock {
  slot: string; // matches EnergySlot.id
  whyNote: string; // 1-2 sentences on why this activity fits the user's state/intention
  activities: ActivityRecord[];
}

export interface HealingDayContent {
  title: string;
  summary: string;
  energyBlocks: EnergyBlock[];
  reflection: string; // end-of-day reflection prompt
  note: string; // disclaimer
}

// ─── Experience Portrait ───

export interface ExperiencePortrait {
  coveredIntentions: UserIntention[];
  uncoveredIntentions: UserIntention[];
  daysGenerated: number;
}

// ─── Healing Journey Session ───

export interface HealingDaySummary {
  dayNumber: number;
  title: string;
  activities: string[];
  intentions: UserIntention[];
  checkinFeeling?: CheckinFeeling;
  checkinNote?: string;
}

export interface HealingJourneySession {
  slug: string;
  destinationName: string;
  currentState: UserState;
  intentions: UserIntention[];
  daysGenerated: HealingDaySummary[];
  currentDay: number;
  chatContext: string; // accumulated check-in notes
  createdAt: string;
}

// ─── Helper Functions ───

/**
 * Determine journey phase based on day number.
 * Days 1-2: arrival (gentle, grounding)
 * Days 3-5: deepening (core work, going deeper)
 * Days 6+: integration (synthesis, preparing to return)
 */
export function computeJourneyPhase(dayNumber: number): JourneyPhase {
  if (dayNumber <= 2) return 'arrival';
  if (dayNumber <= 5) return 'deepening';
  return 'integration';
}

/**
 * Compute the experience portrait — which intentions have been addressed.
 */
export function computeExperiencePortrait(
  intentions: UserIntention[],
  daysGenerated: HealingDaySummary[]
): ExperiencePortrait {
  const covered = new Set<UserIntention>();

  for (const day of daysGenerated) {
    for (const intention of day.intentions) {
      covered.add(intention);
    }
  }

  const coveredIntentions = intentions.filter(i => covered.has(i));
  const uncoveredIntentions = intentions.filter(i => !covered.has(i));

  return {
    coveredIntentions,
    uncoveredIntentions,
    daysGenerated: daysGenerated.length,
  };
}
