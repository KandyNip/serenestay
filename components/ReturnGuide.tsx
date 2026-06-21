'use client';

import React from 'react';
import { Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import JourneyArc from './JourneyArc';
import ExperiencePortrait from './ExperiencePortrait';
import type { HealingJourneySession, ExperiencePortrait as ExperiencePortraitType, UserIntention, JourneyPhase } from '@/lib/healing-types';
import { computeJourneyPhase } from '@/lib/healing-types';

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
    <div className={`space-y-6 ${className}`}>
      {/* Reflection message */}
      <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm text-center">
        <div className="text-4xl mb-3">🌿</div>
        <h3 className="font-serif text-xl text-primary mb-2">Your Journey Complete</h3>
        <p className="text-sm text-primary/60 max-w-md mx-auto">
          You&apos;ve spent {session.daysGenerated.length} {session.daysGenerated.length === 1 ? 'day' : 'days'} in {session.destinationName},
          moving through {phase === 'arrival' ? 'arrival' : phase === 'deepening' ? 'deepening' : 'integration'} with intention.
          Whatever comes next, carry this experience gently.
        </p>
      </div>

      {/* Journey Arc */}
      <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
        <JourneyArc currentPhase={phase} />
      </div>

      {/* Experience Portrait */}
      <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
        <ExperiencePortrait
          intentions={session.intentions}
          coveredIntentions={portrait.coveredIntentions}
          uncoveredIntentions={portrait.uncoveredIntentions}
          daysGenerated={portrait.daysGenerated}
        />
      </div>

      {/* Days overview (collapsible) */}
      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowDays(!showDays)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors"
        >
          <span className="text-sm font-medium text-primary">
            Your {days.length} {days.length === 1 ? 'Day' : 'Days'}
          </span>
          {showDays ? (
            <ChevronUp className="w-5 h-5 text-primary/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary/40" />
          )}
        </button>

        {showDays && (
          <div className="px-6 pb-4 border-t border-primary/5">
            <div className="space-y-2 mt-3">
              {days.map(day => (
                <div
                  key={day.dayNumber}
                  className="flex items-center gap-3 p-2 rounded-lg"
                >
                  <span className="flex items-center justify-center w-7 h-7 bg-secondary/10 text-secondary rounded-full text-xs font-semibold">
                    {day.dayNumber}
                  </span>
                  <span className="text-sm text-primary flex-1 truncate">{day.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Return transition suggestions */}
      {days.some(d => d.returnTransition && d.returnTransition.length > 0) && (
        <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
          <h4 className="font-serif text-base text-primary mb-3">🌅 Carrying It Forward</h4>
          <div className="space-y-2">
            {days.flatMap(d => d.returnTransition || []).map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-secondary mt-0.5">•</span>
                <span className="text-sm text-primary/70">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Journey
        </button>
        <button
          onClick={onNewJourney}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-primary/10 text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Journey
        </button>
      </div>
    </div>
  );
}
