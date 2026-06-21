'use client';

import React from 'react';
import type { JourneyPhase } from '@/lib/healing-types';

interface JourneyArcProps {
  currentPhase: JourneyPhase;
  className?: string;
}

const PHASES: { id: JourneyPhase; label: string; emoji: string; description: string }[] = [
  { id: 'arrival', label: 'Arrival', emoji: '🌱', description: 'Gentle grounding & settling in' },
  { id: 'deepening', label: 'Deepening', emoji: '🌿', description: 'Core healing work & exploration' },
  { id: 'integration', label: 'Integration', emoji: '🌳', description: 'Synthesis & preparing to return' },
];

export default function JourneyArc({ currentPhase, className = '' }: JourneyArcProps) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className={className}>
      {/* Visual river/path */}
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-primary/10 -translate-y-1/2">
          <div
            className="h-full bg-secondary transition-all duration-500"
            style={{ width: `${currentIndex === 0 ? 0 : currentIndex === 1 ? 50 : 100}%` }}
          />
        </div>

        {PHASES.map((phase, index) => {
          const isPast = index < currentIndex;
          const isCurrent = phase.id === currentPhase;
          const isFuture = index > currentIndex;

          return (
            <div key={phase.id} className="flex flex-col items-center z-10 relative">
              {/* Phase circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-xl
                  transition-all duration-300 border-2
                  ${isCurrent
                    ? 'bg-secondary text-white border-secondary shadow-md scale-110'
                    : isPast
                      ? 'bg-secondary/20 text-secondary border-secondary/40'
                      : 'bg-white text-primary/30 border-primary/15'
                  }
                `}
              >
                {phase.emoji}
              </div>

              {/* Label */}
              <span className={`mt-2 text-xs font-medium ${
                isCurrent ? 'text-secondary' : isPast ? 'text-primary/60' : 'text-primary/30'
              }`}>
                {phase.label}
              </span>

              {/* Description */}
              <span className={`text-[10px] text-center max-w-[80px] leading-tight mt-0.5 ${
                isCurrent ? 'text-primary/60' : 'text-primary/30'
              }`}>
                {phase.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
