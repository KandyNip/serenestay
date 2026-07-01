'use client';

import { USER_STATES, type UserState } from '@/lib/healing-types';
import LucideIcon from './LucideIcon';

interface StateChipsProps {
  selected: UserState | null;
  onChange: (state: UserState) => void;
  className?: string;
}

export default function StateChips({ selected, onChange, className = '' }: StateChipsProps) {
  return (
    <div className={className}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
        {USER_STATES.map(state => {
          const isSelected = selected === state.id;
          return (
            <button
              key={state.id}
              onClick={() => onChange(state.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
                padding: '12px', borderRadius: '12px', textAlign: 'left',
                transition: 'all 0.2s ease', cursor: 'pointer',
                border: isSelected ? '1px solid var(--color-sky)' : '1px solid rgba(255,255,255,0.12)',
                background: isSelected ? 'var(--color-sky)' : 'rgba(255,255,255,0.06)',
                color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                boxShadow: isSelected ? '0 4px 12px rgba(91,143,168,0.3)' : 'none'
              }}
              title={state.description}
            >
              <LucideIcon name={state.emoji} className="w-6 h-6" />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{state.label}</span>
              <span style={{ fontSize: '12px', lineHeight: 1.4, color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}>
                {state.description}
              </span>
            </button>
          );
        })}
      </div>
      {!selected && (
        <p style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>How are you feeling right now?</p>
      )}
    </div>
  );
}
