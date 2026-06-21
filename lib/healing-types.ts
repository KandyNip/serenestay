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

export type CheckinFeeling = 'calm' | 'neutral' | 'energized' | 'flowing' | 'sparkling';

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
  { id: 'evening-winddown', label: 'Evening Wind-Down', emoji: '🌙', borderColor: 'border-secondary/40' },
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

// ─── Checkin Feeling Constants ───

export interface CheckinFeelingOption {
  id: CheckinFeeling;
  label: string;
  emoji: string;
  description: string;
}

export const CHECKIN_FEELINGS: CheckinFeelingOption[] = [
  { id: 'calm', label: 'Calm', emoji: '🌊', description: 'At peace, settled, relaxed' },
  { id: 'neutral', label: 'Neutral', emoji: '🍃', description: 'Balanced, neither up nor down' },
  { id: 'energized', label: 'Energized', emoji: '☀️', description: 'Vital, awake, ready for more' },
  { id: 'flowing', label: 'Flowing', emoji: '🌿', description: 'Moving gently, in rhythm' },
  { id: 'sparkling', label: 'Sparkling', emoji: '✨', description: 'Bright, uplifted, joyful' },
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
  title: string; // activity title
  energyLevel: 'gentle' | 'moderate' | 'deep';
  intention: UserIntention; // primary intention this activity serves
  whyNote: string; // 1-2 sentences on why this activity fits the user's state/intention
  venue?: string; // where this takes place
  isIntegrationTime?: boolean; // special "Protected Space" rendering
}

export interface HealingDayContent {
  dayNumber: number;
  journeyPhase: JourneyPhase;
  phaseTitle: string; // e.g. "Arrival — Day 1"
  title: string;
  summary: string;
  energyBlocks: EnergyBlock[];
  reflection: string; // end-of-day reflection prompt
  returnTransition?: string[]; // 3 return transition suggestions (integration phase only)
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
 * Determine journey phase based on experience portrait (intention coverage).
 * Portrait-driven: phase transitions happen based on how many intentions are covered.
 * - All intentions covered → integration
 * - ≥50% covered or day ≥ 3 → deepening
 * - Otherwise → arrival
 */
export function computeJourneyPhase(
  dayNumber: number,
  portrait?: { coveredIntentions: UserIntention[]; uncoveredIntentions: UserIntention[] }
): JourneyPhase {
  if (portrait) {
    const totalIntentions = portrait.coveredIntentions.length + portrait.uncoveredIntentions.length;
    const allCovered = portrait.uncoveredIntentions.length === 0 && totalIntentions > 0;
    const majorityCovered = totalIntentions > 0 && portrait.coveredIntentions.length >= totalIntentions / 2;

    if (allCovered) return 'integration';
    if (majorityCovered || dayNumber >= 3) return 'deepening';
    return 'arrival';
  }
  // Fallback for backward compat (no portrait provided)
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
