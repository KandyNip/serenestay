'use client';

import React from 'react';
import { Check, Sprout, Leaf, TreeDeciduous } from 'lucide-react';
import { USER_INTENTIONS, type UserIntention, type JourneyPhase, computeJourneyPhase } from '@/lib/healing-types';
import LucideIcon from './LucideIcon';

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

  let phaseColor: string;
  let phaseBg: string;
  let phaseText: string;

  if (phase === 'arrival') {
    phaseColor = 'var(--color-moss)';
    phaseBg = 'rgba(107, 158, 126, 0.15)';
    phaseText = 'Arrival Phase';
  } else if (phase === 'deepening') {
    phaseColor = 'var(--color-sand)';
    phaseBg = 'rgba(212, 197, 169, 0.15)';
    phaseText = 'Deepening Phase';
  } else {
    phaseColor = 'var(--color-sky)';
    phaseBg = 'rgba(91, 143, 168, 0.15)';
    phaseText = 'Integration Phase';
  }

  const phaseIcon = phase === 'arrival'
    ? <Sprout className="w-3 h-3" />
    : phase === 'deepening'
      ? <Leaf className="w-3 h-3" />
      : <TreeDeciduous className="w-3 h-3" />;

  return (
    <div className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Experience Portrait
        </span>
        <span style={{
          fontSize: '12px', fontWeight: 500, padding: '4px 8px',
          borderRadius: '9999px', color: phaseColor, background: phaseBg,
          display: 'inline-flex', alignItems: 'center', gap: '4px'
        }}>
          {phaseIcon}
          {phaseText}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {intentions.map(intentionId => {
          const intention = USER_INTENTIONS.find(i => i.id === intentionId);
          if (!intention) return null;
          const isCovered = coveredSet.has(intentionId);

          return (
            <div
              key={intentionId}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '10px', borderRadius: '8px', transition: 'all 0.2s',
                border: isCovered ? '1px solid rgba(91,143,168,0.3)' : '1px dashed rgba(255,255,255,0.12)',
                background: isCovered ? 'rgba(91,143,168,0.08)' : 'rgba(255,255,255,0.04)'
              }}
            >
              <LucideIcon name={intention.emoji} className="w-5 h-5" />
              <span style={{ fontSize: '12px', fontWeight: 500, color: isCovered ? 'var(--color-sky)' : 'rgba(255,255,255,0.4)' }}>
                {intention.label}
              </span>
              {isCovered && (
                <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-sky)' }} />
              )}
              {!isCovered && (
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>pending</span>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '12px', textAlign: 'center' }}>
        {coveredIntentions.length} of {intentions.length} intentions addressed · {daysGenerated} {daysGenerated === 1 ? 'day' : 'days'} generated
      </p>
    </div>
  );
}
