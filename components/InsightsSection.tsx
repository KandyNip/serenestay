'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InsightsSectionProps {
  slug: string;
}

export default function InsightsSection({ slug }: InsightsSectionProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then(r => r.json())
      .then(data => { if (data.insights) setInsights(data.insights); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

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
