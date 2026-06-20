'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Destination } from '@/lib/types';

interface RadarChartPreviewProps {
  destinations: Destination[];
}

const COLORS = ['#2D6A4F', '#D4A373', '#5B8FB9'];

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

export default function RadarChartPreview({ destinations }: RadarChartPreviewProps) {
  const top3 = destinations.slice(0, 3);

  // Build data array: one entry per dimension
  const data = DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = {
      dimension: DIMENSION_LABELS[dim],
    };
    top3.forEach((dest) => {
      entry[dest.name] = (dest.scores as unknown as Record<string, number>)[dim];
    });
    return entry;
  });

  return (
    <section className="py-16 bg-surface">
      <div className="container-full px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-primary">
            See the Difference
          </h2>
          <p className="mt-2 text-primary/60 text-sm">
            Not all healing stays are created equal — see how they compare across 9 dimensions
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              {top3.map((dest, i) => (
                <Radar
                  key={dest.id}
                  name={dest.name}
                  dataKey={dest.name}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
