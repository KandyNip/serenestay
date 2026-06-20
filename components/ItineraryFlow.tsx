'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Check, Sparkles, RotateCcw, Save, Share2, Plus, MapPin, Calendar, Target, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import MoodChips, { MOOD_CHIPS, getMoodLabels } from './MoodChips';
import ItineraryDayCard from './ItineraryDayCard';
import ItineraryChatInput from './ItineraryChatInput';
import DisclaimerNote from './DisclaimerNote';
import type { ItinerarySession, DaySummary } from '@/lib/itinerary-session';
import { getSession, saveSession, clearSession, initSession, addDayToSession, isSessionComplete, getPreviousDaysContext } from '@/lib/itinerary-session';
import { saveDayByDayItinerary } from '@/lib/itinerary-storage';
import type { Destination } from '@/lib/types';

interface ItineraryFlowProps {
  destination: Destination;
  initialDays?: number;
  initialFocus?: string;
  proToken?: string;
}

interface DayData {
  dayNumber: number;
  title: string;
  content: string;
  moodChips: string[];
}

type FlowStep = 'setup' | 'mood' | 'generating' | 'review' | 'complete';

export default function ItineraryFlow({ destination, initialDays = 3, initialFocus = 'wellness', proToken }: ItineraryFlowProps) {
  const [step, setStep] = useState<FlowStep>('setup');
  const [totalDays, setTotalDays] = useState(initialDays);
  const [focus, setFocus] = useState(initialFocus);
  const [session, setSession] = useState<ItinerarySession | null>(null);
  const [days, setDays] = useState<DayData[]>([]);
  const [currentMood, setCurrentMood] = useState<string[]>(['chill', 'nature']);
  const [chatNote, setChatNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [expandedOverview, setExpandedOverview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const saved = getSession();
    if (saved && saved.slug === destination.slug) {
      setSession(saved);
      setTotalDays(saved.totalDays);
      setFocus(saved.focus);
      // Rebuild days from session
      if (saved.daysGenerated.length > 0) {
        setStep('review');
      } else {
        setStep('mood');
      }
    }
  }, [destination.slug]);

  const getProToken = (): string => {
    return proToken || (typeof window !== 'undefined' ? localStorage.getItem('serenestay_pro_token') || '' : '');
  };

  const handleStartTrip = () => {
    const newSession = initSession(destination.slug, destination.name, totalDays, focus);
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
          totalDays,
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
      const content: string = data.dayContent || '';

      // Extract title from content
      const titleMatch = content.match(/\*\*Day\s+\d+[:\s]*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1].trim() : `Day ${dayNumber}`;

      const dayData: DayData = {
        dayNumber,
        title,
        content,
        moodChips: moodIds,
      };

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
          title,
          activities: extractActivities(content),
          mood: moodLabels,
        };
        const updatedSession = addDayToSession(session, daySummary);
        setSession(updatedSession);
      }

      // Expand the newly generated day
      setExpandedDays(prev => new Set([...prev, dayNumber]));

      // Check if all days are done
      const completedCount = (session?.daysGenerated.length || 0) + (days.some(d => d.dayNumber === dayNumber) ? 0 : 1);
      if (dayNumber >= totalDays) {
        setStep('complete');
      } else {
        setStep('review');
      }
    } catch (err) {
      console.error('[ItineraryFlow] Error generating day:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate day');
      setStep('review');
    } finally {
      setIsGenerating(false);
    }
  }, [session, destination.slug, totalDays, focus, days]);

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
      totalDays,
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

  const handleShareTrip = async () => {
    const text = `My ${totalDays}-day healing stay in ${destination.name} — planned with SereneStay.ai`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `SereneStay: ${destination.name}`, text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Trip summary copied to clipboard!');
    }
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
  function extractActivities(content: string): string[] {
    const activities: string[] = [];
    const boldMatches = content.matchAll(/\*\*([^*]+)\*\*/g);
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
  const allDaysGenerated = session ? isSessionComplete(session) : false;

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

          {/* Duration */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-primary mb-2">
              How many days?
            </label>
            <div className="flex items-center gap-3">
              {[3, 5, 7, 10, 14].map(d => (
                <button
                  key={d}
                  onClick={() => setTotalDays(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    totalDays === d
                      ? 'bg-secondary text-white'
                      : 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>

          {/* Focus */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-2">
              What's your focus?
            </label>
            <div className="flex flex-wrap gap-2">
              {['wellness', 'adventure', 'culture', 'relaxation'].map(f => (
                <button
                  key={f}
                  onClick={() => setFocus(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    focus === f
                      ? 'bg-secondary text-white'
                      : 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                  }`}
                >
                  {f}
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
  if (step === 'mood' && !allDaysGenerated) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary">
              Day {currentDayNumber} of {totalDays}
            </span>
          </div>
          <div className="flex-1 mx-4 h-2 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${((currentDayNumber - 1) / totalDays) * 100}%` }}
            />
          </div>
          <span className="text-sm text-primary/60">
            {currentDayNumber - 1}/{totalDays} done
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
            <Sparkles className="w-5 h-5" />
            Generate Day {currentDayNumber}
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
                {destination.name} — {totalDays} Days
              </h3>
              <p className="text-xs text-primary/60 capitalize">{focus} focus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary/60">
              {days.length}/{totalDays} days
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
              {/* Remaining days placeholder */}
              {Array.from({ length: totalDays - days.length }, (_, i) => days.length + i + 1).map(d => (
                <div key={d} className="flex items-center gap-3 p-2 opacity-40">
                  <span className="flex items-center justify-center w-7 h-7 bg-primary/5 text-primary/40 rounded-full text-xs font-semibold">
                    {d}
                  </span>
                  <span className="text-sm text-primary/40">Not yet generated</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {allDaysGenerated && (
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-primary/10">
                <button
                  onClick={handleSaveTrip}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Trip
                </button>
                <button
                  onClick={handleShareTrip}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary/60 hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleNewTrip}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary/60 hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
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

      {/* Continue generating or completion */}
      {!allDaysGenerated && !isGenerating && (
        <div className="text-center py-4">
          <button
            onClick={() => setStep('mood')}
            className="btn-secondary px-6 py-3 inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Continue to Day {currentDayNumber}
          </button>
        </div>
      )}

      {allDaysGenerated && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="font-serif text-xl text-primary mb-2">
            Your {totalDays}-Day Itinerary is Ready!
          </h3>
          <p className="text-sm text-primary/60 mb-4">
            Review your days above, regenerate any you'd like to change, or save your trip.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSaveTrip}
              className="btn-secondary px-5 py-2 inline-flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              Save Trip
            </button>
            <button
              onClick={handleNewTrip}
              className="btn-outline px-5 py-2 inline-flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </button>
          </div>
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

      {/* AI disclaimer */}
      <DisclaimerNote />
    </div>
  );
}
