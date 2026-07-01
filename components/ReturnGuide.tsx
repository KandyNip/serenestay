'use client';

import React from 'react';
import { Save, RotateCcw, ChevronDown, ChevronUp, Leaf, Sunrise } from 'lucide-react';
import JourneyArc from './JourneyArc';
import ExperiencePortrait from './ExperiencePortrait';
import type { HealingJourneySession, ExperiencePortrait as ExperiencePortraitType, JourneyPhase } from '@/lib/healing-types';
import { computeJourneyPhase } from '@/lib/healing-types';

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

interface ReturnGuideProps {
  session: HealingJourneySession;
  portrait: ExperiencePortraitType;
  days: { dayNumber: number; title: string; returnTransition?: string[] }[];
  onSave: () => void;
  onNewJourney: () => void;
  className?: string;
}

export default function ReturnGuide({
  session,
  portrait,
  days,
  onSave,
  onNewJourney,
  className = '',
}: ReturnGuideProps) {
  const [showDays, setShowDays] = React.useState(false);
  const phase: JourneyPhase = computeJourneyPhase(session.currentDay, portrait, session.chatContext || undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className={className}>
      <div style={{ ...glassCard, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <Leaf className="w-12 h-12" style={{ color: 'var(--color-moss)' }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-white)', marginBottom: '8px' }}>Your Journey Complete</h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '440px', margin: '0 auto' }}>
          You&apos;ve spent {session.daysGenerated.length} {session.daysGenerated.length === 1 ? 'day' : 'days'} in {session.destinationName},
          moving through {phase === 'arrival' ? 'arrival' : phase === 'deepening' ? 'deepening' : 'integration'} with intention.
          Whatever comes next, carry this experience gently.
        </p>
      </div>

      <div style={{ ...glassCard, padding: '24px' }}>
        <JourneyArc currentPhase={phase} />
      </div>

      <div style={{ ...glassCard, padding: '24px' }}>
        <ExperiencePortrait
          intentions={session.intentions}
          coveredIntentions={portrait.coveredIntentions}
          uncoveredIntentions={portrait.uncoveredIntentions}
          daysGenerated={portrait.daysGenerated}
        />
      </div>

      <div style={{ ...glassCard, overflow: 'hidden' }}>
        <button
          onClick={() => setShowDays(!showDays)}
          style={{
            width: '100%', padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-white)' }}>
            Your {days.length} {days.length === 1 ? 'Day' : 'Days'}
          </span>
          {showDays ? (
            <ChevronUp className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
          )}
        </button>

        {showDays && (
          <div style={{ padding: '0 24px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {days.map(day => (
                <div
                  key={day.dayNumber}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px' }}
                >
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px',
                    background: 'rgba(91,143,168,0.15)', color: 'var(--color-sky)',
                    borderRadius: '50%', fontSize: '12px', fontWeight: 600
                  }}>
                    {day.dayNumber}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--color-white)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{day.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {days.some(d => d.returnTransition && d.returnTransition.length > 0) && (
        <div style={{ ...glassCard, padding: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sunrise className="w-5 h-5" style={{ color: 'var(--color-sand)' }} />
            Carrying It Forward
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {days.flatMap(d => d.returnTransition || []).map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--color-sky)', marginTop: '2px' }}>•</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
        <button
          onClick={onSave}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', fontSize: '14px', fontWeight: 500,
            background: 'var(--color-sky)', color: 'white',
            borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Save className="w-4 h-4" />
          Save Journey
        </button>
        <button
          onClick={onNewJourney}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', fontSize: '14px', fontWeight: 500,
            background: 'rgba(255,255,255,0.06)', color: 'var(--color-white)',
            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          <RotateCcw className="w-4 h-4" />
          New Journey
        </button>
      </div>
    </div>
  );
}
