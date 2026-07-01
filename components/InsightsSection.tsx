'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
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
      <h2
        className="text-2xl mb-4 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
      >
        <Eye className="w-6 h-6" style={{ color: 'var(--color-moss)' }} />
        Local Healing Insights
      </h2>
      {loading ? (
        <div
          className="rounded-2xl p-6 animate-pulse"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div className="space-y-3">
            <div className="h-4 rounded w-3/4" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-4 rounded w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-4 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </div>
      ) : insights ? (
        <div
          className="rounded-2xl p-6 prose prose-sm max-w-none leading-relaxed"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            color: 'rgba(255,255,255,0.75)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <h3 className="text-lg mt-4 mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>{children}</h3>
              ),
              strong: ({ children }) => <strong style={{ color: 'var(--color-white)' }}>{children}</strong>,
              p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
              table: ({ children }) => <table className="w-full text-sm my-4">{children}</table>,
              th: ({ children }) => <th className="text-left p-2 text-xs uppercase tracking-wide" style={{ color: 'var(--color-moss)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{children}</th>,
              td: ({ children }) => <td className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{children}</td>,
            }}
          >
            {insights}
          </ReactMarkdown>
        </div>
      ) : (
        <div
          className="rounded-2xl p-6 text-sm"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Unable to load insights. Please try again.
        </div>
      )}
    </div>
  );
}
