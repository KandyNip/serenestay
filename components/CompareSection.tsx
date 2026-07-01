'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftRight, X, Check, Leaf, Split, AlertTriangle } from 'lucide-react';
import DestinationRadar from '@/components/DestinationRadar';
import type { Destination } from '@/lib/types';

const COLORS = ['var(--color-canopy)', 'var(--color-sand)', 'var(--color-sky)', 'var(--color-terracotta)'];
const MAX_COMPARE = 4;

interface CompareSectionProps {
  currentSlug: string;
  currentName: string;
}

interface CompareResult {
  recommendation: string;
  keyDifferences: string[];
  headsUp: string;
}

function parseCompareResult(raw: string): CompareResult {
  const result: CompareResult = {
    recommendation: '',
    keyDifferences: [],
    headsUp: '',
  };

  const recMatch = raw.match(/\[RECOMMENDATION\]([\s\S]*?)(?=\[KEY_DIFFERENCES\]|\[HEADS_UP\]|$)/i);
  const diffMatch = raw.match(/\[KEY_DIFFERENCES\]([\s\S]*?)(?=\[HEADS_UP\]|$)/i);
  const warnMatch = raw.match(/\[HEADS_UP\]([\s\S]*?)$/i);

  if (recMatch) result.recommendation = recMatch[1].trim();
  if (diffMatch) {
    result.keyDifferences = diffMatch[1]
      .split('\n')
      .map(l => l.replace(/^[-•*]\s*/, '').trim())
      .filter(l => l.length > 0);
  }
  if (warnMatch) result.headsUp = warnMatch[1].trim();

  if (!result.recommendation && !result.keyDifferences.length && !result.headsUp) {
    result.recommendation = raw.trim();
  }

  return result;
}

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

const modalGlass = {
  background: 'rgba(14,36,25,0.95)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

export default function CompareSection({ currentSlug, currentName }: CompareSectionProps) {
  const searchParams = useSearchParams();
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [rawComparison, setRawComparison] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRadarIndex, setActiveRadarIndex] = useState<number | null>(null);

  useEffect(() => {
    const compareParam = searchParams.get('compare');
    if (compareParam) {
      const slugs = compareParam.split(',').filter(s => s !== currentSlug);
      setSelectedSlugs(slugs.slice(0, MAX_COMPARE - 1));
    }
  }, [searchParams, currentSlug]);

  useEffect(() => {
    fetch('/api/destinations?fields=card')
      .then(r => r.json())
      .then((data: { destinations: Destination[] }) => setAllDestinations(data.destinations || []))
      .catch(() => {});
  }, []);

  const selectedDestinations = [
    ...allDestinations.filter(d => d.slug === currentSlug),
    ...allDestinations.filter(d => selectedSlugs.includes(d.slug)),
  ];
  const allCompareSlugs = [currentSlug, ...selectedSlugs];

  const toggleSlug = (slug: string) => {
    if (slug === currentSlug) return;
    setSelectedSlugs(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : prev.length < MAX_COMPARE - 1
          ? [...prev, slug]
          : prev
    );
  };

  const handleCompare = async () => {
    if (allCompareSlugs.length < 2) return;
    setLoading(true);
    setRawComparison(null);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: allCompareSlugs }),
      });
      const data = await res.json();
      if (data.comparison) setRawComparison(data.comparison);
    } catch {} finally { setLoading(false); }
  };

  const reset = () => {
    setSelectedSlugs([]);
    setRawComparison(null);
  };

  const regions = [...new Set(allDestinations.map(d => d.region))];
  const filteredDestinations = allDestinations.filter(d => d.slug !== currentSlug);
  const canCompare = allCompareSlugs.length >= 2;

  const parsedResult = rawComparison ? parseCompareResult(rawComparison) : null;

  return (
    <div style={glassCard}>
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeftRight className="w-5 h-5" style={{ color: 'var(--color-sky)' }} />
          Compare {currentName}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => setActiveRadarIndex(activeRadarIndex === 0 ? null : 0)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 500, padding: '6px 12px',
              borderRadius: '9999px', transition: 'all 0.2s', cursor: 'pointer', border: 'none',
              backgroundColor: activeRadarIndex === 0 ? 'rgba(91,143,168,0.25)' : 'rgba(107,158,126,0.15)',
              color: 'var(--color-canopy)',
              outline: activeRadarIndex === 0 ? '2px solid rgba(91,143,168,0.4)' : 'none',
            }}
          >
            <span style={{ display: 'inline-block', width: '12px', height: '2px', borderRadius: '1px', backgroundColor: 'var(--color-canopy)' }} />
            {currentName}
          </button>
          {selectedSlugs.map((slug, i) => {
            const dest = allDestinations.find(d => d.slug === slug);
            if (!dest) return null;
            const colorIdx = i + 1;
            const chipColors = ['var(--color-sand)', 'var(--color-sky)', 'var(--color-terracotta)'];
            const chipColor = chipColors[i] || 'var(--color-sky)';
            return (
              <span
                key={slug}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: 500, padding: '6px 12px',
                  borderRadius: '9999px', transition: 'all 0.2s', cursor: 'pointer',
                  backgroundColor: activeRadarIndex === colorIdx ? `${chipColor}25` : `${chipColor}15`,
                  color: chipColor,
                  outline: activeRadarIndex === colorIdx ? `2px solid ${chipColor}40` : 'none',
                }}
                onClick={() => setActiveRadarIndex(activeRadarIndex === colorIdx ? null : colorIdx)}
              >
                <span style={{ display: 'inline-block', width: '12px', height: '2px', borderRadius: '1px', backgroundColor: chipColor }} />
                {dest.name}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSlug(slug); }}
                  style={{ marginLeft: '2px', opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          {allCompareSlugs.length < MAX_COMPARE && (
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', alignSelf: 'center', marginLeft: '4px' }}>
              + {MAX_COMPARE - allCompareSlugs.length} more
            </span>
          )}
        </div>

        {!rawComparison && !loading && (
          <button
            onClick={() => setShowPicker(true)}
            style={{
              width: '100%', padding: '10px',
              border: '2px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)',
              borderRadius: '12px', fontSize: '14px', marginBottom: '12px',
              background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            + Add destinations to compare
          </button>
        )}

        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowPicker(false)}>
            <div style={modalGlass} className="max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div style={{ padding: '24px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)' }}>Select destinations</h3>
                  <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>Choose up to {MAX_COMPARE - 1} destinations to compare with {currentName}</p>
                {regions.map(region => {
                  const dests = filteredDestinations.filter(d => d.region === region);
                  if (dests.length === 0) return null;
                  return (
                    <div key={region} style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{region}</h4>
                      {dests.map(d => {
                        const isSelected = selectedSlugs.includes(d.slug);
                        return (
                          <button
                            key={d.slug}
                            onClick={() => toggleSlug(d.slug)}
                            style={{
                              width: '100%', textAlign: 'left', padding: '8px 12px',
                              borderRadius: '8px', fontSize: '14px', marginBottom: '4px',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'background 0.2s', border: 'none', cursor: 'pointer',
                              background: isSelected ? 'rgba(91,143,168,0.15)' : 'transparent',
                              color: isSelected ? 'var(--color-sky)' : 'rgba(255,255,255,0.7)',
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span>{d.name}, {d.country}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
                <button
                  onClick={() => setShowPicker(false)}
                  style={{
                    width: '100%', marginTop: '8px', padding: '8px',
                    background: 'var(--color-sky)', color: 'white',
                    borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {canCompare && !rawComparison && !loading && (
          <button
            onClick={handleCompare}
            style={{
              width: '100%', padding: '10px',
              background: 'var(--color-sky)', color: 'white',
              borderRadius: '12px', fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Compare {allCompareSlugs.length} Destinations
          </button>
        )}

        {loading && (
          <div style={{ marginTop: '12px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '75%' }} />
              <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '100%' }} />
              <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '83%' }} />
            </div>
          </div>
        )}

        {rawComparison && parsedResult && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <DestinationRadar destinations={selectedDestinations} showLegend={false} activeIndex={activeRadarIndex} onActivate={setActiveRadarIndex} />
            </div>

            {parsedResult.recommendation && (
              <div style={{ background: 'rgba(107,158,126,0.08)', borderLeft: '3px solid var(--color-moss)', borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-moss)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Leaf className="w-3.5 h-3.5" /> Recommendation
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{parsedResult.recommendation}</p>
              </div>
            )}

            {parsedResult.keyDifferences.length > 0 && (
              <div style={{ background: 'rgba(212,197,169,0.08)', borderLeft: '3px solid var(--color-sand)', borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sand)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Split className="w-3.5 h-3.5" /> Key Differences
                </div>
                <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, listStyle: 'none', padding: 0, margin: 0 }}>
                  {parsedResult.keyDifferences.map((diff, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: 'var(--color-sand)', marginTop: '2px' }}>•</span>
                      <span>{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {parsedResult.headsUp && (
              <div style={{ background: 'rgba(194,120,92,0.08)', borderLeft: '3px solid var(--color-terracotta)', borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-terracotta)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle className="w-3.5 h-3.5" /> Heads Up
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{parsedResult.headsUp}</p>
              </div>
            )}

            <button
              onClick={reset}
              style={{
                marginTop: '8px', fontSize: '14px', color: 'var(--color-sky)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              Compare with different destinations →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
