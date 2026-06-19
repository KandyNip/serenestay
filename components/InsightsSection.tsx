'use client';

import { useState, useEffect } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { checkProStatus } from '@/lib/api';

interface InsightsSectionProps {
  slug: string;
}

export default function InsightsSection({ slug }: InsightsSectionProps) {
  const [isPro, setIsPro] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsPro(checkProStatus());
  }, []);

  useEffect(() => {
    if (!isPro) return;
    setLoading(true);
    const proToken = localStorage.getItem('serenestay_pro_token') || '';
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, proToken }),
    })
      .then(r => r.json())
      .then(data => { if (data.insights) setInsights(data.insights); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isPro, slug]);

  if (!isPro) {
    // Free用户看到锁定卡片
    return (
      <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-2xl p-6 border border-secondary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-primary">AI Healing Insights</h3>
            <p className="text-sm text-primary/50">Pro exclusive</p>
          </div>
        </div>
        <p className="text-primary/60 text-sm mb-4">
          Unlock AI-powered insights — why this destination heals, who it's best for, and what to consider before booking.
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

  // Pro用户看到洞察内容
  return (
    <div>
      <h2 className="font-serif text-2xl text-primary mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-secondary" />
        AI Healing Insights
      </h2>
      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-card animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-surface rounded w-3/4" />
            <div className="h-4 bg-surface rounded w-full" />
            <div className="h-4 bg-surface rounded w-2/3" />
          </div>
        </div>
      ) : insights ? (
        <div className="bg-white rounded-2xl p-6 shadow-card prose prose-sm max-w-none text-primary/80
          [&_h3]:font-serif [&_h3]:text-primary [&_h3]:mt-4 [&_h3]:mb-2
          [&_table]:w-full [&_th]:text-left [&_th]:p-2 [&_td]:p-2 [&_td]:text-sm
          [&_strong]:text-primary">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-card text-primary/50 text-sm">
          Unable to load insights. Please try again.
        </div>
      )}
    </div>
  );
}
