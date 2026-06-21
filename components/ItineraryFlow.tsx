'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Check, Sparkles, RotateCcw, Save, Plus, MapPin, Calendar, Target, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import MoodChips, { MOOD_CHIPS, getMoodLabels } from './MoodChips';
import ItineraryDayCard, { type DayContent } from './ItineraryDayCard';
import ItineraryChatInput from './ItineraryChatInput';
import type { ItinerarySession, DaySummary } from '@/lib/itinerary-session';
import { clearSession, initSession, addDayToSession, getPreviousDaysContext } from '@/lib/itinerary-session';
import { saveDayByDayItinerary } from '@/lib/itinerary-storage';
import type { Destination } from '@/lib/types';

interface ItineraryFlowProps {
  destination: Destination;
  initialFocus?: string;
  proToken?: string;
}

interface DayData {
  dayNumber: number;
  title: string;
  content: string | DayContent;
  moodChips: string[];
}

type FlowStep = 'setup' | 'mood' | 'generating' | 'review' | 'complete';

export default function ItineraryFlow({ destination, initialFocus = 'wellness', proToken }: ItineraryFlowProps) {
  const [step, setStep] = useState<FlowStep>('setup');
  const [focus, setFocus] = useState(initialFocus);
  const [session, setSession] = useState<ItinerarySession | null>(null);
  const [days, setDays] = useState<DayData[]>([]);
  const [currentMood, setCurrentMood] = useState<string[]>(['chill', 'nature']);
  const [chatNote, setChatNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [expandedOverview, setExpandedOverview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear session on mount - no auto-restore in day-by-day append mode
  useEffect(() => {
    // 每次进入行程页都从setup开始，不恢复旧session
    // 已保存的行程在Favorites页管理
    clearSession();
  }, [destination.slug]);

  const getProToken = (): string => {
    return proToken || (typeof window !== 'undefined' ? localStorage.getItem('serenestay_pro_token') || '' : '');
  };

  const handleStartTrip = () => {
    const newSession = initSession(destination.slug, destination.name, focus);
    setSession(newSession);
    setDays([]);
    setStep('mood');
    setExpandedDays(new Set());
  };

  const generateDay = useCallback(async (dayNumber: number, moodIds: string[], note?: string) => {
    setIsGenerating(true);
    setError(null);
    setStep('generating');

    try {
      const token = getProToken();
      const prevContext = session ? getPreviousDaysContext(session) : '';
      const moodLabels = getMoodLabels(moodIds);

      const response = await fetch('/api/itinerary-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: destination.slug,
          proToken: token,
          dayNumber,
          moodChips: moodLabels,
          previousDaysContext: prevContext,
          focus,
          chatContext: note || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate day');
      }

      const data = await response.json();
      const format: 'json' | 'markdown' = data.format || 'markdown';

      let dayData: DayData;

      if (format === 'json' && typeof data.dayContent === 'object' && data.dayContent !== null) {
        // Structured JSON format from API
        const dayContent: DayContent = data.dayContent;
        const title = dayContent.title || `Day ${dayNumber}`;

        dayData = {
          dayNumber,
          title,
          content: dayContent,
          moodChips: moodIds,
        };
      } else {
        // Fallback: markdown string format
        const dayContentStr: string = data.dayContent || '';
        const apiTitle: string | undefined = data.title;

        // Use title from API if available, otherwise extract from content
        let title: string;
        if (apiTitle) {
          // Strip "Day N:" prefix if present
          title = apiTitle.replace(/^Day\s+\d+[:\s]*/, '').trim() || `Day ${dayNumber}`;
        } else {
          const titleMatch = dayContentStr.match(/\*\*Day\s+\d+[:\s]*(.+?)\*\*/);
          title = titleMatch ? titleMatch[1].trim() : `Day ${dayNumber}`;
        }

        dayData = {
          dayNumber,
          title,
          content: dayContentStr,
          moodChips: moodIds,
        };
      }

      // Update local state
      setDays(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(d => d.dayNumber === dayNumber);
        if (idx >= 0) {
          updated[idx] = dayData;
        } else {
          updated.push(dayData);
        }
        return updated.sort((a, b) => a.dayNumber - b.dayNumber);
      });

      // Update session
      if (session) {
        const daySummary: DaySummary = {
          dayNumber,
          title: dayData.title,
          activities: extractActivities(dayData.content),
          mood: moodLabels,
        };
        const updatedSession = addDayToSession(session, daySummary);
        setSession(updatedSession);
      }

      // Expand the newly generated day
      setExpandedDays(prev => new Set([...prev, dayNumber]));

      // Always go back to review - user can keep generating more days
      setStep('review');
    } catch (err) {
      console.error('[ItineraryFlow] Error generating day:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate day');
      setStep('review');
    } finally {
      setIsGenerating(false);
    }
  }, [session, destination.slug, focus, days]);

  const handleGenerateNext = () => {
    if (!session) return;
    const nextDay = session.currentDay;
    generateDay(nextDay, currentMood, chatNote);
    setChatNote('');
  };

  const handleRegenerateDay = (dayNumber: number) => {
    const existingDay = days.find(d => d.dayNumber === dayNumber);
    const moodIds = existingDay?.moodChips || currentMood;
    generateDay(dayNumber, moodIds);
  };

  const handleNewTrip = () => {
    clearSession();
    setSession(null);
    setDays([]);
    setStep('setup');
    setExpandedDays(new Set());
  };

  const handleSaveTrip = () => {
    if (!session || days.length === 0) return;

    saveDayByDayItinerary({
      id: `${destination.slug}-${session.createdAt}`,
      slug: destination.slug,
      destinationName: destination.name,
      totalDays: days.length,
      focus,
      days: days.map(d => ({
        dayNumber: d.dayNumber,
        title: d.title,
        content: d.content,
        moodChips: d.moodChips,
      })),
      savedAt: new Date().toISOString(),
    });

    alert('Trip saved! You can find it in your Favorites.');
  };

  const toggleDayExpand = (dayNumber: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
  };

  // Extract activity names from content for the session summary
  function extractActivities(content: string | DayContent): string[] {
    if (typeof content === 'object' && content !== null && 'sections' in content) {
      // Structured JSON format - extract from sections
      const activities: string[] = [];
      for (const section of content.sections) {
        for (const activity of section.activities) {
          if (activity.name) {
            activities.push(activity.name);
          }
        }
      }
      return activities.slice(0, 5);
    }
    // Fallback: markdown string format
    const markdown = typeof content === 'string' ? content : (content as any).content || '';
    const activities: string[] = [];
    const boldMatches = markdown.matchAll(/\*\*([^*]+)\*\*/g);
    for (const match of boldMatches) {
      const text = match[1].trim();
      // Skip day titles and section headers
      if (!text.match(/^Day\s+\d+/) && !text.match(/^(Morning|Afternoon|Evening|Tip|Mood)/)) {
        activities.push(text);
      }
    }
    return activities.slice(0, 5); // Keep top 5 for context
  }

  const currentDayNumber = session?.currentDay || 1;

  // ─── SETUP STEP ───
  if (step === 'setup') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-primary">Plan Your Stay</h3>
              <p className="text-sm text-primary/60">{destination.name}</p>
            </div>
          </div>

          {/* Focus */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-2">
              What's your focus?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'wellness', label: 'Wellness' },
                { id: 'adventure', label: 'Adventure' },
                { id: 'culture', label: 'Culture' },
                { id: 'relaxation', label: 'Relaxation' },
                { id: 'spiritual', label: 'Spiritual Growth' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFocus(id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    focus === id
                      ? 'bg-secondary text-white'
                      : 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartTrip}
            className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-lg"
          >
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ─── GENERATING STEP ───
  if (step === 'generating') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
        </div>
        <h3 className="font-serif text-xl text-primary mb-2">
          Generating Day {currentDayNumber}...
        </h3>
        <p className="text-primary/60 text-sm">
          Crafting your perfect day in {destination.name}
        </p>
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ─── MOOD SELECTION STEP (before generating next day) ───
  if (step === 'mood') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary">
              Day {currentDayNumber}
            </span>
          </div>
          <span className="text-sm text-primary/60">
            {days.length} {days.length === 1 ? 'day' : 'days'} generated
          </span>
        </div>

        {/* Mood Selection */}
        <div className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm">
          <h3 className="font-serif text-lg text-primary mb-1">
            Set the mood for Day {currentDayNumber}
          </h3>
          <p className="text-sm text-primary/60 mb-4">
            What kind of day are you looking for? Select one or more moods.
          </p>

          <MoodChips selected={currentMood} onChange={setCurrentMood} />

          {/* Optional chat note */}
          <div className="mt-4">
            <ItineraryChatInput
              onSend={(note) => {
                setChatNote(note);
                handleGenerateNext();
              }}
              placeholder="Any special requests for this day? (or just click Generate)"
              isLoading={isGenerating}
            />
          </div>

          <button
            onClick={handleGenerateNext}
            disabled={isGenerating}
            className="w-full mt-4 btn-secondary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {days.length > 0 ? 'Add Another Day' : 'Start Your Trip'}
          </button>
        </div>

        {/* Previously generated days */}
        {days.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-primary/60">Generated Days</h4>
            {days.map(day => (
              <ItineraryDayCard
                key={day.dayNumber}
                dayNumber={day.dayNumber}
                title={day.title}
                content={day.content}
                moodChips={day.moodChips}
                isExpanded={expandedDays.has(day.dayNumber)}
                onToggle={() => toggleDayExpand(day.dayNumber)}
                onRegenerate={() => handleRegenerateDay(day.dayNumber)}
                isGenerating={isGenerating}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── REVIEW / COMPLETE STEP ───
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Trip Overview (collapsible) */}
      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        <button
          onClick={() => setExpandedOverview(!expandedOverview)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-secondary" />
            <div className="text-left">
              <h3 className="font-serif text-lg text-primary">
                {destination.name}
              </h3>
              <p className="text-xs text-primary/60">{focus ? focus.charAt(0).toUpperCase() + focus.slice(1) : ''} focus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary/60">
              {days.length} {days.length === 1 ? 'day' : 'days'}
            </span>
            {expandedOverview ? (
              <ChevronUp className="w-5 h-5 text-primary/40" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary/40" />
            )}
          </div>
        </button>

        {expandedOverview && (
          <div className="px-6 pb-4 border-t border-primary/5">
            {/* Day overview list */}
            <div className="space-y-2 mt-3">
              {days.map(day => (
                <button
                  key={day.dayNumber}
                  onClick={() => toggleDayExpand(day.dayNumber)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary/[0.03] transition-colors text-left"
                >
                  <span className="flex items-center justify-center w-7 h-7 bg-secondary/10 text-secondary rounded-full text-xs font-semibold">
                    {day.dayNumber}
                  </span>
                  <span className="text-sm text-primary flex-1 truncate">{day.title}</span>
                  <div className="flex gap-1">
                    {day.moodChips.slice(0, 3).map(id => {
                      const chip = MOOD_CHIPS.find(c => c.id === id);
                      return chip ? (
                        <span key={id} className="text-xs">{chip.emoji}</span>
                      ) : null;
                    })}
                  </div>
                </button>
              ))}
            </div>

            {/* Action buttons */}
            {days.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-primary/10">
                <button
                  onClick={handleNewTrip}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary/60 hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Trip
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Day Cards */}
      <div className="space-y-3">
        {days.map(day => (
          <ItineraryDayCard
            key={day.dayNumber}
            dayNumber={day.dayNumber}
            title={day.title}
            content={day.content}
            moodChips={day.moodChips}
            isExpanded={expandedDays.has(day.dayNumber)}
            onToggle={() => toggleDayExpand(day.dayNumber)}
            onRegenerate={() => handleRegenerateDay(day.dayNumber)}
            isGenerating={isGenerating}
          />
        ))}
      </div>

      {/* Action buttons */}
      {!isGenerating && days.length > 0 && (
        <div className="flex items-center gap-3 py-4">
          <button
            onClick={handleSaveTrip}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Trip
          </button>
          <button
            onClick={() => setStep('mood')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-primary/10 text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Day
          </button>
        </div>
      )}

      {/* First day - show start button */}
      {!isGenerating && days.length === 0 && (
        <div className="text-center py-4">
          <button
            onClick={() => setStep('mood')}
            className="btn-secondary px-6 py-3 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Start Your Trip
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
