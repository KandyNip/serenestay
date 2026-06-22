'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GitCompare, X, Check } from 'lucide-react';
import DestinationRadar from '@/components/DestinationRadar';
import type { Destination } from '@/lib/types';

const COLORS = ['#2D6A4F', '#D4A373', '#5B8FB9', '#c2785c'];
const MAX_COMPARE = 4;

interface CompareSectionProps {
  currentSlug: string;
  currentName: string;
}

// AI总结的结构化类型
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

  // 按section标记解析
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

  // fallback: 如果解析失败，整段作为recommendation
  if (!result.recommendation && !result.keyDifferences.length && !result.headsUp) {
    result.recommendation = raw.trim();
  }

  return result;
}

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

  // 获取已选目的地的完整数据（currentSlug排第一）
  const selectedDestinations = [
    ...allDestinations.filter(d => d.slug === currentSlug),
    ...allDestinations.filter(d => selectedSlugs.includes(d.slug)),
  ];
  const allCompareSlugs = [currentSlug, ...selectedSlugs];

  const toggleSlug = (slug: string) => {
    if (slug === currentSlug) return; // 当前目的地不可取消
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

  // 按region分组
  const regions = [...new Set(allDestinations.map(d => d.region))];
  const filteredDestinations = allDestinations.filter(d => d.slug !== currentSlug);
  const canCompare = allCompareSlugs.length >= 2;

  // 解析AI结果
  const parsedResult = rawComparison ? parseCompareResult(rawComparison) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      <h3 className="font-serif text-xl text-primary mb-4 flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-secondary" />
        Compare {currentName}
      </h3>

      {/* 已选chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* 当前目的地chip（不可删除） */}
        <button
          onClick={() => setActiveRadarIndex(activeRadarIndex === 0 ? null : 0)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer"
          style={{
            backgroundColor: activeRadarIndex === 0 ? `${COLORS[0]}25` : `${COLORS[0]}15`,
            color: COLORS[0],
            outline: activeRadarIndex === 0 ? `2px solid ${COLORS[0]}40` : 'none',
          }}
        >
          <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: COLORS[0] }} />
          {currentName}
        </button>
        {/* 用户选的目的地chips */}
        {selectedSlugs.map((slug, i) => {
          const dest = allDestinations.find(d => d.slug === slug);
          if (!dest) return null;
          const colorIdx = i + 1; // 第0个是current
          return (
            <span
              key={slug}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{
                backgroundColor: activeRadarIndex === colorIdx ? `${COLORS[colorIdx]}25` : `${COLORS[colorIdx]}15`,
                color: COLORS[colorIdx],
                outline: activeRadarIndex === colorIdx ? `2px solid ${COLORS[colorIdx]}40` : 'none',
                cursor: 'pointer',
              }}
              onClick={() => setActiveRadarIndex(activeRadarIndex === colorIdx ? null : colorIdx)}
            >
              <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: COLORS[colorIdx] }} />
              {dest.name}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSlug(slug); }}
                className="ml-0.5 opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        {allCompareSlugs.length < MAX_COMPARE && (
          <span className="text-xs text-primary/40 self-center ml-1">
            + {MAX_COMPARE - allCompareSlugs.length} more
          </span>
        )}
      </div>

      {/* 添加按钮 */}
      {!rawComparison && !loading && (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-2.5 border-2 border-dashed border-secondary/30 text-secondary rounded-xl hover:bg-secondary/5 transition-colors text-sm mb-3"
        >
          + Add destinations to compare
        </button>
      )}

      {/* 多选Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-primary">Select destinations</h3>
              <button onClick={() => setShowPicker(false)}><X className="w-5 h-5 text-primary/50" /></button>
            </div>
            <p className="text-xs text-primary/50 mb-3">Choose up to {MAX_COMPARE - 1} destinations to compare with {currentName}</p>
            {regions.map(region => {
              const dests = filteredDestinations.filter(d => d.region === region);
              if (dests.length === 0) return null;
              return (
                <div key={region} className="mb-4">
                  <h4 className="text-sm font-medium text-primary/50 mb-2">{region}</h4>
                  {dests.map(d => {
                    const isSelected = selectedSlugs.includes(d.slug);
                    return (
                      <button
                        key={d.slug}
                        onClick={() => toggleSlug(d.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center justify-between transition-colors
                          ${isSelected ? 'bg-secondary/10 text-secondary' : 'hover:bg-surface text-primary/70'}`}
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
              className="w-full mt-2 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Compare按钮 */}
      {canCompare && !rawComparison && !loading && (
        <button
          onClick={handleCompare}
          className="w-full py-2.5 bg-secondary text-white rounded-lg text-sm hover:bg-secondary-600 transition-colors"
        >
          Compare {allCompareSlugs.length} Destinations
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-3 animate-pulse space-y-2">
          <div className="h-4 bg-surface rounded w-full" />
          <div className="h-4 bg-surface rounded w-3/4" />
          <div className="h-4 bg-surface rounded w-5/6" />
        </div>
      )}

      {/* 对比结果 */}
      {rawComparison && parsedResult && (
        <div className="mt-4">
          {/* 雷达图 */}
          <div className="bg-surface/50 rounded-xl p-4 mb-4">
            <DestinationRadar destinations={selectedDestinations} showLegend={false} activeIndex={activeRadarIndex} onActivate={setActiveRadarIndex} />
          </div>

          {/* 精简AI总结 */}
          {parsedResult.recommendation && (
            <div className="bg-[#2D6A4F]/5 border-l-[3px] border-[#2D6A4F] rounded-r-lg px-4 py-3 mb-3">
              <div className="text-xs font-semibold text-[#2D6A4F] mb-1" style={{ fontFamily: 'system-ui' }}>🌿 Recommendation</div>
              <p className="text-sm text-primary/80 leading-relaxed" style={{ fontFamily: 'system-ui' }}>{parsedResult.recommendation}</p>
            </div>
          )}

          {parsedResult.keyDifferences.length > 0 && (
            <div className="bg-[#D4A373]/5 border-l-[3px] border-[#D4A373] rounded-r-lg px-4 py-3 mb-3">
              <div className="text-xs font-semibold text-[#b8860b] mb-1" style={{ fontFamily: 'system-ui' }}>⚡ Key Differences</div>
              <ul className="text-sm text-primary/80 leading-relaxed space-y-1" style={{ fontFamily: 'system-ui' }}>
                {parsedResult.keyDifferences.map((diff, i) => (
                  <li key={i}>• {diff}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedResult.headsUp && (
            <div className="bg-red-50 border-l-[3px] border-red-400 rounded-r-lg px-4 py-3 mb-3">
              <div className="text-xs font-semibold text-red-600 mb-1" style={{ fontFamily: 'system-ui' }}>⚠️ Heads Up</div>
              <p className="text-sm text-primary/80 leading-relaxed" style={{ fontFamily: 'system-ui' }}>{parsedResult.headsUp}</p>
            </div>
          )}

          <button
            onClick={reset}
            className="mt-2 text-sm text-secondary hover:text-secondary-600"
          >
            Compare with different destinations →
          </button>
        </div>
      )}
    </div>
  );
}
