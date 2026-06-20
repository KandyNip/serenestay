'use client';

import { useState, useEffect } from 'react';
import { Lock, Sparkles, Map, CalendarDays, Compass, Info, MessageCircle, Bookmark, BookmarkCheck, Sun, Sunrise, Sunset, ChevronDown, ChevronUp, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import Link from 'next/link';
import { checkProStatus } from '@/lib/api';
import { getCategoryImage, getCategoryEmoji, DEFAULT_IMAGE } from '@/lib/itinerary-images';
import { saveItinerary, isItinerarySaved, removeItinerary, getSavedItineraries } from '@/lib/itinerary-storage';

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
  { value: 'wellness', label: '🧘 Wellness & Healing' },
  { value: 'nature', label: '🌿 Nature & Adventure' },
  { value: 'culture', label: '🎭 Culture & Community' },
  { value: 'nomad', label: '💻 Digital Nomad' },
];

// Parse markdown itinerary into structured data
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

  // Extract overview
  const overviewMatch = markdown.match(/###\s*✨\s*Trip Overview\s*\n([\s\S]*?)(?=###|$)/);
  if (overviewMatch) result.overview = overviewMatch[1].trim();

  // Extract Before You Go
  const beforeMatch = markdown.match(/###\s*📋\s*Before You Go\s*\n([\s\S]*?)(?=###|$)/);
  if (beforeMatch) {
    const lines = beforeMatch[1].trim().split('\n');
    lines.forEach(line => {
      const m = line.match(/-\s*\*\*(.+?):\*\*\s*(.+)/);
      if (m) result.beforeYouGo[m[1].trim()] = m[2].trim();
    });
  }

  // Extract days
  const dayRegex = /\*\*Day\s+(\d+):\s*(.+?)\*\*\s*\n([\s\S]*?)(?=\*\*Day\s+\d+:|###\s*💰|$)/g;
  let dayMatch;
  while ((dayMatch = dayRegex.exec(markdown)) !== null) {
    const day: DayPlan = {
      day: parseInt(dayMatch[1]),
      theme: dayMatch[2].trim(),
      activities: [],
    };

    const activityLines = dayMatch[3].trim().split('\n');
    activityLines.forEach(line => {
      const timeMatch = line.match(/(🌅|☀️|🌙)\s*(.+?):\s*(.+)/);
      if (timeMatch) {
        const timeEmoji = timeMatch[1];
        const time = timeEmoji === '🌅' ? 'morning' : timeEmoji === '☀️' ? 'afternoon' : 'evening';
        let title = timeMatch[2].trim();
        let description = timeMatch[3].trim();

        // Strip markdown bold markers
        title = title.replace(/\*\*/g, '');
        description = description.replace(/\*\*/g, '');

        // Extract wiki/cat tags
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

  // Extract budget table
  const budgetMatch = markdown.match(/###\s*💰\s*Budget Breakdown[\s\S]*?\n\|[\s\S]*?\n\|[-\s|]*\n([\s\S]*?)(?=\n###|\n\*\*)/);
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

  // Extract Wellness Focus
  const wellnessMatch = markdown.match(/###\s*🧘\s*Wellness Focus[\s\S]*?\n([\s\S]*?)(?=###|$)/);
  if (wellnessMatch) result.wellnessFocus = wellnessMatch[1].trim();

  // Extract Practical Heads-Up
  const practicalMatch = markdown.match(/###\s*⚠️\s*Practical Heads-Up\s*\n([\s\S]*?)(?=###|$)/);
  if (practicalMatch) result.practicalHeadsUp = practicalMatch[1].trim();

  // Extract Final Note
  const finalMatch = markdown.match(/###\s*💌\s*Final Note[\s\S]*?\n([\s\S]*?)$/);
  if (finalMatch) result.finalNote = finalMatch[1].trim();

  // Strip markdown bold markers from all text fields
  result.overview = result.overview.replace(/\*\*/g, '');
  Object.keys(result.beforeYouGo).forEach(k => {
    result.beforeYouGo[k] = result.beforeYouGo[k].replace(/\*\*/g, '');
  });
  result.wellnessFocus = result.wellnessFocus.replace(/\*\*/g, '');
  result.practicalHeadsUp = result.practicalHeadsUp.replace(/\*\*/g, '');
  result.finalNote = result.finalNote.replace(/\*\*/g, '');

  return result;
}

// Emoji placeholder when image fails to load
function ImagePlaceholder({ category }: { category?: string }) {
  const emoji = category ? getCategoryEmoji(category) : '📍';
  return (
    <div className="w-[100px] h-[75px] rounded-lg flex-shrink-0 bg-gradient-to-br from-[#6b8f71]/10 to-[#e8b960]/10 flex items-center justify-center">
      <span className="text-3xl">{emoji}</span>
    </div>
  );
}

// Activity image component with lazy loading and fallback chain
function ActivityImage({ activity, loadedImages }: { activity: Activity; loadedImages: Record<string, string> }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Fallback chain: wiki image → cat image → placeholder
  let imageUrl: string | null = null;
  let fallbackCategory: string | undefined;

  if (activity.wikiTag && loadedImages[activity.wikiTag]) {
    imageUrl = loadedImages[activity.wikiTag];
  } else if (activity.catTag && loadedImages[activity.catTag]) {
    imageUrl = loadedImages[activity.catTag];
    fallbackCategory = activity.catTag;
  } else if (activity.catTag) {
    // catTag exists but no image loaded — use getCategoryImage directly
    imageUrl = getCategoryImage(activity.catTag);
    fallbackCategory = activity.catTag;
  }

  // Show emoji placeholder if no image or load error
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

  // Auto-scroll to itinerary section when coming from Saved page
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

  // Fetch destination data for visual rendering
  useEffect(() => {
    fetch(`/api/destinations/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.destination) setDestination(data.destination);
      })
      .catch(() => {});
  }, [slug]);

  // Auto-load saved itinerary when duration/focus changes
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

  // Reset expanded days when new itinerary is generated
  useEffect(() => {
    if (parsed) {
      setExpandedDays(new Set([1]));
    }
  }, [parsed]);

  // Load images for activities after itinerary is parsed
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

      // Load wiki images first
      for (const title of wikiTags) {
        try {
          const res = await fetch(`/api/wiki-image?title=${encodeURIComponent(title)}`);
          const data = await res.json();
          if (data.url) {
            images[title] = data.url;
          }
        } catch {}
      }

      // Load cat images (always available from local mapping)
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

    // Extract user messages from chat history as personalization context
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

  // Free users: locked card
  if (!isPro) {
    return (
      <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-2xl p-6 border border-secondary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-primary">AI Travel Itinerary</h3>
            <p className="text-sm text-primary/50">Pro exclusive</p>
          </div>
        </div>
        <p className="text-primary/60 text-sm mb-4">
          Get a personalized day-by-day wellness itinerary for {name} — activities, budget breakdown, and practical tips tailored to your travel style.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
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

  // Pro users: itinerary generator with visual rendering
  return (
    <div id="itinerary-section">
      <h2 className="font-serif text-2xl text-primary mb-4 flex items-center gap-2">
        <Map className="w-6 h-6 text-secondary" />
        AI Travel Itinerary
      </h2>

      {/* Preference selectors */}
      <div className="bg-white rounded-2xl p-6 shadow-card mb-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-primary/70 mb-2">
              <CalendarDays className="w-4 h-4" />
              Trip Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    duration === opt.value
                      ? 'bg-[#6b8f71] text-white'
                      : 'bg-surface text-primary/60 hover:bg-[#6b8f71]/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {duration === 0 && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={customDays}
                  onChange={e => setCustomDays(Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-primary/20 rounded-lg text-sm text-primary focus:outline-none focus:border-[#6b8f71]"
                />
                <span className="text-sm text-primary/60">days (1-90)</span>
              </div>
            )}
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-primary/70 mb-2">
              <Compass className="w-4 h-4" />
              Travel Focus
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFocus(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    focus === opt.value
                      ? 'bg-[#6b8f71] text-white'
                      : 'bg-surface text-primary/60 hover:bg-[#6b8f71]/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasChatContext && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-[#6b8f71]/5 border border-[#6b8f71]/20 rounded-lg">
            <MessageCircle className="w-4 h-4 text-[#6b8f71] flex-shrink-0" />
            <p className="text-xs text-[#6b8f71]">
              ✨ Personalized based on your conversation with Serene
            </p>
          </div>
        )}

        <button
          onClick={generateItinerary}
          disabled={loading}
          className="w-full py-3 bg-[#6b8f71] text-white rounded-xl font-medium hover:bg-[#6b8f71]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating your itinerary...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {parsed ? 'Regenerate' : 'Generate'} {actualDuration}-Day Itinerary
            </>
          )}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && !itinerary && (
        <div className="bg-white rounded-2xl p-6 shadow-card animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-surface rounded w-3/4" />
            <div className="h-4 bg-surface rounded w-full" />
            <div className="h-4 bg-surface rounded w-2/3" />
            <div className="h-4 bg-surface rounded w-5/6" />
            <div className="h-4 bg-surface rounded w-1/2" />
          </div>
        </div>
      )}

      {/* Visual itinerary rendering */}
      {parsed && (
        <div id="itinerary-content" className="bg-[#faf9f7] rounded-2xl overflow-hidden shadow-card">
          {/* Cover area */}
          {destination && (
            <div className="relative h-48 sm:h-64 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${destination.images[0]})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">{destination.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
                  <span>{actualDuration} Days</span>
                  <span>•</span>
                  <span className="capitalize">{focus}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-6">
            {/* 4-grid overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 text-center">
                <CalendarDays className="w-5 h-5 text-[#6b8f71] mx-auto mb-1" />
                <p className="text-xs text-primary/60">Duration</p>
                <p className="text-lg font-bold text-primary">{actualDuration} days</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <span className="text-[#e8b960] text-lg">💰</span>
                <p className="text-xs text-primary/60">Budget Est.</p>
                <p className="text-lg font-bold text-primary">
                  {parsed.beforeYouGo['Budget estimate'] || `$${destination ? Math.round(destination.monthlyCost.mid * actualDuration / 30) : '—'}`}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <span className="text-[#6b8f71] text-lg">🌤️</span>
                <p className="text-xs text-primary/60">Best Season</p>
                <p className="text-sm font-bold text-primary">
                  {destination?.bestSeason.months.slice(0, 3).join(', ') || '—'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <span className="text-[#e8b960] text-lg">⭐</span>
                <p className="text-xs text-primary/60">Rating</p>
                <p className="text-lg font-bold text-primary">{avgScore}/5</p>
              </div>
            </div>

            {/* Overview text */}
            {parsed.overview && (
              <div className="bg-white rounded-xl p-4">
                <p className="text-primary/80 leading-relaxed text-sm">{parsed.overview}</p>
              </div>
            )}

            {/* Before You Go - 2x2 grid */}
            {Object.keys(parsed.beforeYouGo).length > 0 && (
              <div>
                <h4 className="font-serif text-lg text-primary mb-3 flex items-center gap-2">
                  <span>📋</span> Before You Go
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(parsed.beforeYouGo).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-xl p-3">
                      <p className="text-xs text-primary/50 mb-1">{key}</p>
                      <p className="text-sm text-primary/80">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline day cards with accordion */}
            {parsed.days.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-serif text-lg text-primary flex items-center gap-2">
                    <span>🗓️</span> Day-by-Day Itinerary
                  </h4>
                  <button
                    onClick={allExpanded ? collapseAll : expandAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6b8f71] bg-[#6b8f71]/10 rounded-lg hover:bg-[#6b8f71]/20 transition-colors"
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
                <div className="relative pl-6 border-l-2 border-[#6b8f71]/30 space-y-3">
                  {parsed.days.map((day) => {
                    const isExpanded = expandedDays.has(day.day);
                    const timeEmojis = day.activities
                      .map(a => a.time === 'morning' ? '🌅' : a.time === 'afternoon' ? '☀️' : '🌙')
                      .filter((v, i, arr) => arr.indexOf(v) === i) // unique
                      .join('');

                    return (
                      <div key={day.day} className="relative">
                        {/* Day marker */}
                        <div className="absolute -left-[31px] w-6 h-6 bg-[#6b8f71] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {day.day}
                        </div>
                        <div className="bg-white rounded-xl ml-2 overflow-hidden">
                          {/* Collapsible header */}
                          <button
                            onClick={() => toggleDay(day.day)}
                            className="w-full flex items-center justify-between p-3 hover:bg-[#6b8f71]/5 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <h5 className="font-medium text-primary text-sm sm:text-base truncate">
                                Day {day.day}: {day.theme}
                              </h5>
                              <span className="text-xs flex-shrink-0">{timeEmojis}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#6b8f71] flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#6b8f71] flex-shrink-0" />
                            )}
                          </button>

                          {/* Expandable content */}
                          <div
                            className={`transition-all duration-300 ease-in-out ${
                              isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                            }`}
                          >
                            <div className="px-3 pb-3 space-y-2">
                              {day.activities.map((activity, idx) => {
                                const isDining = activity.description.toLowerCase().includes('lunch') ||
                                  activity.description.toLowerCase().includes('dinner') ||
                                  activity.description.toLowerCase().includes('breakfast') ||
                                  activity.title.toLowerCase().includes('food') ||
                                  activity.catTag === 'food';

                                return (
                                  <div
                                    key={idx}
                                    className={`flex gap-3 ${isDining ? 'border-l-2 border-[#e8b960] pl-3' : ''}`}
                                  >
                                    {/* Activity image */}
                                    <div className="hidden sm:block">
                                      <ActivityImage activity={activity} loadedImages={loadedImages} />
                                    </div>
                                    {/* Activity content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        {activity.time === 'morning' && <Sunrise className="w-4 h-4 text-[#e8b960]" />}
                                        {activity.time === 'afternoon' && <Sun className="w-4 h-4 text-[#e8b960]" />}
                                        {activity.time === 'evening' && <Sunset className="w-4 h-4 text-[#e8b960]" />}
                                        <span className="text-xs font-medium text-[#6b8f71] capitalize">{activity.time}</span>
                                      </div>
                                      <p className="text-sm font-medium text-primary">{activity.title}</p>
                                      <p className="text-xs text-primary/60 mt-0.5 line-clamp-2">{activity.description}</p>
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

            {/* Budget table */}
            {parsed.budget.length > 0 && (
              <div>
                <h4 className="font-serif text-lg text-primary mb-3 flex items-center gap-2">
                  <span>💰</span> Budget Breakdown
                </h4>
                <div className="bg-white rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#6b8f71]/10">
                        <th className="text-left p-3 text-primary/70 font-medium">Category</th>
                        <th className="text-center p-3 text-primary/70 font-medium">Budget</th>
                        <th className="text-center p-3 text-primary/70 font-medium">Mid</th>
                        <th className="text-center p-3 text-primary/70 font-medium">Comfort</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.budget.map((row, idx) => (
                        <tr key={idx} className="border-t border-primary/5">
                          <td className="p-3 text-primary/80">{row.category}</td>
                          <td className="p-3 text-center text-primary/70">{row.budget}</td>
                          <td className="p-3 text-center text-[#6b8f71] font-medium">{row.mid}</td>
                          <td className="p-3 text-center text-primary/70">{row.comfort}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Wellness Focus */}
            {parsed.wellnessFocus && (
              <div className="bg-[#6b8f71]/5 rounded-xl p-4">
                <h4 className="font-serif text-lg text-[#6b8f71] mb-2 flex items-center gap-2">
                  <span>🧘</span> Wellness Focus
                </h4>
                <p className="text-sm text-primary/80 leading-relaxed">{parsed.wellnessFocus}</p>
              </div>
            )}

            {/* Practical Heads-Up */}
            {parsed.practicalHeadsUp && (
              <div className="bg-[#e8b960]/10 rounded-xl p-4">
                <h4 className="font-serif text-lg text-[#e8b960] mb-2 flex items-center gap-2">
                  <span>⚠️</span> Practical Heads-Up
                </h4>
                <p className="text-sm text-primary/80 leading-relaxed whitespace-pre-line">{parsed.practicalHeadsUp}</p>
              </div>
            )}

            {/* Final Note */}
            {parsed.finalNote && (
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-primary/70 italic">{parsed.finalNote}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 px-1 text-xs text-primary/40">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <p>⚠️ Images are for reference only — some are illustrative and may not exactly represent the actual location. This itinerary is AI-generated; specific venues and details may vary. Please verify before booking.</p>
            </div>
          </div>

          {/* Save button */}
          <div className="p-4 sm:p-6 pt-0">
            <button
              onClick={() => {
                if (isSaved) {
                  removeItinerary(slug, 1, focus);
                  setIsSaved(false);
                } else if (parsed) {
                  saveItinerary({
                    slug,
                    name,
                    duration: actualDuration,
                    focus,
                    savedAt: new Date().toISOString(),
                    parsed,
                    coverImage: destination?.images[0],
                    phase: 1,
                    dayRange: `1-${actualDuration}`,
                    totalTripDays: actualDuration,
                    plannedDaysSummary: `Phase 1: Days 1-${actualDuration} - ${focus} focus`,
                  });
                  setIsSaved(true);
                }
              }}
              className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              style={{
                background: isSaved ? '#6b8f71' : 'rgba(107, 143, 113, 0.1)',
                color: isSaved ? '#fff' : '#6b8f71',
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
