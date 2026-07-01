'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import DNAQuiz from '@/components/DNAQuiz';
import DNAResult from '@/components/DNAResult';
import CompassMatch from '@/components/CompassMatch';
import { calculateDNAProfile, saveDNAProfile, loadDNAProfile, type DNAProfile, type ScoreKey } from '@/lib/dna-quiz';
import { checkProStatus } from '@/lib/api';

type Phase = 'quiz' | 'result' | 'matches';

function DNAFlowContent() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [profile, setProfile] = useState<DNAProfile | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const saved = loadDNAProfile();
    if (saved) {
      setProfile(saved);
      setPhase('result');
    }
    setIsPro(checkProStatus());
  }, []);

  const handleQuizComplete = (answers: number[]) => {
    const newProfile = calculateDNAProfile(answers);
    setProfile(newProfile);
    saveDNAProfile(newProfile);
    setPhase('result');
  };

  const handleRetake = () => {
    setProfile(null);
    setPhase('quiz');
  };

  const handleWeightsChange = (weights: Record<ScoreKey, number>) => {
    if (!profile) return;
    const updated = { ...profile, weights };
    setProfile(updated);
    saveDNAProfile(updated);
  };

  const handleViewMatches = () => {
    setPhase('matches');
  };

  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh', paddingTop: '80px' }}>
      {phase === 'quiz' && (
        <DNAQuiz onComplete={handleQuizComplete} />
      )}
      {phase === 'result' && profile && (
        <DNAResult
          profile={profile}
          onWeightsChange={handleWeightsChange}
          onRetake={handleRetake}
          onViewMatches={handleViewMatches}
        />
      )}
      {phase === 'matches' && profile && (
        <CompassMatch
          profile={profile}
          onWeightsChange={handleWeightsChange}
          onBack={() => setPhase('result')}
          isPro={isPro}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
        Loading...
      </div>
    }>
      <DNAFlowContent />
    </Suspense>
  );
}
