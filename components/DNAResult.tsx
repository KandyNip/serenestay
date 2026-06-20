'use client';

import { useState, useEffect } from 'react';
import type { DNAProfile, ScoreKey } from '@/lib/dna-quiz';
import { QUICK_SHIFTS, applyQuickShift } from '@/lib/dna-quiz';

const DIMENSION_LABELS: Record<ScoreKey, string> = {
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

const DIMENSIONS: ScoreKey[] = ['serenity', 'nature', 'climate', 'affordability', 'wellness', 'community', 'wifi', 'visa', 'medical'];

interface DNAResultProps {
  profile: DNAProfile;
  onWeightsChange: (weights: Record<ScoreKey, number>) => void;
  onRetake: () => void;
  onViewMatches: () => void;
}

export default function DNAResult({ profile, onWeightsChange, onRetake, onViewMatches }: DNAResultProps) {
  const [weights, setWeights] = useState(profile.weights);

  useEffect(() => {
    setWeights(profile.weights);
  }, [profile]);

  const handleSliderChange = (dim: ScoreKey, value: number) => {
    const newWeights = { ...weights, [dim]: value };
    setWeights(newWeights);
    onWeightsChange(newWeights);
  };

  const handleQuickShift = (shift: typeof QUICK_SHIFTS[0]) => {
    if (!shift.delta) {
      onRetake();
      return;
    }
    const updated = applyQuickShift(profile, shift);
    setWeights(updated.weights);
    onWeightsChange(updated.weights);
  };

  // SVG 9边形罗盘预览
  const renderCompassPreview = () => {
    const cx = 120, cy = 120, r = 90;
    const angleStep = (2 * Math.PI) / 9;
    const startAngle = -Math.PI / 2;

    const points = DIMENSIONS.map((dim, i) => {
      const angle = startAngle + i * angleStep;
      const val = weights[dim] / 10;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const gridLevels = [0.25, 0.5, 0.75, 1];

    return (
      <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
        {/* Grid polygons */}
        {gridLevels.map((level) => {
          const gridPoints = DIMENSIONS.map((_, i) => {
            const angle = startAngle + i * angleStep;
            const x = cx + r * level * Math.cos(angle);
            const y = cy + r * level * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="#1B433215"
              strokeWidth="1"
            />
          );
        })}
        {/* Axis lines */}
        {DIMENSIONS.map((_, i) => {
          const angle = startAngle + i * angleStep;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1B433210" strokeWidth="1" />
          );
        })}
        {/* Data polygon */}
        <polygon
          points={points}
          fill="#52B78830"
          stroke="#52B788"
          strokeWidth="2"
        />
        {/* Axis labels */}
        {DIMENSIONS.map((dim, i) => {
          const angle = startAngle + i * angleStep;
          const labelR = r + 18;
          const x = cx + labelR * Math.cos(angle);
          const y = cy + labelR * Math.sin(angle);
          return (
            <text
              key={dim}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#1B4332"
              opacity="0.6"
            >
              {DIMENSION_LABELS[dim]}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#FEFAE0] px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* 顶部返回按钮 */}
        <div className="mb-4">
          <button
            onClick={onRetake}
            className="text-sm text-[#1B4332]/50 hover:text-[#52B788] transition-colors flex items-center gap-1"
          >
            ← Retake Test
          </button>
        </div>

        {/* Personality type header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{profile.emoji}</div>
          <h1 className="font-serif text-3xl text-[#1B4332] mb-2">
            {profile.type}
          </h1>
          <p className="text-[#1B4332]/70 text-sm mb-4">
            {profile.description}
          </p>
          {/* Traits */}
          <div className="flex flex-wrap justify-center gap-2">
            {profile.traits.map((trait) => (
              <span
                key={trait}
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: '#52B78815', color: '#52B788' }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Compass preview */}
        <div className="mb-8">
          {renderCompassPreview()}
        </div>

        {/* 9 dimension sliders */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h3 className="font-serif text-lg text-[#1B4332] mb-4">Fine-tune Your DNA</h3>
          <div className="space-y-3">
            {DIMENSIONS.map((dim) => (
              <div key={dim} className="flex items-center gap-3">
                <span className="w-20 text-xs text-[#1B4332]/70 text-right shrink-0">
                  {DIMENSION_LABELS[dim]}
                </span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={weights[dim]}
                  onChange={(e) => handleSliderChange(dim, Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: '#52B788',
                    background: `linear-gradient(to right, #52B788 0%, #52B788 ${((weights[dim] - 1) / 9) * 100}%, #1B433215 ${((weights[dim] - 1) / 9) * 100}%, #1B433215 100%)`,
                  }}
                />
                <span className="w-5 text-xs text-[#1B4332]/50 text-center">
                  {weights[dim]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Shift buttons */}
        <div className="mb-6">
          <h3 className="font-serif text-sm text-[#1B4332]/60 mb-3">Quick Adjustments</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_SHIFTS.map((shift) => (
              <button
                key={shift.label}
                onClick={() => handleQuickShift(shift)}
                className="text-sm px-3 py-2.5 rounded-lg border border-[#1B433240] text-[#1B4332] hover:border-[#52B788] hover:bg-[#52B78810] transition-all"
              >
                {shift.label}
              </button>
            ))}
          </div>
        </div>

        {/* Social share card (UI only) */}
        <div
          className="rounded-xl p-5 mb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1B433210, #52B78810)' }}
        >
          <p className="text-2xl mb-1">{profile.emoji}</p>
          <p className="font-serif text-lg text-[#1B4332] mb-1">I'm a {profile.type}</p>
          <p className="text-xs text-[#1B4332]/50 mb-4">What's your healing type?</p>
          <div className="flex justify-center gap-3">
            <button className="text-xs px-3 py-1.5 rounded-full bg-black text-white hover:bg-black/80 transition-colors">
              𝕏 Post
            </button>
            <button className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 text-white hover:opacity-80 transition-opacity">
              IG Story
            </button>
            <button className="text-xs px-3 py-1.5 rounded-full border border-[#1B433240] text-[#1B4332] hover:bg-[#1B433210] transition-colors">
              Copy Link
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onViewMatches}
          className="w-full py-4 rounded-xl bg-[#1B4332] text-[#FEFAE0] font-medium text-lg hover:bg-[#1B4332]/90 transition-colors shadow-lg"
        >
          Discover Your Matches →
        </button>
      </div>
    </div>
  );
}
