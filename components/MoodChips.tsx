'use client';

import { useState } from 'react';

export interface MoodChip {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export const MOOD_CHIPS: MoodChip[] = [
  { id: 'chill', label: 'Chill', emoji: '🧘', description: 'Relaxing & slow-paced' },
  { id: 'active', label: 'Active', emoji: '🏃', description: 'Physical & energetic' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', description: 'Water-based activities' },
  { id: 'nature', label: 'Nature', emoji: '🌿', description: 'Nature immersion' },
  { id: 'food', label: 'Food', emoji: '🍜', description: 'Culinary experiences' },
  { id: 'coffee', label: 'Coffee', emoji: '☕', description: 'Café & coworking' },
];

interface MoodChipsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export default function MoodChips({ selected, onChange, className = '' }: MoodChipsProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {MOOD_CHIPS.map(chip => {
          const isSelected = selected.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggle(chip.id)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${isSelected
                  ? 'bg-secondary text-white border-secondary shadow-sm'
                  : 'bg-white text-primary/70 border-primary/15 hover:border-secondary/40 hover:text-secondary'
                }
              `}
              title={chip.description}
            >
              <span className="text-base">{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="mt-2 text-xs text-primary/40">Select at least one mood — or leave empty for a balanced day</p>
      )}
    </div>
  );
}

/**
 * Convert selected chip IDs to labels for the AI prompt
 */
export function getMoodLabels(ids: string[]): string[] {
  return ids.map(id => MOOD_CHIPS.find(c => c.id === id)?.label || id);
}
