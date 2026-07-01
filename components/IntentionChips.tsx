'use client';

import { USER_INTENTIONS, type UserIntention } from '@/lib/healing-types';
import LucideIcon from './LucideIcon';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
        {USER_INTENTIONS.map(intention => {
          const isSelected = selected.includes(intention.id);
          return (
            <button
              key={intention.id}
              onClick={() => toggle(intention.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
                padding: '12px', borderRadius: '12px', textAlign: 'left',
                transition: 'all 0.2s ease', cursor: 'pointer',
                border: isSelected ? '1px solid var(--color-sky)' : '1px solid rgba(255,255,255,0.12)',
                background: isSelected ? 'var(--color-sky)' : 'rgba(255,255,255,0.06)',
                color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                boxShadow: isSelected ? '0 4px 12px rgba(91,143,168,0.3)' : 'none'
              }}
              title={intention.description}
            >
              <LucideIcon name={intention.emoji} className="w-6 h-6" />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{intention.label}</span>
              <span style={{ fontSize: '12px', lineHeight: 1.4, color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}>
                {intention.description}
              </span>
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Select one or more intentions for your journey</p>
      )}
    </div>
  );
}

export function getIntentionLabels(ids: UserIntention[]): string[] {
  return ids.map(id => USER_INTENTIONS.find(i => i.id === id)?.label || id);
}
