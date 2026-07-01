'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CheckinFeeling } from '@/lib/healing-types';
import { CHECKIN_FEELINGS } from '@/lib/healing-types';
import LucideIcon from './LucideIcon';

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    fontSize: '14px', color: 'white',
    resize: 'none', outline: 'none'
  };

  return (
    <div style={{ ...glassCard, padding: '24px' }} className={className}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)', marginBottom: '4px' }}>
        How are you feeling after Day {dayNumber}?
      </h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
        Your check-in helps shape the next day&apos;s plan.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {CHECKIN_FEELINGS.map(f => {
          const isSelected = feeling === f.id;
          return (
            <button
              key={f.id}
              onClick={() => handleFeelingSelect(f.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '12px', borderRadius: '12px',
                transition: 'all 0.2s ease', cursor: 'pointer',
                border: isSelected ? '2px solid var(--color-sky)' : '2px solid rgba(255,255,255,0.12)',
                background: isSelected ? 'rgba(91,143,168,0.15)' : 'rgba(255,255,255,0.06)',
                boxShadow: isSelected ? '0 4px 12px rgba(91,143,168,0.2)' : 'none'
              }}
            >
              <LucideIcon name={f.emoji} className="w-7 h-7" />
              <span style={{ fontSize: '12px', fontWeight: 500, color: isSelected ? 'var(--color-sky)' : 'rgba(255,255,255,0.7)' }}>{f.label}</span>
            </button>
          );
        })}
      </div>

      {showNote && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything you'd like to share? (optional)"
            style={inputStyle}
            rows={2}
          />

          <button
            onClick={handleContinue}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '12px',
              background: 'var(--color-sky)', color: 'white',
              borderRadius: '12px', fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Continue to Day {dayNumber + 1}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
