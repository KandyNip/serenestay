'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DNAProfile, ScoreKey } from '@/lib/dna-quiz';
import { addFavorite, removeFavorite, getFavorites } from '@/lib/favorites';

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

// Country flag emoji mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'Thailand': '🇹🇭', 'Indonesia': '🇮🇩', 'Vietnam': '🇻🇳', 'Japan': '🇯🇵',
  'Portugal': '🇵🇹', 'Spain': '🇪🇸', 'Mexico': '🇲🇽', 'Costa Rica': '🇨🇷',
  'Malaysia': '🇲🇾', 'Sri Lanka': '🇱🇰', 'Nepal': '🇳🇵', 'India': '🇮🇳',
  'Greece': '🇬🇷', 'Italy': '🇮🇹', 'Turkey': '🇹🇷', 'Morocco': '🇲🇦',
  'Colombia': '🇨🇴', 'Peru': '🇵🇪', 'Argentina': '🇦🇷', 'Brazil': '🇧🇷',
  'Philippines': '🇵🇭', 'Cambodia': '🇰🇭', 'Laos': '🇱🇦', 'Myanmar': '🇲🇲',
  'South Korea': '🇰🇷', 'Taiwan': '🇹🇼', 'China': '🇨🇳', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Netherlands': '🇳🇱', 'Czech Republic': '🇨🇿',
  'Hungary': '🇭🇺', 'Poland': '🇵🇱', 'Croatia': '🇭🇷', 'Malta': '🇲🇹',
  'Cyprus': '🇨🇾', 'Georgia': '🇬🇪', 'Armenia': '🇦🇲', 'Bali': '🇮🇩',
  'New Zealand': '🇳🇿', 'Australia': '🇦🇺', 'Canada': '🇨🇦', 'USA': '🇺🇸',
  'South Africa': '🇿🇦', 'Kenya': '🇰🇪', 'Tanzania': '🇹🇿', 'Mauritius': '🇲🇺',
  'Egypt': '🇪🇬', 'Jordan': '🇯🇴', 'UAE': '🇦🇪', 'Oman': '🇴🇲',
};

const DEST_COLORS = ['#2D6A4F', '#D4A373', '#5B8FB9', '#c2785c', '#7B68EE'];

const SUGGESTION_CHIPS = [
  'Budget under $700/mo',
  'Need strong WiFi',
  'Visa-friendly',
  'Best for yoga',
];

interface Match {
  slug: string;
  name: string;
  country: string;
  matchScore: number;
  topTags: string[];
  monthlyCostMid: number;
  scores: Record<ScoreKey, number>;
  emotionalTagline: string;
  image: string | null;
}

interface CompassMatchProps {
  profile: DNAProfile;
  onWeightsChange: (weights: Record<ScoreKey, number>) => void;
  onBack?: () => void;
  isPro?: boolean;
}

export default function CompassMatch({ profile, onWeightsChange, onBack, isPro = false }: CompassMatchProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [requiredGeoTags, setRequiredGeoTags] = useState<string[]>([]);

  // Free users see top 3 matches; Pro sees all 5
  const displayMatches = isPro ? matches.slice(0, 5) : matches.slice(0, 3);
  // Radar chart: show top 3 destinations for all users
  const radarDests = matches.slice(0, 3);

  const fetchMatches = useCallback(async (weights: Record<ScoreKey, number>, geoTags: string[] = []) => {
    setLoading(true);
    try {
      const res = await fetch('/api/dna-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights, requiredGeoTags: geoTags }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('[CompassMatch] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(profile.weights, []);
    // Load saved favorites
    const favs = getFavorites();
    setSaved(new Set(favs));
  }, [profile.weights, fetchMatches]);

  const handleSend = async () => {
    if (!chatInput.trim() || adjusting) return;
    setAdjusting(true);
    setAdjustMessage(null);

    try {
      const res = await fetch('/api/dna-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, currentWeights: profile.weights }),
      });
      const data = await res.json();

      if (data.adjustedWeights) {
        onWeightsChange(data.adjustedWeights);

        // 更新硬约束（geoTags）
        const newGeoTags = data.requiredGeoTags || [];
        setRequiredGeoTags(newGeoTags);

        // 重新获取匹配结果
        fetchMatches(data.adjustedWeights, newGeoTags);

        // 构建消息
        let message = `🔄 Compass Updated — ${data.explanation}`;
        if (newGeoTags.length > 0) {
          message += ` 📍 Filtering for: ${newGeoTags.join(', ')}`;
        }
        setAdjustMessage(message);
      }
      setChatInput('');
    } catch (err) {
      console.error('[CompassMatch] adjust error:', err);
      setAdjustMessage('❌ Something went wrong. Please try again.');
    } finally {
      setAdjusting(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setChatInput(chip);
  };

  const handleToggleSave = (slug: string) => {
    if (saved.has(slug)) {
      removeFavorite(slug);
      setSaved((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    } else {
      addFavorite(slug);
      setSaved((prev) => new Set(prev).add(slug));
    }
  };

  const toggleCompare = (slug: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  };

  // Build radar chart data: user profile + top destinations (using slug as dataKey)
  const buildRadarData = () => {
    const topDests = radarDests;
    return DIMENSIONS.map((dim) => {
      const entry: Record<string, string | number> = {
        dimension: DIMENSION_LABELS[dim],
        userDna: profile.weights[dim],
      };
      topDests.forEach((dest) => {
        entry[dest.slug] = dest.scores[dim] * 2; // Scale 1-5 to 2-10 for comparison
      });
      return entry;
    });
  };

  const getFlag = (country: string) => COUNTRY_FLAGS[country] || '🌍';

  return (
    <div className="min-h-screen bg-[#FEFAE0] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Bug 1: Back button */}
        <div className="mb-4">
          <button
            onClick={onBack}
            className="text-sm text-[#1B4332]/50 hover:text-[#52B788] transition-colors flex items-center gap-1"
          >
            ← Adjust DNA
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#1B4332] mb-2">
            Your Healing Compass
          </h1>
          <p className="text-[#1B4332]/60 text-sm">
            {profile.emoji} {profile.type} — Top matches based on your DNA
          </p>
        </div>

        {/* Radar overlay chart */}
        {!loading && matches.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={buildRadarData()} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 8, fill: '#94a3b8' }} tickCount={6} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FEFAE0',
                      border: '1px solid #1B433220',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'Your DNA') return [value, name];
                      const dest = matches.find(d => d.slug === name);
                      return [value, dest?.name || name];
                    }}
                  />
                  {/* User profile - dashed */}
                  <Radar
                    name="Your DNA"
                    dataKey="userDna"
                    stroke="#52B788"
                    fill="#52B788"
                    fillOpacity={0}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  {/* Top destinations - solid */}
                  {radarDests.map((dest, i) => (
                    <Radar
                      key={dest.slug}
                      name={dest.slug}
                      dataKey={dest.slug}
                      stroke={DEST_COLORS[i]}
                      fill={DEST_COLORS[i]}
                      fillOpacity={0.08}
                      strokeWidth={2.5}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#52B788]">
                <span className="inline-block w-4 h-0.5 rounded" style={{ backgroundColor: '#52B788', borderTop: '1px dashed #52B788' }} />
                Your DNA
              </span>
              {radarDests.map((dest, i) => (
                <span key={dest.slug} className="inline-flex items-center gap-1.5 text-xs" style={{ color: DEST_COLORS[i] }}>
                  <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: DEST_COLORS[i] }} />
                  {dest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-[#1B4332]/40">
            <div className="animate-pulse text-2xl mb-2">🧭</div>
            Finding your matches...
          </div>
        )}

        {/* Adjustment message */}
        {adjustMessage && (
          <div className="bg-[#52B78815] border border-[#52B78840] rounded-lg px-4 py-3 mb-6 text-sm text-[#1B4332]">
            {adjustMessage}
          </div>
        )}

        {/* Geo filter indicator */}
        {requiredGeoTags.length > 0 && (
          <div className="bg-[#D4A37315] border border-[#D4A37340] rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <span className="text-sm text-[#1B4332]">
              📍 Filtering for: {requiredGeoTags.join(', ')}
            </span>
            <button
              onClick={() => {
                setRequiredGeoTags([]);
                fetchMatches(profile.weights, []);
              }}
              className="text-xs px-3 py-1 rounded border border-[#1B433230] text-[#1B4332]/60 hover:border-red-400 hover:text-red-400 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Top match cards */}
        {!loading && (
          <div className="space-y-3 mb-8">
            {displayMatches.map((match, i) => (
              <div
                key={match.slug}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#52B788] flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Rank */}
                <div className="text-2xl font-bold text-[#1B4332]/20 w-8 text-center shrink-0">
                  {i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/destinations/${match.slug}`} className="block group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getFlag(match.country)}</span>
                      <span className="font-medium text-[#1B4332] group-hover:text-[#52B788] transition-colors truncate">
                        {match.name}
                      </span>
                      <span className="text-xs text-[#1B4332]/40">{match.country}</span>
                    </div>
                    <p className="text-xs text-[#1B4332]/50 truncate">{match.emotionalTagline}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {match.topTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#52B78810] text-[#52B788]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </div>

                {/* Match score + actions */}
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-[#52B788]">{match.matchScore}%</div>
                  <div className="flex gap-1 mt-1">
                    {/* Save button */}
                    {!saved.has(match.slug) ? (
                      <button
                        onClick={() => handleToggleSave(match.slug)}
                        className="text-[10px] px-2 py-0.5 rounded border border-[#1B433230] text-[#1B4332]/50 hover:border-[#52B788] hover:text-[#52B788] transition-colors"
                      >
                        ♡ Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleSave(match.slug)}
                        className="text-[10px] px-2 py-0.5 rounded border border-[#52B78840] text-[#52B788] hover:text-red-400 hover:border-red-400 transition-colors"
                      >
                        ♥ Saved
                      </button>
                    )}
                    {/* Compare button */}
                    <button
                      onClick={() => toggleCompare(match.slug)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        selectedForCompare.includes(match.slug)
                          ? 'border-[#52B788] bg-[#52B78815] text-[#52B788]'
                          : 'border-[#1B433230] text-[#1B4332]/50 hover:border-[#52B788] hover:text-[#52B788]'
                      }`}
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compare button — Bug 4 fix: link to destination detail page */}
        {selectedForCompare.length >= 2 && (
          <div className="text-center mb-8">
            <Link
              href={`/destinations/${selectedForCompare[0]}?compare=${selectedForCompare.slice(1).join(',')}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B4332] text-[#FEFAE0] font-medium hover:bg-[#1B4332]/90 transition-colors"
            >
              Compare {selectedForCompare.length} Destinations →
            </Link>
          </div>
        )}

        {/* Healing journey upgrade prompt for Free users */}
        {!isPro && matches.length > 0 && (
          <div className="mb-8 text-center">
            <Link
              href="/pricing"
              className="text-sm text-[#D4A373] hover:text-[#D4A373]/80 transition-colors"
            >
              Unlock your personalized healing journey — upgrade to Pro ✦
            </Link>
          </div>
        )}

        {/* Save prompt */}
        {matches.length > 0 && !saved.has(matches[0]?.slug) && (
          <div className="bg-white rounded-xl p-5 shadow-sm mb-8 text-center">
            <p className="text-[#1B4332] mb-3">❤️ Love this match? Save to Favorites</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleToggleSave(matches[0].slug)}
                className="px-4 py-2 rounded-lg bg-[#1B4332] text-[#FEFAE0] text-sm hover:bg-[#1B4332]/90 transition-colors"
              >
                Save to Favorites
              </button>
              <Link
                href="/destinations"
                className="px-4 py-2 rounded-lg border border-[#1B433240] text-[#1B4332] text-sm hover:border-[#52B788] hover:bg-[#52B78810] transition-colors"
              >
                Compare Others
              </Link>
            </div>
          </div>
        )}

        {/* Talk to AI */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-serif text-lg text-[#1B4332] mb-3">Talk to AI</h3>

          <p className="text-xs text-[#1B4332]/50 mb-3">
            Adjust your preferences in natural language
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#1B433230] text-[#1B4332]/60 hover:border-[#52B788] hover:text-[#52B788] hover:bg-[#52B78810] transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell me what you're looking for..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#FEFAE0] border border-[#1B433220] text-sm text-[#1B4332] placeholder:text-[#1B4332]/30 focus:outline-none focus:border-[#52B788]"
              disabled={adjusting}
            />
            <button
              onClick={handleSend}
              disabled={adjusting || !chatInput.trim()}
              className="px-4 py-2.5 rounded-lg bg-[#1B4332] text-[#FEFAE0] text-sm hover:bg-[#1B4332]/90 disabled:opacity-40 transition-colors"
            >
              {adjusting ? '...' : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
