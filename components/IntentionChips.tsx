'use client';

import { USER_INTENTIONS, type UserIntention } from '@/lib/healing-types';

interface IntentionChipsProps {
  selected: UserIntention[];
  onChange: (selected: UserIntention[]) => void;
  className?: string;
}

export default function IntentionChips({ selected, onChange, className = '' }: IntentionChipsProps) {
  const toggle = (id: UserIntention) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {USER_INTENTIONS.map(intention => {
          const isSelected = selected.includes(intention.id);
          return (
            <button
              key={intention.id}
              onClick={() => toggle(intention.id)}
              className={`
                flex flex-col items-start gap-1 p-3 rounded-xl text-left
                transition-all duration-200 border
                ${isSelected
                  ? 'bg-secondary text-white border-secondary shadow-sm'
                  : 'bg-white text-primary/70 border-primary/15 hover:border-secondary/40 hover:text-secondary'
                }
              `}
              title={intention.description}
            >
              <span className="text-xl">{intention.emoji}</span>
              <span className="text-sm font-medium">{intention.label}</span>
              <span className={`text-xs leading-tight ${isSelected ? 'text-white/80' : 'text-primary/50'}`}>
                {intention.description}
              </span>
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="mt-2 text-xs text-primary/40">Select one or more intentions for your journey</p>
      )}
    </div>
  );
}

/**
 * Convert selected intention IDs to labels for the AI prompt
 */
export function getIntentionLabels(ids: UserIntention[]): string[] {
  return ids.map(id => USER_INTENTIONS.find(i => i.id === id)?.label || id);
}
