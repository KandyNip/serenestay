'use client';

import { useState, useEffect } from 'react';
import { Lock, Sparkles, Map, CalendarDays, Compass, Info, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { checkProStatus } from '@/lib/api';

interface ItinerarySectionProps {
  slug: string;
  name: string;
}

const DURATION_OPTIONS = [
  { value: 3, label: '3 Days' },
  { value: 5, label: '5 Days' },
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
];

const FOCUS_OPTIONS = [
  { value: 'wellness', label: '🧘 Wellness & Healing' },
  { value: 'nature', label: '🌿 Nature & Adventure' },
  { value: 'culture', label: '🎭 Culture & Community' },
  { value: 'nomad', label: '💻 Digital Nomad' },
];

export default function ItinerarySection({ slug, name }: ItinerarySectionProps) {
  const [isPro, setIsPro] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(7);
  const [focus, setFocus] = useState('wellness');
  const [hasChatContext, setHasChatContext] = useState(false);

  useEffect(() => {
    setIsPro(checkProStatus());
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

  const generateItinerary = () => {
    if (!isPro) return;
    setLoading(true);
    setItinerary(null);
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

    fetch('/api/itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, proToken, duration, focus, chatContext: chatContext || undefined }),
    })
      .then(r => r.json())
      .then(data => { if (data.itinerary) setItinerary(data.itinerary); })
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

  // Pro users: itinerary generator
  return (
    <div>
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
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    duration === opt.value
                      ? 'bg-secondary text-white'
                      : 'bg-surface text-primary/60 hover:bg-secondary/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
                      ? 'bg-secondary text-white'
                      : 'bg-surface text-primary/60 hover:bg-secondary/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {hasChatContext && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-secondary/5 border border-secondary/20 rounded-lg">
            <MessageCircle className="w-4 h-4 text-secondary flex-shrink-0" />
            <p className="text-xs text-secondary">
              ✨ Personalized based on your conversation with Serene
            </p>
          </div>
        )}
        <button
          onClick={generateItinerary}
          disabled={loading}
          className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating your itinerary...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate {duration}-Day Itinerary
            </>
          )}
        </button>
      </div>

      {/* Itinerary content */}
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
      {itinerary && (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-card prose prose-sm max-w-none text-primary/80
            [&_h2]:font-serif [&_h2]:text-primary [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-3
            [&_h3]:font-serif [&_h3]:text-primary [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2
            [&_strong]:text-primary [&_strong]:font-semibold
            [&_table]:w-full [&_th]:text-left [&_th]:p-2 [&_th]:border-b [&_th]:border-surface
            [&_td]:p-2 [&_td]:border-b [&_td]:border-surface
            [&_ul]:space-y-1 [&_li]:text-primary/70
            [&_p]:text-primary/70 [&_p]:leading-relaxed
          ">
            <ReactMarkdown>{itinerary}</ReactMarkdown>
          </div>
          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2 px-1 text-xs text-primary/40">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p>AI-generated itinerary based on destination data. Specific venues and programs may vary — please verify details before booking.</p>
          </div>
        </>
      )}
    </div>
  );
}
