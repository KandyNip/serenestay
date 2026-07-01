'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { loadDNAProfile, calculateMatchScore, type DNAProfile, type ScoreKey } from '@/lib/dna-quiz';
import LucideIcon from './LucideIcon';

const DIMENSION_LABELS: Record<ScoreKey, string> = {
  serenity: 'Serenity',
  nature: 'Nature',
  climate: 'Climate',
  affordability: 'Affordability',
  wellness: 'Wellness',
  community: 'Community',
  wifi: 'WiFi',
  visa: 'Visa',
  medical: 'Medical',
};

const DIMENSIONS: ScoreKey[] = ['serenity', 'nature', 'climate', 'affordability', 'wellness', 'community', 'wifi', 'visa', 'medical'];

interface WhyYouMatchProps {
  destinationScores: Record<ScoreKey, number>;
  destinationName: string;
}

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
  borderLeft: '4px solid var(--color-moss)',
} as React.CSSProperties;

export default function WhyYouMatch({ destinationScores, destinationName }: WhyYouMatchProps) {
  const [profile, setProfile] = useState<DNAProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadDNAProfile();
    if (saved) setProfile(saved);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div style={glassCard}>
        <div className="flex items-start gap-4" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(107,158,126,0.15)', flexShrink: 0 }}>
            <HeartPulse className="w-6 h-6" style={{ color: 'var(--color-moss)' }} />
          </div>
          <div className="flex-1">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)', marginBottom: '4px' }}>
              Personalize Your View
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
              Take the Healing DNA test to see how well {destinationName} matches your unique needs.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: 'var(--color-moss)' }}
            >
              Take the Healing DNA test →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const matchScore = calculateMatchScore(profile, destinationScores);

  const whyMatch: string[] = [];
  const gaps: string[] = [];

  for (const dim of DIMENSIONS) {
    const userVal = profile.weights[dim];
    const destVal = destinationScores[dim] * 2;
    if (userVal >= 6 && destVal >= 6) {
      whyMatch.push(DIMENSION_LABELS[dim]);
    }
    if (userVal >= 7 && destVal <= 4) {
      gaps.push(DIMENSION_LABELS[dim]);
    }
  }

  return (
    <div style={glassCard}>
      <div className="flex items-center gap-4" style={{ padding: '24px', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(107,158,126,0.15)', flexShrink: 0 }}>
          <LucideIcon name={profile.emoji} className="w-7 h-7" style={{ color: 'var(--color-moss)' }} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)' }}>
            Why You Match
          </h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            Based on your {profile.type} DNA profile
          </p>
        </div>
        <div className="ml-auto text-right">
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-white)' }}>{matchScore}%</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>match</div>
        </div>
      </div>

      {whyMatch.length > 0 && (
        <div style={{ padding: '0 24px', marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-white)', marginBottom: '6px' }}>
            <strong>Great fit for:</strong> {whyMatch.slice(0, 4).join(', ')}
          </p>
        </div>
      )}

      {gaps.length > 0 && (
        <div style={{ padding: '0 24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-sand)' }}>
            <strong>Mind the gap:</strong> {gaps.join(', ')} {gaps.length === 1 ? 'is' : 'are'} important to you but {destinationName} {gaps.length === 1 ? 'scores' : 'score'} lower here.
          </p>
        </div>
      )}

      {whyMatch.length === 0 && gaps.length === 0 && (
        <div style={{ padding: '0 24px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            A balanced match — no strong alignments or gaps with your current DNA profile.
          </p>
        </div>
      )}

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginRight: '24px' }}>
        <Link
          href="/chat"
          className="text-xs transition-colors"
          style={{ color: 'var(--color-moss)' }}
        >
          Adjust your DNA weights →
        </Link>
      </div>
    </div>
  );
}
