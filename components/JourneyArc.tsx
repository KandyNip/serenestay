'use client';

import React from 'react';
import { Sprout, Leaf, TreeDeciduous } from 'lucide-react';
import type { JourneyPhase } from '@/lib/healing-types';

interface JourneyArcProps {
  currentPhase: JourneyPhase;
  className?: string;
}

const PHASES: { id: JourneyPhase; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'arrival', label: 'Arrival', icon: <Sprout className="w-5 h-5" />, description: 'Gentle grounding & settling in' },
  { id: 'deepening', label: 'Deepening', icon: <Leaf className="w-5 h-5" />, description: 'Core healing work & exploration' },
  { id: 'integration', label: 'Integration', icon: <TreeDeciduous className="w-5 h-5" />, description: 'Synthesis & preparing to return' },
];

export default function JourneyArc({ currentPhase, className = '' }: JourneyArcProps) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '15%', right: '15%',
          height: '2px', background: 'rgba(255,255,255,0.08)',
          transform: 'translateY(-50%)'
        }}>
          <div
            style={{
              height: '100%', background: 'var(--color-sky)',
              transition: 'all 0.5s ease',
              width: `${currentIndex === 0 ? 0 : currentIndex === 1 ? 50 : 100}%`
            }}
          />
        </div>

        {PHASES.map((phase, index) => {
          const isPast = index < currentIndex;
          const isCurrent = phase.id === currentPhase;
          const isFuture = index > currentIndex;

          let circleBg: string;
          let circleBorder: string;
          let textColor: string;
          let labelColor: string;
          let descColor: string;
          let scale = 1;

          if (isCurrent) {
            circleBg = 'var(--color-sky)';
            circleBorder = 'var(--color-sky)';
            textColor = 'white';
            labelColor = 'var(--color-sky)';
            descColor = 'rgba(255,255,255,0.6)';
            scale = 1.1;
          } else if (isPast) {
            circleBg = 'rgba(91, 143, 168, 0.2)';
            circleBorder = 'rgba(91, 143, 168, 0.4)';
            textColor = 'var(--color-sky)';
            labelColor = 'rgba(255,255,255,0.6)';
            descColor = 'rgba(255,255,255,0.3)';
          } else {
            circleBg = 'rgba(255,255,255,0.06)';
            circleBorder = 'rgba(255,255,255,0.12)';
            textColor = 'rgba(255,255,255,0.3)';
            labelColor = 'rgba(255,255,255,0.3)';
            descColor = 'rgba(255,255,255,0.2)';
          }

          return (
            <div key={phase.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, position: 'relative' }}>
              <div
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', transition: 'all 0.3s ease',
                  border: `2px solid ${circleBorder}`,
                  background: circleBg,
                  color: textColor,
                  transform: `scale(${scale})`,
                  boxShadow: isCurrent ? '0 4px 12px rgba(91,143,168,0.3)' : 'none'
                }}
              >
                {phase.icon}
              </div>

              <span style={{ marginTop: '8px', fontSize: '12px', fontWeight: 500, color: labelColor }}>
                {phase.label}
              </span>

              <span style={{
                fontSize: '10px', textAlign: 'center', maxWidth: '80px',
                lineHeight: 1.3, marginTop: '2px', color: descColor
              }}>
                {phase.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
