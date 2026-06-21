'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CheckinFeeling } from '@/lib/healing-types';
import { CHECKIN_FEELINGS } from '@/lib/healing-types';

interface DailyCheckinProps {
  dayNumber: number;
  onCheckin: (feeling: CheckinFeeling, note?: string) => void;
  className?: string;
}

export default function DailyCheckin({ dayNumber, onCheckin, className = '' }: DailyCheckinProps) {
  const [feeling, setFeeling] = useState<CheckinFeeling | null>(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const handleFeelingSelect = (f: CheckinFeeling) => {
    setFeeling(f);
    setShowNote(true);
  };

  const handleContinue = () => {
    if (!feeling) return;
    onCheckin(feeling, note.trim() || undefined);
  };

  return (
    <div className={`bg-white rounded-2xl border border-primary/10 p-6 shadow-sm ${className}`}>
      <h3 className="font-serif text-lg text-primary mb-1">
        How are you feeling after Day {dayNumber}?
      </h3>
      <p className="text-sm text-primary/60 mb-4">
        Your check-in helps shape the next day&apos;s plan.
      </p>

      {/* Feeling buttons */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {CHECKIN_FEELINGS.map(f => (
          <button
            key={f.id}
            onClick={() => handleFeelingSelect(f.id)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
              ${feeling === f.id
                ? 'bg-secondary/10 border-secondary shadow-sm'
                : 'bg-white border-primary/10 hover:border-secondary/40 hover:bg-secondary/5'
              }
            `}
          >
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-xs font-medium text-primary/70">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Optional note */}
      {showNote && (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything you'd like to share? (optional)"
            className="w-full px-3 py-2 border border-primary/15 rounded-lg text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-secondary/40 resize-none"
            rows={2}
          />

          <button
            onClick={handleContinue}
            className="w-full btn-secondary py-2.5 flex items-center justify-center gap-2"
          >
            Continue to Day {dayNumber + 1}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
