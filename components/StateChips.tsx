'use client';

import { USER_STATES, type UserState } from '@/lib/healing-types';

interface StateChipsProps {
  selected: UserState | null;
  onChange: (state: UserState) => void;
  className?: string;
}

export default function StateChips({ selected, onChange, className = '' }: StateChipsProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {USER_STATES.map(state => {
          const isSelected = selected === state.id;
          return (
            <button
              key={state.id}
              onClick={() => onChange(state.id)}
              className={`
                flex flex-col items-start gap-1 p-3 rounded-xl text-left
                transition-all duration-200 border
                ${isSelected
                  ? 'bg-secondary text-white border-secondary shadow-sm'
                  : 'bg-white text-primary/70 border-primary/15 hover:border-secondary/40 hover:text-secondary'
                }
              `}
              title={state.description}
            >
              <span className="text-xl">{state.emoji}</span>
              <span className="text-sm font-medium">{state.label}</span>
              <span className={`text-xs leading-tight ${isSelected ? 'text-white/80' : 'text-primary/50'}`}>
                {state.description}
              </span>
            </button>
          );
        })}
      </div>
      {!selected && (
        <p className="mt-2 text-xs text-primary/40">How are you feeling right now?</p>
      )}
    </div>
  );
}
