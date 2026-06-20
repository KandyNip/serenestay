'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Destination } from '@/lib/types';

const DIMENSION_LABELS: Record<string, string> = {
  serenity: 'Serenity',
  nature: 'Nature',
  climate: 'Climate',
  affordability: 'Affordable',
  wellness: 'Wellness',
  community: 'Community',
  wifi: 'WiFi',
  visa: 'Visa',
  medical: 'Medical',
};

const DIMENSIONS = Object.keys(DIMENSION_LABELS);

// 4个品牌色，按顺序分配给目的地
const COLORS = ['#2D6A4F', '#D4A373', '#5B8FB9', '#c2785c'];

interface DestinationRadarProps {
  destinations: Destination[];
  showLegend?: boolean;
  activeIndex?: number | null;
  onActivate?: (index: number | null) => void;
}

export default function DestinationRadar({ destinations, showLegend = true, activeIndex, onActivate }: DestinationRadarProps) {
  // 构建recharts数据
  const data = DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = {
      dimension: DIMENSION_LABELS[dim],
    };
    destinations.forEach((dest) => {
      entry[dest.name] = (dest.scores as unknown as Record<string, number>)[dim];
    });
    return entry;
  });

  // 单目的地时显示shape描述
  const isSingle = destinations.length === 1;
  const singleDest = destinations[0];

  // 找出单目的地的最强和最弱维度
  const getShapeHint = () => {
    if (!isSingle || !singleDest) return null;
    const scores = Object.entries(singleDest.scores) as [string, number][];
    const sorted = [...scores].sort((a, b) => b[1] - a[1]);
    const strengths = sorted.filter(([, v]) => v >= 4).map(([k]) => DIMENSION_LABELS[k]);
    const weaknesses = sorted.filter(([, v]) => v <= 2).map(([k]) => DIMENSION_LABELS[k]);

    let hint = '';
    if (strengths.length > 0) hint += `🌿 Strong in ${strengths.slice(0, 2).join(' & ')}`;
    if (weaknesses.length > 0) hint += `${hint ? ' · ' : ''}⚠️ Low ${weaknesses.join(' & ')}`;
    return hint || null;
  };

  const shapeHint = getShapeHint();

  return (
    <div>
      <div style={{ width: '100%', height: isSingle ? 300 : 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              tickCount={6}
            />
            {destinations.map((dest, i) => {
              const isActive = activeIndex === i;
              const isDimmed = activeIndex !== null && activeIndex !== undefined && !isActive;
              return (
                <Radar
                  key={dest.id}
                  name={dest.name}
                  dataKey={dest.name}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={isSingle ? 0.15 : isActive ? 0.2 : isDimmed ? 0.02 : 0.08}
                  strokeWidth={isActive ? 3 : isDimmed ? 1 : 2}
                  strokeOpacity={isDimmed ? 0.3 : 1}
                />
              );
            })}
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              formatter={(value, name) => [`${value}/5`, name]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 单目的地：shape hint */}
      {shapeHint && (
        <p className="text-center text-xs text-primary/50 mt-2" style={{ fontFamily: 'system-ui' }}>
          {shapeHint}
        </p>
      )}

      {/* 多目的地：legend chips */}
      {!isSingle && showLegend && (
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {destinations.map((dest, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={dest.id}
                onClick={() => onActivate?.(isActive ? null : i)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer"
                style={{
                  backgroundColor: isActive ? `${COLORS[i]}25` : `${COLORS[i]}15`,
                  color: COLORS[i],
                  outline: isActive ? `2px solid ${COLORS[i]}40` : 'none',
                }}
              >
                <span
                  className="inline-block w-3 h-0.5 rounded"
                  style={{ backgroundColor: COLORS[i] }}
                />
                {dest.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
