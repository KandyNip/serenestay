'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import StateChips from './StateChips';
import IntentionChips from './IntentionChips';
import ItineraryDayCard, { type HealingDayContent } from './ItineraryDayCard';
import JourneyArc from './JourneyArc';
import ExperiencePortrait from './ExperiencePortrait';
import DailyCheckin from './DailyCheckin';
import ReturnGuide from './ReturnGuide';
import type {
  UserState,
  UserIntention,
  JourneyPhase,
  CheckinFeeling,
  HealingJourneySession,
  HealingDaySummary,
  ExperiencePortrait as ExperiencePortraitType,
} from '@/lib/healing-types';
import { computeJourneyPhase } from '@/lib/healing-types';
import {
  getHealingSession,
  saveHealingSession,
  clearHealingSession,
  initHealingSession,
  addDayToHealingSession,
  getHealingPreviousDaysContext,
  getHealingExperiencePortrait,
} from '@/lib/healing-session';
import { saveHealingJourney } from '@/lib/itinerary-storage';
import type { Destination } from '@/lib/types';

interface ItineraryFlowProps {
  destination: Destination;
  initialFocus?: string;
  proToken?: string;
}

interface DayData {
  dayNumber: number;
  title: string;
  content: HealingDayContent;
}

type FlowStep = 'welcome' | 'setup' | 'generating' | 'result' | 'checkin' | 'complete';

export default function ItineraryFlow({ destination, proToken }: ItineraryFlowProps) {
  const [step, setStep] = useState<FlowStep>('welcome');
  const [currentState, setCurrentState] = useState<UserState | null>(null);
  const [intentions, setIntentions] = useState<UserIntention[]>([]);
  const [session, setSession] = useState<HealingJourneySession | null>(null);
  const [days, setDays] = useState<DayData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [chatNote, setChatNote] = useState('');
  // Check-in step state: intentions for next day + free-text note
  const [checkinIntentions, setCheckinIntentions] = useState<UserIntention[]>([]);
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinFeeling, setCheckinFeeling] = useState<CheckinFeeling | null>(null);
  const [checkinFeelingNote, setCheckinFeelingNote] = useState('');
  const [generatingDayNumber, setGeneratingDayNumber] = useState<number>(1);
  const [isFinalDayGeneration, setIsFinalDayGeneration] = useState(false);

  // Clear session on mount — fresh start each time
  useEffect(() => {
    clearHealingSession();
  }, [destination.slug]);

  const getProToken = (): string => {
    return proToken || (typeof window !== 'undefined' ? localStorage.getItem('serenestay_pro_token') || '' : '');
  };

  const handleBeginJourney = () => {
    setStep('setup');
  };

  const handleSetupComplete = () => {
    if (!currentState || intentions.length === 0) return;

    const newSession = initHealingSession(
      destination.slug,
      destination.name,
      currentState,
      intentions,
      chatNote || undefined,
    );
    setSession(newSession);
    setDays([]);
    setChatNote('');
    generateDay(1, newSession);
  };

  const generateDay = useCallback(async (dayNumber: number, currentSession: HealingJourneySession) => {
    setIsGenerating(true);
    setGeneratingDayNumber(dayNumber);
    setError(null);
    setStep('generating');

    try {
      const token = getProToken();
      const prevContext = getHealingPreviousDaysContext(currentSession);
      const portrait = getHealingExperiencePortrait(currentSession);
      const phase = computeJourneyPhase(dayNumber, portrait, currentSession.chatContext || undefined);

      const response = await fetch('/api/itinerary-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: destination.slug,
          proToken: token,
          dayNumber,
          currentState: currentSession.currentState,
          intentions: currentSession.intentions,
          journeyPhase: phase,
          experiencePortrait: portrait,
          previousDaysContext: prevContext,
          chatContext: currentSession.chatContext || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate day');
      }

      const data = await response.json();
      const format: string = data.format || 'markdown';

      if (format === 'healing-json' && typeof data.dayContent === 'object' && data.dayContent !== null) {
        const healingContent: HealingDayContent = data.dayContent;
        const title = healingContent.title || `Day ${dayNumber}`;

        const dayData: DayData = {
          dayNumber,
          title,
          content: healingContent,
        };

        // Update days array
        setDays(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(d => d.dayNumber === dayNumber);
          if (idx >= 0) {
            updated[idx] = dayData;
          } else {
            updated.push(dayData);
          }
          return updated.sort((a, b) => a.dayNumber - b.dayNumber);
        });

        // Extract intentions covered from energy blocks (new structure: one block = one activity with .intention)
        const coveredIntentions = new Set<UserIntention>();
        for (const block of healingContent.energyBlocks) {
          if (block.intention && currentSession.intentions.includes(block.intention as UserIntention)) {
            coveredIntentions.add(block.intention as UserIntention);
          }
        }

        // Update session with day summary
        const daySummary: HealingDaySummary = {
          dayNumber,
          title,
          activities: healingContent.energyBlocks.map(b => b.title),
          intentions: Array.from(coveredIntentions),
        };
        const updatedSession = addDayToHealingSession(currentSession, daySummary);
        setSession(updatedSession);
        saveHealingSession(updatedSession);

        // Expand the newly generated day
        setExpandedDays(prev => new Set([...prev, dayNumber]));

        // Pre-fill check-in intentions with uncovered intentions for Day 2+ (Fix 9)
        const updatedPortrait = getHealingExperiencePortrait(updatedSession);
        setCheckinIntentions(updatedPortrait.uncoveredIntentions);
        setCheckinNote('');
        setCheckinFeeling(null);
        setCheckinFeelingNote('');

        // Round 5 Fix 2: If this is the final "going home" day, skip to complete
        if (isFinalDayGeneration) {
          setIsFinalDayGeneration(false);
          setStep('complete');
        } else {
          // Go to checkin step
          setStep('checkin');
        }
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('[ItineraryFlow] Error generating day:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate day');
      setStep('result');
    } finally {
      setIsGenerating(false);
    }
  }, [destination.slug]);

  // Expanded check-in handler: collects feeling + intentions + note, then generates next day
  const handleCheckinFeeling = (feeling: CheckinFeeling, note?: string) => {
    setCheckinFeeling(feeling);
    setCheckinFeelingNote(note || '');
  };

  const handleShapeToday = () => {
    if (!session || !checkinFeeling) return;

    // Build check-in context for the next day's prompt
    const feelingText = `Day ${session.daysGenerated.length} check-in: Feeling ${checkinFeeling}${checkinFeelingNote ? ` — ${checkinFeelingNote}` : ''}`;
    const intentionText = checkinIntentions.length > 0
      ? `Intentions for next day: ${checkinIntentions.join(', ')}`
      : '';
    const freeText = checkinNote.trim() ? `Notes: ${checkinNote.trim()}` : '';
    const newContextParts = [feelingText, intentionText, freeText].filter(Boolean);
    const newContext = newContextParts.join('\n');

    const updatedChatContext = session.chatContext
      ? session.chatContext + '\n' + newContext
      : newContext;

    // Merge check-in intentions into session intentions (expand if new ones selected)
    const mergedIntentions = Array.from(new Set([...session.intentions, ...checkinIntentions])) as UserIntention[];

    const updatedSession: HealingJourneySession = {
      ...session,
      intentions: mergedIntentions,
      chatContext: updatedChatContext,
      currentDay: session.currentDay,
      daysGenerated: session.daysGenerated.map((d, i) =>
        i === session.daysGenerated.length - 1
          ? { ...d, checkinFeeling, checkinNote: checkinFeelingNote || undefined }
          : d
      ),
    };

    setSession(updatedSession);
    saveHealingSession(updatedSession);

    // Generate next day
    generateDay(updatedSession.daysGenerated.length + 1, updatedSession);
  };

  const handleRegenerateDay = (dayNumber: number) => {
    if (!session) return;
    generateDay(dayNumber, session);
  };

  const handleCompleteJourney = () => {
    setStep('complete');
  };

  // Round 5 Fix 2: Generate integration day before completing
  const handleCompleteAndReturnHome = () => {
    if (!session) return;

    // Add "going home" signal to chatContext to trigger integration phase
    const homeSignal = 'User is preparing to go home. This is the final day of the journey.';
    const updatedChatContext = session.chatContext
      ? session.chatContext + '\n' + homeSignal
      : homeSignal;

    const updatedSession: HealingJourneySession = {
      ...session,
      chatContext: updatedChatContext,
    };

    setSession(updatedSession);
    saveHealingSession(updatedSession);

    // Set flag to skip to complete after generation
    setIsFinalDayGeneration(true);

    // Generate the final integration day
    const finalDayNumber = updatedSession.daysGenerated.length + 1;
    generateDay(finalDayNumber, updatedSession);
  };

  const handleSaveJourney = () => {
    if (!session || days.length === 0) return;

    saveHealingJourney({
      id: `${destination.slug}-healing-${session.createdAt}`,
      slug: destination.slug,
      destinationName: destination.name,
      currentState: session.currentState,
      intentions: session.intentions,
      totalDays: days.length,
      days: days.map(d => ({
        dayNumber: d.dayNumber,
        title: d.title,
        content: d.content as any,
        returnTransition: d.content.returnTransition,
      })),
      savedAt: new Date().toISOString(),
    });

    alert('Journey saved! You can find it in your Favorites.');
  };

  const handleNewJourney = () => {
    clearHealingSession();
    setSession(null);
    setDays([]);
    setCurrentState(null);
    setIntentions([]);
    setStep('welcome');
    setExpandedDays(new Set());
    setError(null);
  };

  const toggleDayExpand = (dayNumber: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
  };

  const nextDayNumber = session ? session.daysGenerated.length + 1 : 1;
  const currentPortrait: ExperiencePortraitType | null = session ? getHealingExperiencePortrait(session) : null;
  const phase: JourneyPhase = computeJourneyPhase(nextDayNumber, currentPortrait || { coveredIntentions: [], uncoveredIntentions: [], daysGenerated: session?.daysGenerated.length || 0 }, session?.chatContext || undefined);

  // ─── WELCOME STEP ───
  if (step === 'welcome') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-primary/10 p-8 shadow-sm text-center">
          {/* Breathing Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-secondary/20 animate-gentle-pulse" />
              <div className="absolute inset-3 rounded-full bg-secondary/30 animate-gentle-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-6 rounded-full bg-secondary/40 animate-gentle-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🌿</span>
              </div>
            </div>
          </div>

          <h2 className="font-serif text-2xl text-primary mb-2">
            Begin Your Healing Journey
          </h2>
          <p className="text-sm text-primary/60 max-w-sm mx-auto mb-6">
            A personalized, day-by-day companion for your stay in {destination.name}.
            Move at your own pace through arrival, deepening, and integration.
          </p>

          {/* Value Props */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">🎯</span>
              <div>
                <p className="text-sm font-medium text-primary">State-Aware Design</p>
                <p className="text-xs text-primary/60">Activities adapt to how you feel right now — not a generic itinerary</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">🌊</span>
              <div>
                <p className="text-sm font-medium text-primary">Intention-Driven</p>
                <p className="text-xs text-primary/60">Each day serves your healing goals — grounding, release, connection, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">🔄</span>
              <div>
                <p className="text-sm font-medium text-primary">Adaptive Arc</p>
                <p className="text-xs text-primary/60">Your journey evolves through arrival, deepening, and integration phases</p>
              </div>
            </div>
          </div>

          {/* Journey Arc Preview */}
          <div className="mb-6">
            <JourneyArc currentPhase="arrival" />
          </div>

          <button
            onClick={handleBeginJourney}
            className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-lg"
          >
            <Sparkles className="w-5 h-5" />
            Begin Your Journey
          </button>
        </div>
      </div>
    );
  }

  // ─── SETUP STEP ───
  if (step === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
          <h3 className="font-serif text-xl text-primary mb-1">
            How are you arriving?
          </h3>
          <p className="text-sm text-primary/60 mb-4">
            Select the state that feels most like you right now.
          </p>

          <StateChips selected={currentState} onChange={setCurrentState} />
        </div>

        <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
          <h3 className="font-serif text-xl text-primary mb-1">
            What are you seeking?
          </h3>
          <p className="text-sm text-primary/60 mb-4">
            Choose one or more intentions for your journey.
          </p>

          <IntentionChips selected={intentions} onChange={setIntentions} />
        </div>

        {/* Optional note */}
        <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
          <label className="block text-sm font-medium text-primary mb-2">
            Anything you&apos;d like us to know? <span className="text-primary/40 font-normal">(optional)</span>
          </label>
          <textarea
            value={chatNote}
            onChange={(e) => setChatNote(e.target.value)}
            placeholder="e.g. I'm recovering from burnout, or I have a knee injury, or I'm celebrating a milestone..."
            className="w-full px-3 py-2 border border-primary/15 rounded-lg text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-secondary/40 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleSetupComplete}
          disabled={!currentState || intentions.length === 0}
          className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-5 h-5" />
          Start Day 1
        </button>
      </div>
    );
  }

  // ─── GENERATING STEP ───
  if (step === 'generating') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        </div>
        <h3 className="font-serif text-xl text-primary mb-2">
          Crafting Day {generatingDayNumber}...
        </h3>
        <p className="text-primary/60 text-sm">
          Weaving your intentions into a gentle day in {destination.name}
        </p>
        {/* Journey Arc progress */}
        <div className="mt-6">
          <JourneyArc currentPhase={phase} />
        </div>
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ─── CHECKIN STEP (Fix 2, 3, 4: ExperiencePortrait + JourneyArc + expanded check-in) ───
  if (step === 'checkin' && session) {
    const lastDay = days[days.length - 1];
    const checkinPortrait = getHealingExperiencePortrait(session);
    const checkinPhase = computeJourneyPhase(session.daysGenerated.length + 1, checkinPortrait, session.chatContext || undefined);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Journey Arc progress */}
        <div className="bg-white rounded-2xl border border-primary/10 p-4 shadow-sm">
          <JourneyArc currentPhase={checkinPhase} />
        </div>

        {/* Show the just-generated day */}
        {lastDay && (
          <ItineraryDayCard
            dayNumber={lastDay.dayNumber}
            title={lastDay.title}
            content={lastDay.content}
            moodChips={[]}
            isExpanded={true}
            onToggle={() => toggleDayExpand(lastDay.dayNumber)}
            onRegenerate={() => handleRegenerateDay(lastDay.dayNumber)}
            isGenerating={false}
          />
        )}

        {/* Experience Portrait (Fix 2) */}
        <div className="bg-white rounded-2xl border border-primary/10 p-5 shadow-sm">
          <ExperiencePortrait
            intentions={session.intentions}
            coveredIntentions={checkinPortrait.coveredIntentions}
            uncoveredIntentions={checkinPortrait.uncoveredIntentions}
            daysGenerated={checkinPortrait.daysGenerated}
          />
        </div>

        {/* Daily Check-in — feeling */}
        <DailyCheckin
          dayNumber={session.daysGenerated.length}
          onCheckin={handleCheckinFeeling}
        />

        {/* Intention chips for next day — pre-filled with uncovered (Fix 4, 9) */}
        {checkinFeeling && (
          <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg text-primary mb-1">
                Shape Day {session.daysGenerated.length + 1}
              </h3>
              <p className="text-sm text-primary/60 mb-3">
                Adjust your focus for tomorrow, or let your journey guide you.
              </p>
              <IntentionChips selected={checkinIntentions} onChange={setCheckinIntentions} />
            </div>

            {/* Optional free-text note */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Anything else for tomorrow? <span className="text-primary/40 font-normal">(optional)</span>
              </label>
              <textarea
                value={checkinNote}
                onChange={(e) => setCheckinNote(e.target.value)}
                placeholder="e.g. I'd like something gentler tomorrow, or I want to explore the coast..."
                className="w-full px-3 py-2 border border-primary/15 rounded-lg text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-secondary/40 resize-none"
                rows={2}
              />
            </div>

            {/* Shape Today button */}
            <button
              onClick={handleShapeToday}
              className="w-full btn-secondary py-2.5 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Shape Day {session.daysGenerated.length + 1}
            </button>
          </div>
        )}

        {/* Round 5 Fix 1: "Feeling Healed?" card — only show from Day 2 onwards */}
        {session.daysGenerated.length >= 2 && (
          <div className="bg-white rounded-2xl border-2 border-accent/30 p-6 shadow-sm space-y-4">
            <div className="text-center">
              <h3 className="font-serif text-lg text-primary mb-1">
                Feeling Healed?
              </h3>
              <p className="text-sm text-primary/60">
                Ready to carry this peace home with you?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCompleteAndReturnHome}
                className="w-full px-4 py-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-sm font-medium text-primary transition-colors flex items-center justify-center gap-2"
              >
                <span>🌿</span>
                Complete & Return Home
              </button>
              <button
                onClick={handleShapeToday}
                disabled={!checkinFeeling}
                className="w-full px-4 py-3 bg-white hover:bg-primary/5 border border-primary/10 rounded-lg text-sm font-medium text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue Tomorrow
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESULT STEP (fallback / error state) ───
  if (step === 'result') {
    const resultPortrait = session ? getHealingExperiencePortrait(session) : null;
    const resultPhase = resultPortrait
      ? computeJourneyPhase(nextDayNumber, resultPortrait, session?.chatContext || undefined)
      : phase;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Journey Arc progress */}
        <div className="bg-white rounded-2xl border border-primary/10 p-4 shadow-sm">
          <JourneyArc currentPhase={resultPhase} />
        </div>

        {/* Day Cards */}
        <div className="space-y-3">
          {days.map(day => (
            <ItineraryDayCard
              key={day.dayNumber}
              dayNumber={day.dayNumber}
              title={day.title}
              content={day.content}
              moodChips={[]}
              isExpanded={expandedDays.has(day.dayNumber)}
              onToggle={() => toggleDayExpand(day.dayNumber)}
              onRegenerate={() => handleRegenerateDay(day.dayNumber)}
              isGenerating={isGenerating}
            />
          ))}
        </div>

        {/* Action buttons */}
        {!isGenerating && days.length > 0 && (
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={handleSaveJourney}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Save Journey
            </button>
            <button
              onClick={handleCompleteAndReturnHome}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-primary/10 text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              🌿 Complete & Return Home
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── COMPLETE STEP ───
  if (step === 'complete' && session) {
    const portrait: ExperiencePortraitType = getHealingExperiencePortrait(session);
    return (
      <div className="max-w-2xl mx-auto">
        <ReturnGuide
          session={session}
          portrait={portrait}
          days={days.map(d => ({
            dayNumber: d.dayNumber,
            title: d.title,
            returnTransition: d.content.returnTransition,
          }))}
          onSave={handleSaveJourney}
          onNewJourney={handleNewJourney}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <p className="text-primary/60">Something went wrong. Please refresh to start a new journey.</p>
      <button
        onClick={handleNewJourney}
        className="mt-4 btn-secondary px-6 py-2"
      >
        Start Over
      </button>
    </div>
  );
}
