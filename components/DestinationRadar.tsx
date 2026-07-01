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

const COLORS = ['#7EB5CC', '#6B9E7E', '#D4C5A9', '#c2785c'];

interface DestinationRadarProps {
  destinations: Destination[];
  showLegend?: boolean;
  activeIndex?: number | null;
  onActivate?: (index: number | null) => void;
}

export default function DestinationRadar({ destinations, showLegend = true, activeIndex, onActivate }: DestinationRadarProps) {
  const data = DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = {
      dimension: DIMENSION_LABELS[dim],
    };
    destinations.forEach((dest) => {
      entry[dest.name] = (dest.scores as unknown as Record<string, number>)[dim];
    });
    return entry;
  });

  const isSingle = destinations.length === 1;
  const singleDest = destinations[0];

  const getShapeHint = () => {
    if (!isSingle || !singleDest) return null;
    const scores = Object.entries(singleDest.scores) as [string, number][];
    const sorted = [...scores].sort((a, b) => b[1] - a[1]);
    const strengths = sorted.filter(([, v]) => v >= 4).map(([k]) => DIMENSION_LABELS[k]);
    const weaknesses = sorted.filter(([, v]) => v <= 2).map(([k]) => DIMENSION_LABELS[k]);

    let hint = '';
    if (strengths.length > 0) hint += `Strong in ${strengths.slice(0, 2).join(' & ')}`;
    if (weaknesses.length > 0) hint += `${hint ? ' · ' : ''}Lower in ${weaknesses.join(' & ')}`;
    return hint || null;
  };

  const shapeHint = getShapeHint();

  return (
    <div>
      <div style={{ width: '100%', height: isSingle ? 300 : 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }}
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
                  fillOpacity={isSingle ? 0.2 : isActive ? 0.25 : isDimmed ? 0.03 : 0.12}
                  strokeWidth={isActive ? 3 : isDimmed ? 1 : 2}
                  strokeOpacity={isDimmed ? 0.3 : 1}
                />
              );
            })}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(14,36,25,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#fff',
                fontFamily: 'var(--font-body)',
              }}
              formatter={(value, name) => [`${value}/5`, name]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {shapeHint && (
        <p
          className="text-center text-xs mt-2"
          style={{ color: 'var(--color-white-40)', fontFamily: 'var(--font-body)' }}
        >
          {shapeHint}
        </p>
      )}

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
                  backgroundColor: isActive ? `${COLORS[i]}30` : `${COLORS[i]}15`,
                  color: COLORS[i],
                  outline: isActive ? `2px solid ${COLORS[i]}50` : 'none',
                  fontFamily: 'var(--font-body)',
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
