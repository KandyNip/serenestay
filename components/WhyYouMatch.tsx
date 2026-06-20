'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadDNAProfile, calculateMatchScore, type DNAProfile, type ScoreKey } from '@/lib/dna-quiz';
import { checkProStatus } from '@/lib/api';

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

export default function WhyYouMatch({ destinationScores, destinationName }: WhyYouMatchProps) {
  const [profile, setProfile] = useState<DNAProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const saved = loadDNAProfile();
    if (saved) setProfile(saved);
    setIsPro(checkProStatus());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // No DNA profile — show prompt to take quiz
  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-card border-l-4 border-[#52B788]">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🧬</div>
          <div className="flex-1">
            <h3 className="font-serif text-lg text-[#1B4332] mb-1">
              Personalize Your View
            </h3>
            <p className="text-sm text-[#1B4332]/60 mb-3">
              Take the Healing DNA test to see how well {destinationName} matches your unique needs.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#52B788] hover:text-[#52B788]/80 transition-colors"
            >
              Take the Healing DNA test →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate match score
  const matchScore = calculateMatchScore(profile, destinationScores);

  // Find "Why You Match" — dimensions where both user and destination score high
  const whyMatch: string[] = [];
  const gaps: string[] = [];

  for (const dim of DIMENSIONS) {
    const userVal = profile.weights[dim];
    const destVal = destinationScores[dim] * 2; // Scale 1-5 to 2-10 for comparison
    if (userVal >= 6 && destVal >= 6) {
      whyMatch.push(DIMENSION_LABELS[dim]);
    }
    if (userVal >= 7 && destVal <= 4) {
      gaps.push(DIMENSION_LABELS[dim]);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border-l-4 border-[#52B788]">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl">{profile.emoji}</div>
        <div>
          <h3 className="font-serif text-lg text-[#1B4332]">
            Why You Match
          </h3>
          <p className="text-xs text-[#1B4332]/50">
            Based on your {profile.type} DNA profile
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-bold text-[#1B4332]">{matchScore}%</div>
          <div className="text-xs text-[#1B4332]/40">match</div>
        </div>
      </div>

      {/* Why you match */}
      {whyMatch.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-[#1B4332] mb-1.5">
            ✨ <strong>Great fit for:</strong> {whyMatch.slice(0, 4).join(', ')}
          </p>
        </div>
      )}

      {/* Mind the gap — Pro only */}
      {isPro && gaps.length > 0 && (
        <div>
          <p className="text-sm text-[#D4A373]">
            ⚠️ <strong>Mind the gap:</strong> {gaps.join(', ')} {gaps.length === 1 ? 'is' : 'are'} important to you but {destinationName} {gaps.length === 1 ? 'scores' : 'score'} lower here.
          </p>
        </div>
      )}

      {whyMatch.length === 0 && gaps.length === 0 && (
        <p className="text-sm text-[#1B4332]/60">
          A balanced match — no strong alignments or gaps with your current DNA profile.
        </p>
      )}

      {/* Free user upgrade prompt */}
      {!isPro && (
        <div className="mt-4 pt-3 border-t border-[#1B433210]">
          <Link
            href="/pricing"
            className="text-xs text-[#D4A373] hover:text-[#D4A373]/80 transition-colors"
          >
            ✨ Unlock full match analysis with Pro →
          </Link>
        </div>
      )}

      {/* Pro user: adjust weights link */}
      {isPro && (
        <div className="mt-4 pt-3 border-t border-[#1B433210]">
          <Link
            href="/chat"
            className="text-xs text-[#52B788] hover:text-[#52B788]/80 transition-colors"
          >
            Adjust your DNA weights →
          </Link>
        </div>
      )}
    </div>
  );
}
