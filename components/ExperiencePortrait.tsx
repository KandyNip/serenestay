'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { USER_INTENTIONS, type UserIntention, type JourneyPhase, computeJourneyPhase } from '@/lib/healing-types';

interface ExperiencePortraitProps {
  intentions: UserIntention[];
  coveredIntentions: UserIntention[];
  uncoveredIntentions: UserIntention[];
  daysGenerated: number;
  className?: string;
}

export default function ExperiencePortrait({
  intentions,
  coveredIntentions,
  uncoveredIntentions,
  daysGenerated,
  className = '',
}: ExperiencePortraitProps) {
  const phase = computeJourneyPhase(daysGenerated + 1, { coveredIntentions, uncoveredIntentions });
  const coveredSet = new Set(coveredIntentions);

  return (
    <div className={className}>
      {/* Journey phase badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-primary/50 uppercase tracking-wide">
          Experience Portrait
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          phase === 'arrival' ? 'bg-emerald-50 text-emerald-700' :
          phase === 'deepening' ? 'bg-amber-50 text-amber-700' :
          'bg-secondary/10 text-secondary'
        }`}>
          {phase === 'arrival' && '🌱 Arrival Phase'}
          {phase === 'deepening' && '🌿 Deepening Phase'}
          {phase === 'integration' && '🌳 Integration Phase'}
        </span>
      </div>

      {/* Intention grid */}
      <div className="grid grid-cols-3 gap-2">
        {intentions.map(intentionId => {
          const intention = USER_INTENTIONS.find(i => i.id === intentionId);
          if (!intention) return null;
          const isCovered = coveredSet.has(intentionId);

          return (
            <div
              key={intentionId}
              className={`
                flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all
                ${isCovered
                  ? 'bg-secondary/5 border-secondary/30'
                  : 'bg-white border-dashed border-primary/15'
                }
              `}
            >
              <span className="text-lg">{intention.emoji}</span>
              <span className={`text-xs font-medium ${
                isCovered ? 'text-secondary' : 'text-primary/40'
              }`}>
                {intention.label}
              </span>
              {isCovered && (
                <Check className="w-3.5 h-3.5 text-secondary" />
              )}
              {!isCovered && (
                <span className="text-[10px] text-primary/30">pending</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <p className="text-xs text-primary/40 mt-3 text-center">
        {coveredIntentions.length} of {intentions.length} intentions addressed · {daysGenerated} {daysGenerated === 1 ? 'day' : 'days'} generated
      </p>
    </div>
  );
}
