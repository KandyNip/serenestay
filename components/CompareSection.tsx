'use client';

import { useState, useEffect } from 'react';
import { Lock, GitCompare, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { checkProStatus } from '@/lib/api';
import type { Destination } from '@/lib/types';

interface CompareSectionProps {
  currentSlug: string;
  currentName: string;
}

export default function CompareSection({ currentSlug, currentName }: CompareSectionProps) {
  const [isPro, setIsPro] = useState(false);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [comparison, setComparison] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setIsPro(checkProStatus()); }, []);

  useEffect(() => {
    fetch('/api/destinations?fields=card')
      .then(r => r.json())
      .then((data: { destinations: Destination[] }) => setAllDestinations(data.destinations || []))
      .catch(() => {});
  }, []);

  const handleCompare = async () => {
    if (!selectedSlug) return;
    setLoading(true);
    setComparison(null);
    const proToken = localStorage.getItem('serenestay_pro_token') || '';
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: [currentSlug, selectedSlug], proToken }),
      });
      const data = await res.json();
      if (data.comparison) setComparison(data.comparison);
    } catch {} finally { setLoading(false); }
  };

  // Free用户锁定卡片
  if (!isPro) {
    return (
      <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-2xl p-6 border border-secondary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-primary">Compare Destinations</h3>
            <p className="text-sm text-primary/50">Pro exclusive</p>
          </div>
        </div>
        <p className="text-primary/60 text-sm mb-4">
          See how {currentName} stacks up against other retreats — AI-powered head-to-head comparison.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  // 按region分组
  const regions = [...new Set(allDestinations.map(d => d.region))];
  const filteredDestinations = allDestinations.filter(d => d.slug !== currentSlug);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      <h3 className="font-serif text-xl text-primary mb-4 flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-secondary" />
        Compare {currentName}
      </h3>

      {!comparison && !loading && (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-3 border-2 border-dashed border-secondary/30 text-secondary rounded-xl hover:bg-secondary/5 transition-colors text-sm"
        >
          + Choose a destination to compare
        </button>
      )}

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-primary">Select destination</h3>
              <button onClick={() => setShowPicker(false)}><X className="w-5 h-5 text-primary/50" /></button>
            </div>
            {regions.map(region => {
              const dests = filteredDestinations.filter(d => d.region === region);
              if (dests.length === 0) return null;
              return (
                <div key={region} className="mb-4">
                  <h4 className="text-sm font-medium text-primary/50 mb-2">{region}</h4>
                  {dests.map(d => (
                    <button
                      key={d.slug}
                      onClick={() => { setSelectedSlug(d.slug); setShowPicker(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors
                        ${selectedSlug === d.slug ? 'bg-secondary/10 text-secondary' : 'hover:bg-surface text-primary/70'}`}
                    >
                      {d.name}, {d.country}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedSlug && !comparison && !loading && (
        <div className="mt-3">
          <p className="text-sm text-primary/60 mb-2">
            Comparing with: <strong>{allDestinations.find(d => d.slug === selectedSlug)?.name}</strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCompare}
              className="flex-1 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary-600 transition-colors"
            >
              Generate Comparison
            </button>
            <button
              onClick={() => { setSelectedSlug(null); setComparison(null); }}
              className="px-3 py-2 border border-primary/10 rounded-lg text-sm text-primary/50 hover:bg-surface"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-3 animate-pulse space-y-2">
          <div className="h-4 bg-surface rounded w-full" />
          <div className="h-4 bg-surface rounded w-3/4" />
          <div className="h-4 bg-surface rounded w-5/6" />
        </div>
      )}

      {comparison && (
        <div className="mt-3">
          <div className="prose prose-sm max-w-none text-primary/80
            [&_h3]:font-serif [&_h3]:text-primary [&_h3]:mt-4 [&_h3]:mb-2
            [&_table]:w-full [&_th]:text-left [&_th]:p-2 [&_td]:p-2 [&_td]:text-sm
            [&_strong]:text-primary"
            dangerouslySetInnerHTML={{ __html: comparison }}
          />
          <button
            onClick={() => { setSelectedSlug(null); setComparison(null); }}
            className="mt-3 text-sm text-secondary hover:text-secondary-600"
          >
            Compare with another destination →
          </button>
        </div>
      )}
    </div>
  );
}
