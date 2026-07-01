'use client';

import { useState, useEffect } from 'react';
import { Lock, Leaf, Map, CalendarDays, Compass, Info, MessageCircle, Bookmark, BookmarkCheck, Sun, Sunrise, Sunset, ChevronDown, ChevronUp, ChevronsUpDown, ChevronsDownUp, Heart, Trees, Theater, Wifi, DollarSign, Cloud, Star, ClipboardList, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { checkProStatus } from '@/lib/api';
import { getCategoryImage, getCategoryIconName } from '@/lib/itinerary-images';
import LucideIcon from './LucideIcon';
import { saveItinerary, removeItinerary, getSavedItineraries, getPlannedPhasesForDestination, generatePlannedPhasesSummary } from '@/lib/itinerary-storage';

interface ItinerarySectionProps {
  slug: string;
  name: string;
}

interface Destination {
  name: string;
  images: string[];
  scores: Record<string, number>;
  bestSeason: { months: string[]; description: string };
  monthlyCost: { budget: number; mid: number; comfort: number; currency: string };
  tagline: string;
}

interface Activity {
  time: 'morning' | 'afternoon' | 'evening';
  title: string;
  description: string;
  wikiTag?: string;
  catTag?: string;
  imageUrl?: string;
}

interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

interface ParsedItinerary {
  overview: string;
  beforeYouGo: Record<string, string>;
  days: DayPlan[];
  budget: { category: string; budget: string; mid: string; comfort: string }[];
  wellnessFocus: string;
  practicalHeadsUp: string;
  finalNote: string;
}

const DURATION_OPTIONS = [
  { value: 3, label: '3 Days' },
  { value: 5, label: '5 Days' },
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 21, label: '21 Days' },
  { value: 30, label: '30 Days' },
  { value: 0, label: 'Custom' },
];

const FOCUS_OPTIONS = [
  { value: 'wellness', label: 'Wellness & Healing', icon: Heart },
  { value: 'nature', label: 'Nature & Adventure', icon: Trees },
  { value: 'culture', label: 'Culture & Community', icon: Theater },
  { value: 'nomad', label: 'Digital Nomad', icon: Wifi },
];

function parseItinerary(markdown: string): ParsedItinerary {
  const result: ParsedItinerary = {
    overview: '',
    beforeYouGo: {},
    days: [],
    budget: [],
    wellnessFocus: '',
    practicalHeadsUp: '',
    finalNote: '',
  };

  const overviewMatch = markdown.match(/###\s*Trip Overview\s*\n([\s\S]*?)(?=###|$)/i);
  if (overviewMatch) result.overview = overviewMatch[1].trim();

  const beforeMatch = markdown.match(/###\s*Before You Go\s*\n([\s\S]*?)(?=###|$)/i);
  if (beforeMatch) {
    const lines = beforeMatch[1].trim().split('\n');
    lines.forEach(line => {
      const m = line.match(/-\s*\*\*(.+?):\*\*\s*(.+)/);
      if (m) result.beforeYouGo[m[1].trim()] = m[2].trim();
    });
  }

  const dayRegex = /\*\*Day\s+(\d+):\s*(.+?)\*\*\s*\n([\s\S]*?)(?=\*\*Day\s+\d+:|###\s*Budget|$)/g;
  let dayMatch;
  while ((dayMatch = dayRegex.exec(markdown)) !== null) {
    const day: DayPlan = {
      day: parseInt(dayMatch[1]),
      theme: dayMatch[2].trim(),
      activities: [],
    };

    const activityLines = dayMatch[3].trim().split('\n');
    activityLines.forEach(line => {
      const timeMatch = line.match(/^[•\-\*]?\s*(Morning|Afternoon|Evening)\s*:\s*(.+)/i);
      if (timeMatch) {
        const timeLabel = timeMatch[1];
        const time = timeLabel.toLowerCase() === 'morning' ? 'morning' : timeLabel.toLowerCase() === 'afternoon' ? 'afternoon' : 'evening';
        let title = timeLabel.trim();
        let description = timeMatch[2].trim();

        title = title.replace(/\*\*/g, '');
        description = description.replace(/\*\*/g, '');

        let wikiTag: string | undefined;
        let catTag: string | undefined;
        const wikiMatch = description.match(/\[wiki:([^\]]+)\]/);
        const catMatch = description.match(/\[cat:([^\]]+)\]/);
        if (wikiMatch) {
          wikiTag = wikiMatch[1];
          description = description.replace(/\[wiki:[^\]]+\]/, '').trim();
        }
        if (catMatch) {
          catTag = catMatch[1];
          description = description.replace(/\[cat:[^\]]+\]/, '').trim();
        }

        day.activities.push({ time, title, description, wikiTag, catTag });
      }
    });

    result.days.push(day);
  }

  const budgetMatch = markdown.match(/###\s*Budget Breakdown[\s\S]*?\n\|[\s\S]*?\n\|[-\s|]*\n([\s\S]*?)(?=\n###|\n\*\*)/);
  if (budgetMatch) {
    const rows = budgetMatch[1].trim().split('\n');
    rows.forEach(row => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 4) {
        result.budget.push({
          category: cells[0].replace(/\*\*/g, ''),
          budget: cells[1].replace(/\*\*/g, ''),
          mid: cells[2].replace(/\*\*/g, ''),
          comfort: cells[3].replace(/\*\*/g, ''),
        });
      }
    });
  }

  const wellnessMatch = markdown.match(/###\s*Wellness Focus[\s\S]*?\n([\s\S]*?)(?=###|$)/i);
  if (wellnessMatch) result.wellnessFocus = wellnessMatch[1].trim();

  const practicalMatch = markdown.match(/###\s*Practical Heads-Up\s*\n([\s\S]*?)(?=###|$)/i);
  if (practicalMatch) result.practicalHeadsUp = practicalMatch[1].trim();

  const finalMatch = markdown.match(/###\s*Final Note[\s\S]*?\n([\s\S]*?)$/i);
  if (finalMatch) result.finalNote = finalMatch[1].trim();

  result.overview = result.overview.replace(/\*\*/g, '');
  Object.keys(result.beforeYouGo).forEach(k => {
    result.beforeYouGo[k] = result.beforeYouGo[k].replace(/\*\*/g, '');
  });
  result.wellnessFocus = result.wellnessFocus.replace(/\*\*/g, '');
  result.practicalHeadsUp = result.practicalHeadsUp.replace(/\*\*/g, '');
  result.finalNote = result.finalNote.replace(/\*\*/g, '');

  return result;
}

function ImagePlaceholder({ category }: { category?: string }) {
  const iconName = category ? getCategoryIconName(category) : 'map-pin';
  return (
    <div className="w-[100px] h-[75px] rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(107,143,113,0.1), rgba(232,185,96,0.1))' }}>
      <LucideIcon name={iconName} className="w-8 h-8 text-[#6b8f71]" />
    </div>
  );
}

function ActivityImage({ activity, loadedImages }: { activity: Activity; loadedImages: Record<string, string> }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  let imageUrl: string | null = null;
  let fallbackCategory: string | undefined;

  if (activity.wikiTag && loadedImages[activity.wikiTag]) {
    imageUrl = loadedImages[activity.wikiTag];
  } else if (activity.catTag && loadedImages[activity.catTag]) {
    imageUrl = loadedImages[activity.catTag];
    fallbackCategory = activity.catTag;
  } else if (activity.catTag) {
    imageUrl = getCategoryImage(activity.catTag);
    fallbackCategory = activity.catTag;
  }

  if (!imageUrl || imgError) {
    return <ImagePlaceholder category={fallbackCategory || activity.catTag} />;
  }

  return (
    <img
      src={imageUrl}
      alt={activity.title}
      loading="lazy"
      crossOrigin="anonymous"
      onLoad={() => setImgLoaded(true)}
      onError={() => setImgError(true)}
      className={`w-[100px] h-[75px] object-cover rounded-lg flex-shrink-0 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

export default function ItinerarySection({ slug, name }: ItinerarySectionProps) {
  const [isPro, setIsPro] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(7);
  const [customDays, setCustomDays] = useState(10);
  const [focus, setFocus] = useState('wellness');
  const [hasChatContext, setHasChatContext] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    setIsPro(checkProStatus());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'itinerary') {
      const timer = setTimeout(() => {
        const el = document.getElementById('itinerary-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('serenestay_chat_history');
      if (saved) {
        const history = JSON.parse(saved);
        if (Array.isArray(history) && history.some((m: { role: string }) => m.role === 'user')) {
          setHasChatContext(true);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetch(`/api/destinations/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.destination) setDestination(data.destination);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!slug || loading) return;
    const actualDuration = duration === 0 ? (customDays || 30) : duration;
    const saved = getSavedItineraries().find(
      i => i.slug === slug && i.duration === actualDuration && i.focus === focus
    );
    if (saved && saved.parsed) {
      setParsed(saved.parsed);
      setIsSaved(true);
    } else {
      setParsed(null);
      setIsSaved(false);
    }
  }, [slug, duration, customDays, focus]);

  useEffect(() => {
    if (parsed) {
      setExpandedDays(new Set([1]));
    }
  }, [parsed]);

  useEffect(() => {
    if (!parsed) return;

    const loadImages = async () => {
      const images: Record<string, string> = {};
      const wikiTags: string[] = [];
      const catTags: string[] = [];

      parsed.days.forEach(day => {
        day.activities.forEach(activity => {
          if (activity.wikiTag) wikiTags.push(activity.wikiTag);
          if (activity.catTag) catTags.push(activity.catTag);
        });
      });

      for (const title of wikiTags) {
        try {
          const res = await fetch(`/api/wiki-image?title=${encodeURIComponent(title)}`);
          const data = await res.json();
          if (data.url) {
            images[title] = data.url;
          }
        } catch {}
      }

      const uniqueCats = [...new Set(catTags)];
      for (const cat of uniqueCats) {
        images[cat] = getCategoryImage(cat);
      }

      setLoadedImages(images);
    };

    loadImages();
  }, [parsed]);

  const toggleDay = (day: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!parsed) return;
    setExpandedDays(new Set(parsed.days.map(d => d.day)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  const generateItinerary = () => {
    if (!isPro) return;
    setLoading(true);
    setItinerary(null);
    setParsed(null);
    const proToken = localStorage.getItem('serenestay_pro_token') || '';

    let chatContext = '';
    try {
      const saved = localStorage.getItem('serenestay_chat_history');
      if (saved) {
        const history = JSON.parse(saved);
        if (Array.isArray(history)) {
          const userMessages = history
            .filter((m: { role: string }) => m.role === 'user')
            .map((m: { content: string }) => m.content);
          if (userMessages.length > 0) {
            chatContext = userMessages.join('\n');
          }
        }
      }
    } catch {}

    const actualDuration = duration === 0 ? customDays : duration;

    fetch('/api/itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        proToken,
        duration: actualDuration,
        focus,
        chatContext: chatContext || undefined,
        customDays: duration === 0 ? customDays : undefined,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.itinerary) {
          setItinerary(data.itinerary);
          setParsed(parseItinerary(data.itinerary));
          setIsSaved(false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (!isPro) {
    return (
      <div style={{ ...glassCard, padding: '24px', background: 'linear-gradient(135deg, rgba(91,143,168,0.08), rgba(107,158,126,0.08))' }}>
        <div className="flex items-center gap-3 mb-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(91,143,168,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock className="w-5 h-5" style={{ color: 'var(--color-sky)' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)' }}>Your Healing Journey</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Pro exclusive</p>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
          Get a personalized day-by-day wellness itinerary for {name} — activities, budget breakdown, and practical tips tailored to your travel style.
        </p>
        <Link
          href="/pricing"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', fontSize: '14px', fontWeight: 500,
            background: 'var(--color-sky)', color: 'white',
            borderRadius: '12px', textDecoration: 'none', transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Leaf className="w-4 h-4" />
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  const actualDuration = duration === 0 ? customDays : duration;
  const avgScore = destination
    ? (Object.values(destination.scores).reduce((a, b) => a + b, 0) / Object.keys(destination.scores).length).toFixed(1)
    : '—';

  const allExpanded = parsed ? expandedDays.size === parsed.days.length : false;

  return (
    <div id="itinerary-section">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-white)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Map className="w-6 h-6" style={{ color: 'var(--color-sky)' }} />
        Your Healing Journey
      </h2>

      <div style={{ ...glassCard, padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              <CalendarDays className="w-4 h-4" />
              Trip Duration
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                    transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                    background: duration === opt.value ? 'var(--color-canopy)' : 'rgba(255,255,255,0.06)',
                    color: duration === opt.value ? 'white' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {duration === 0 && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={customDays}
                  onChange={e => setCustomDays(Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
                  style={{
                    width: '80px', padding: '8px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', fontSize: '14px', color: 'var(--color-white)',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>days (1-90)</span>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              <Compass className="w-4 h-4" />
              Travel Focus
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {FOCUS_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFocus(opt.value)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                      transition: 'all 0.2s', border: 'none', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: focus === opt.value ? 'var(--color-canopy)' : 'rgba(255,255,255,0.06)',
                      color: focus === opt.value ? 'white' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {hasChatContext && (
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(107,143,113,0.08)', border: '1px solid rgba(107,143,113,0.2)', borderRadius: '8px' }}>
            <MessageCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-canopy)' }} />
            <p style={{ fontSize: '12px', color: 'var(--color-canopy)' }}>
              Personalized based on your conversation with Serene
            </p>
          </div>
        )}

        <button
          onClick={generateItinerary}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: 'var(--color-sky)', color: 'white',
            borderRadius: '12px', fontSize: '14px', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating your itinerary...
            </>
          ) : (
            <>
              <Leaf className="w-4 h-4" />
              {parsed ? 'Regenerate' : 'Generate'} {actualDuration}-Day Itinerary
            </>
          )}
        </button>
      </div>

      {loading && !itinerary && (
        <div style={{ ...glassCard, padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '75%' }} />
            <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '100%' }} />
            <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '66%' }} />
            <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '83%' }} />
            <div style={{ height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', width: '50%' }} />
          </div>
        </div>
      )}

      {parsed && (
        <div id="itinerary-content" style={glassCard} className="overflow-hidden">
          {destination && (
            <div className="relative h-48 sm:h-64 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${destination.images[0]})` }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,36,25,0.8) 0%, rgba(14,36,25,0.3) 50%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: 'white' }}>{destination.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <span>{actualDuration} Days</span>
                  <span>•</span>
                  <span className="capitalize">{focus}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-6">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="sm:grid-cols-4">
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <CalendarDays className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-canopy)' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Duration</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-white)' }}>{actualDuration} days</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <DollarSign className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-sand)' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Budget Est.</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-white)' }}>
                  {parsed.beforeYouGo['Budget estimate'] || `$${destination ? Math.round(destination.monthlyCost.mid * actualDuration / 30) : '—'}`}
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <Cloud className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-canopy)' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Best Season</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)' }}>
                  {destination?.bestSeason.months.slice(0, 3).join(', ') || '—'}
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <Star className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-sand)' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Rating</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-white)' }}>{avgScore}/5</p>
              </div>
            </div>

            {parsed.overview && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{parsed.overview}</p>
              </div>
            )}

            {Object.keys(parsed.beforeYouGo).length > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList className="w-5 h-5" /> Before You Go
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {Object.entries(parsed.beforeYouGo).map(([key, value]) => (
                    <div key={key} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px' }}>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{key}</p>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.days.length > 0 && (
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarIcon className="w-5 h-5" /> Day-by-Day Itinerary
                  </h4>
                  <button
                    onClick={allExpanded ? collapseAll : expandAll}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                      color: 'var(--color-canopy)', background: 'rgba(107,143,113,0.1)',
                      borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(107,143,113,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(107,143,113,0.1)'}
                  >
                    {allExpanded ? (
                      <>
                        <ChevronsDownUp className="w-3.5 h-3.5" />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                        Expand All
                      </>
                    )}
                  </button>
                </div>
                <div className="relative pl-6 space-y-3" style={{ borderLeft: '2px solid rgba(107,143,113,0.3)' }}>
                  {parsed.days.map((day) => {
                    const isExpanded = expandedDays.has(day.day);

                    return (
                      <div key={day.day} className="relative">
                        <div className="absolute -left-[31px] w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--color-canopy)' }}>
                          {day.day}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', marginLeft: '8px', overflow: 'hidden' }}>
                          <button
                            onClick={() => toggleDay(day.day)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(107,143,113,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <h5 className="truncate sm:text-base" style={{ fontWeight: 500, color: 'var(--color-white)', fontSize: '14px' }}>
                                Day {day.day}: {day.theme}
                              </h5>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-canopy)' }} />
                            ) : (
                              <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-canopy)' }} />
                            )}
                          </button>

                          <div
                            style={{
                              transition: 'all 0.3s ease-in-out',
                              maxHeight: isExpanded ? '5000px' : '0',
                              opacity: isExpanded ? 1 : 0,
                              overflow: isExpanded ? 'visible' : 'hidden',
                            }}
                          >
                            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {day.activities.map((activity, idx) => {
                                const isDining = activity.description.toLowerCase().includes('lunch') ||
                                  activity.description.toLowerCase().includes('dinner') ||
                                  activity.description.toLowerCase().includes('breakfast') ||
                                  activity.title.toLowerCase().includes('food') ||
                                  activity.catTag === 'food';

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex', gap: '12px',
                                      borderLeft: isDining ? '2px solid var(--color-sand)' : 'none',
                                      paddingLeft: isDining ? '12px' : '0'
                                    }}
                                  >
                                    <div className="hidden sm:block">
                                      <ActivityImage activity={activity} loadedImages={loadedImages} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        {activity.time === 'morning' && <Sunrise className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />}
                                        {activity.time === 'afternoon' && <Sun className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />}
                                        {activity.time === 'evening' && <Sunset className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />}
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-canopy)', textTransform: 'capitalize' }}>{activity.time}</span>
                                      </div>
                                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-white)', marginBottom: '4px' }}>{activity.title}</p>
                                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{activity.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {parsed.budget.length > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign className="w-5 h-5" /> Budget Breakdown
                </h4>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(107,143,113,0.1)' }}>
                        <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Category</th>
                        <th style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Budget</th>
                        <th style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Mid</th>
                        <th style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Comfort</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.budget.map((row, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', color: 'rgba(255,255,255,0.8)' }}>{row.category}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.budget}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: 'var(--color-canopy)', fontWeight: 500 }}>{row.mid}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.comfort}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {parsed.wellnessFocus && (
              <div style={{ background: 'rgba(107,143,113,0.08)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-canopy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Heart className="w-5 h-5" /> Wellness Focus
                </h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{parsed.wellnessFocus}</p>
              </div>
            )}

            {parsed.practicalHeadsUp && (
              <div style={{ background: 'rgba(232,185,96,0.08)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-sand)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle className="w-5 h-5" /> Practical Heads-Up
                </h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{parsed.practicalHeadsUp}</p>
              </div>
            )}

            {parsed.finalNote && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>{parsed.finalNote}</p>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <p>Images are for reference only — some are illustrative and may not exactly represent the actual location. This itinerary is AI-generated; specific venues and details may vary. Please verify before booking.</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 pt-0">
            <button
              onClick={() => {
                if (isSaved) {
                  removeItinerary(slug, 1, focus);
                  setIsSaved(false);
                } else if (parsed) {
                  const plannedPhases = getPlannedPhasesForDestination(slug);
                  const startDay = plannedPhases.length > 0
                    ? Math.max(...plannedPhases.map(p => {
                        const range = (p.dayRange || '1-1').split('-').map(Number);
                        return range[1] || 0;
                      })) + 1
                    : 1;
                  const endDay = startDay + actualDuration - 1;
                  const dayRange = `${startDay}-${endDay}`;
                  const phase = plannedPhases.length + 1;
                  const totalTripDays = endDay;
                  const plannedPhasesSummary = generatePlannedPhasesSummary(slug);

                  saveItinerary({
                    slug,
                    name,
                    duration: actualDuration,
                    focus,
                    savedAt: new Date().toISOString(),
                    parsed,
                    coverImage: destination?.images[0],
                    phase,
                    dayRange,
                    totalTripDays,
                    plannedDaysSummary: plannedPhasesSummary,
                  });
                  setIsSaved(true);
                }
              }}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: isSaved ? 'var(--color-canopy)' : 'rgba(107, 143, 113, 0.1)',
                color: isSaved ? '#fff' : 'var(--color-canopy)',
              }}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isSaved ? 'Saved' : 'Save Trip'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
