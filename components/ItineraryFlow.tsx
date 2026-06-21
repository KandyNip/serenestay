'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import StateChips from './StateChips';
import IntentionChips from './IntentionChips';
import ItineraryDayCard, { type HealingDayContent } from './ItineraryDayCard';
import JourneyArc from './JourneyArc';
import DailyCheckin from './DailyCheckin';
import ReturnGuide from './ReturnGuide';
import type {
  UserState,
  UserIntention,
  JourneyPhase,
  CheckinFeeling,
  HealingJourneySession,
  HealingDaySummary,
  ExperiencePortrait,
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
    setError(null);
    setStep('generating');

    try {
      const token = getProToken();
      const prevContext = getHealingPreviousDaysContext(currentSession);
      const portrait = getHealingExperiencePortrait(currentSession);
      const phase = computeJourneyPhase(dayNumber);

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

        // Extract intentions covered from energy blocks
        const coveredIntentions = new Set<UserIntention>();
        for (const block of healingContent.energyBlocks) {
          for (const activity of block.activities) {
            for (const tag of activity.intentionTags || []) {
              if (currentSession.intentions.includes(tag as UserIntention)) {
                coveredIntentions.add(tag as UserIntention);
              }
            }
          }
        }

        // Update session with day summary
        const daySummary: HealingDaySummary = {
          dayNumber,
          title,
          activities: healingContent.energyBlocks.flatMap(b => b.activities.map(a => a.name)),
          intentions: Array.from(coveredIntentions),
        };
        const updatedSession = addDayToHealingSession(currentSession, daySummary);
        setSession(updatedSession);
        saveHealingSession(updatedSession);

        // Expand the newly generated day
        setExpandedDays(prev => new Set([...prev, dayNumber]));

        // Go to checkin step
        setStep('checkin');
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

  const handleCheckin = (feeling: CheckinFeeling, note?: string) => {
    if (!session) return;

    // Build check-in context for the next day's prompt
    const checkinText = `Day ${session.daysGenerated.length} check-in: Feeling ${feeling}${note ? ` — ${note}` : ''}`;
    const updatedChatContext = session.chatContext
      ? session.chatContext + '\n' + checkinText
      : checkinText;

    const updatedSession: HealingJourneySession = {
      ...session,
      chatContext: updatedChatContext,
      currentDay: session.currentDay + 1,
      daysGenerated: session.daysGenerated.map((d, i) =>
        i === session.daysGenerated.length - 1
          ? { ...d, checkinFeeling: feeling, checkinNote: note }
          : d
      ),
    };

    setSession(updatedSession);
    saveHealingSession(updatedSession);

    // Generate next day
    generateDay(updatedSession.currentDay, updatedSession);
  };

  const handleRegenerateDay = (dayNumber: number) => {
    if (!session) return;
    generateDay(dayNumber, session);
  };

  const handleCompleteJourney = () => {
    setStep('complete');
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

  const currentDayNumber = session?.currentDay || 1;
  const phase: JourneyPhase = computeJourneyPhase(currentDayNumber);

  // ─── WELCOME STEP ───
  if (step === 'welcome') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-primary/10 p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="font-serif text-2xl text-primary mb-2">
            Begin Your Healing Journey
          </h2>
          <p className="text-sm text-primary/60 max-w-sm mx-auto mb-6">
            A personalized, day-by-day companion for your stay in {destination.name}.
            Move at your own pace through arrival, deepening, and integration.
          </p>

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
          Crafting Day {currentDayNumber}...
        </h3>
        <p className="text-primary/60 text-sm">
          Weaving your intentions into a gentle day in {destination.name}
        </p>
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ─── CHECKIN STEP ───
  if (step === 'checkin' && session) {
    const lastDay = days[days.length - 1];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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

        {/* Daily Check-in */}
        <DailyCheckin
          dayNumber={session.daysGenerated.length}
          onCheckin={handleCheckin}
        />

        {/* Option to complete journey */}
        <div className="text-center">
          <button
            onClick={handleCompleteJourney}
            className="text-sm text-primary/50 hover:text-primary/70 underline transition-colors"
          >
            Or complete your journey here
          </button>
        </div>
      </div>
    );
  }

  // ─── RESULT STEP (fallback / error state) ───
  if (step === 'result') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
              onClick={handleCompleteJourney}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-primary/10 text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Complete Journey
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
    const portrait: ExperiencePortrait = getHealingExperiencePortrait(session);
    return (
      <div className="max-w-2xl mx-auto">
        <ReturnGuide
          session={session}
          portrait={portrait}
          days={days.map(d => ({ dayNumber: d.dayNumber, title: d.title }))}
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
