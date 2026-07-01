'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, Loader2, Leaf, Waves, RefreshCw } from 'lucide-react';
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

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

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
  const [checkinIntentions, setCheckinIntentions] = useState<UserIntention[]>([]);
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinFeeling, setCheckinFeeling] = useState<CheckinFeeling | null>(null);
  const [checkinFeelingNote, setCheckinFeelingNote] = useState('');
  const [generatingDayNumber, setGeneratingDayNumber] = useState<number>(1);
  const isFinalDayGenerationRef = useRef(false);

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

        const coveredIntentions = new Set<UserIntention>();
        for (const block of healingContent.energyBlocks) {
          if (block.intention && currentSession.intentions.includes(block.intention as UserIntention)) {
            coveredIntentions.add(block.intention as UserIntention);
          }
        }

        const daySummary: HealingDaySummary = {
          dayNumber,
          title,
          activities: healingContent.energyBlocks.map(b => b.title),
          intentions: Array.from(coveredIntentions),
        };
        const updatedSession = addDayToHealingSession(currentSession, daySummary);
        setSession(updatedSession);
        saveHealingSession(updatedSession);

        setExpandedDays(prev => new Set([...prev, dayNumber]));

        const updatedPortrait = getHealingExperiencePortrait(updatedSession);
        setCheckinIntentions(updatedPortrait.uncoveredIntentions);
        setCheckinNote('');
        setCheckinFeeling(null);
        setCheckinFeelingNote('');

        if (isFinalDayGenerationRef.current) {
          isFinalDayGenerationRef.current = false;
          setStep('complete');
        } else {
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

  const handleCheckinFeeling = (feeling: CheckinFeeling, note?: string) => {
    setCheckinFeeling(feeling);
    setCheckinFeelingNote(note || '');
  };

  const handleShapeToday = () => {
    if (!session || !checkinFeeling) return;

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

    generateDay(updatedSession.daysGenerated.length + 1, updatedSession);
  };

  const handleRegenerateDay = (dayNumber: number) => {
    if (!session) return;
    generateDay(dayNumber, session);
  };

  const handleCompleteJourney = () => {
    setStep('complete');
  };

  const handleCompleteAndReturnHome = () => {
    if (!session) return;

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

    isFinalDayGenerationRef.current = true;

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    fontSize: '14px', color: 'white',
    resize: 'none', outline: 'none'
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px',
    background: 'var(--color-sky)', color: 'white',
    borderRadius: '12px', fontSize: '18px', fontWeight: 600,
    border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
  };

  if (step === 'welcome') {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ ...glassCard, padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'relative', width: '96px', height: '96px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(91,143,168,0.2)', animation: 'gentle-pulse 3s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: 'rgba(91,143,168,0.3)', animation: 'gentle-pulse 3s ease-in-out infinite', animationDelay: '0.5s' }} />
              <div style={{ position: 'absolute', inset: 24, borderRadius: '50%', background: 'rgba(91,143,168,0.4)', animation: 'gentle-pulse 3s ease-in-out infinite', animationDelay: '1s' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf className="w-10 h-10" style={{ color: 'var(--color-moss)' }} />
              </div>
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-white)', marginBottom: '8px' }}>
            Begin Your Healing Journey
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '380px', margin: '0 auto 24px' }}>
            A curated, day-by-day companion for your stay in {destination.name}.
            Move at your own pace through arrival, deepening, and integration.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Leaf className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-moss)' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-white)' }}>State-Aware Design</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Activities adapt to how you feel right now — not a generic itinerary</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Waves className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-sky)' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-white)' }}>Intention-Driven</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Each day serves your healing goals — grounding, release, connection, and more</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-sand)' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-white)' }}>Adaptive Arc</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Your journey evolves through arrival, deepening, and integration phases</p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <JourneyArc currentPhase="arrival" />
          </div>

          <button
            onClick={handleBeginJourney}
            style={buttonStyle}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Leaf className="w-5 h-5" />
            Begin Your Journey
          </button>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div style={{ maxWidth: '672px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ ...glassCard, padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-white)', marginBottom: '4px' }}>
            How are you arriving?
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
            Select the state that feels most like you right now.
          </p>

          <StateChips selected={currentState} onChange={setCurrentState} />
        </div>

        <div style={{ ...glassCard, padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-white)', marginBottom: '4px' }}>
            What are you seeking?
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
            Choose one or more intentions for your journey.
          </p>

          <IntentionChips selected={intentions} onChange={setIntentions} />
        </div>

        <div style={{ ...glassCard, padding: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--color-white)', marginBottom: '8px' }}>
            Anything you&apos;d like us to know? <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={chatNote}
            onChange={(e) => setChatNote(e.target.value)}
            placeholder="e.g. I'm recovering from burnout, or I have a knee injury, or I'm celebrating a milestone..."
            style={inputStyle}
            rows={3}
          />
        </div>

        <button
          onClick={handleSetupComplete}
          disabled={!currentState || intentions.length === 0}
          style={{
            ...buttonStyle,
            opacity: (!currentState || intentions.length === 0) ? 0.5 : 1,
            cursor: (!currentState || intentions.length === 0) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => { if (currentState && intentions.length > 0) e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { if (currentState && intentions.length > 0) e.currentTarget.style.opacity = '1'; }}
        >
          <ArrowRight className="w-5 h-5" />
          Start Day 1
        </button>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '48px 0' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(91,143,168,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-sky)' }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-white)', marginBottom: '8px' }}>
          Crafting Day {generatingDayNumber}...
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Weaving your intentions into a gentle day in {destination.name}
        </p>
        <div style={{ marginTop: '24px' }}>
          <JourneyArc currentPhase={phase} />
        </div>
        {error && (
          <div style={{
            marginTop: '16px', padding: '12px',
            background: 'rgba(194,120,92,0.15)', border: '1px solid rgba(194,120,92,0.3)',
            borderRadius: '12px', fontSize: '14px', color: '#c2785c'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  if (step === 'checkin' && session) {
    const lastDay = days[days.length - 1];
    const checkinPortrait = getHealingExperiencePortrait(session);
    const checkinPhase = computeJourneyPhase(session.daysGenerated.length + 1, checkinPortrait, session.chatContext || undefined);

    return (
      <div style={{ maxWidth: '672px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ ...glassCard, padding: '16px' }}>
          <JourneyArc currentPhase={checkinPhase} />
        </div>

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

        <div style={{ ...glassCard, padding: '20px' }}>
          <ExperiencePortrait
            intentions={session.intentions}
            coveredIntentions={checkinPortrait.coveredIntentions}
            uncoveredIntentions={checkinPortrait.uncoveredIntentions}
            daysGenerated={checkinPortrait.daysGenerated}
          />
        </div>

        <DailyCheckin
          dayNumber={session.daysGenerated.length}
          onCheckin={handleCheckinFeeling}
        />

        {checkinFeeling && (
          <div style={{ ...glassCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)', marginBottom: '4px' }}>
                Shape Day {session.daysGenerated.length + 1}
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                Adjust your focus for tomorrow, or let your journey guide you.
              </p>
              <IntentionChips selected={checkinIntentions} onChange={setCheckinIntentions} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--color-white)', marginBottom: '8px' }}>
                Anything else for tomorrow? <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={checkinNote}
                onChange={(e) => setCheckinNote(e.target.value)}
                placeholder="e.g. I'd like something gentler tomorrow, or I want to explore the coast..."
                style={inputStyle}
                rows={2}
              />
            </div>

            <button
              onClick={handleShapeToday}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '12px',
                background: 'var(--color-sky)', color: 'white',
                borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <ArrowRight className="w-4 h-4" />
              Shape Day {session.daysGenerated.length + 1}
            </button>
          </div>
        )}

        {session.daysGenerated.length >= 2 && (
          <div style={{
            background: 'rgba(91,143,168,0.08)',
            border: '1px solid rgba(91,143,168,0.2)',
            borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)', marginBottom: '4px' }}>
                Feeling Healed?
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                Ready to carry this peace home with you?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleCompleteAndReturnHome}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px',
                  background: 'rgba(107,158,126,0.15)', color: 'var(--color-moss)',
                  border: '1px solid rgba(107,158,126,0.3)',
                  borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(107,158,126,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(107,158,126,0.15)'}
              >
                <Leaf className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
                Complete & Return Home
              </button>
              <button
                onClick={handleShapeToday}
                disabled={!checkinFeeling}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px',
                  background: checkinFeeling ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  color: 'var(--color-white)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                  cursor: checkinFeeling ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  opacity: checkinFeeling ? 1 : 0.5
                }}
                onMouseEnter={(e) => { if (checkinFeeling) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { if (checkinFeeling) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
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

  if (step === 'result') {
    const resultPortrait = session ? getHealingExperiencePortrait(session) : null;
    const resultPhase = resultPortrait
      ? computeJourneyPhase(nextDayNumber, resultPortrait, session?.chatContext || undefined)
      : phase;

    return (
      <div style={{ maxWidth: '672px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ ...glassCard, padding: '16px' }}>
          <JourneyArc currentPhase={resultPhase} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

        {!isGenerating && days.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
            <button
              onClick={handleSaveJourney}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', fontSize: '14px', fontWeight: 500,
                background: 'var(--color-sky)', color: 'white',
                borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Save Journey
            </button>
            <button
              onClick={handleCompleteJourney}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', fontSize: '14px', fontWeight: 500,
                background: 'rgba(255,255,255,0.06)', color: 'var(--color-white)',
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <Leaf className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
              Complete & Return Home
            </button>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            background: 'rgba(194,120,92,0.15)', border: '1px solid rgba(194,120,92,0.3)',
            borderRadius: '12px', fontSize: '14px', color: '#c2785c',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: '8px', background: 'none', border: 'none',
                color: '#c2785c', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'complete' && session) {
    const portrait: ExperiencePortraitType = getHealingExperiencePortrait(session);
    return (
      <div style={{ maxWidth: '672px', margin: '0 auto' }}>
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

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '48px 0' }}>
      <p style={{ color: 'rgba(255,255,255,0.6)' }}>Something went wrong. Please refresh to start a new journey.</p>
      <button
        onClick={handleNewJourney}
        style={{
          marginTop: '16px', padding: '8px 24px',
          background: 'var(--color-sky)', color: 'white',
          borderRadius: '12px', border: 'none', cursor: 'pointer'
        }}
      >
        Start Over
      </button>
    </div>
  );
}
