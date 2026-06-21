'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Lock, Trash2, Sparkles, Map, Calendar, X } from 'lucide-react';
import { checkProStatus } from '@/lib/api';
import { getFavorites, removeFavorite, clearFavorites } from '@/lib/favorites';
import { getSavedItineraries, removeItinerary, clearItineraries, getSavedDayByDayItineraries, removeDayByDayItinerary, getSavedHealingJourneys, removeHealingJourney } from '@/lib/itinerary-storage';
import type { SavedItinerary, SavedDayByDayItinerary, SavedHealingJourney } from '@/lib/itinerary-storage';
import { USER_STATES, USER_INTENTIONS } from '@/lib/healing-types';
import type { Destination } from '@/lib/types';
import ItineraryModal from '@/components/ItineraryModal';
import ItineraryDayCard from '@/components/ItineraryDayCard';

export default function FavoritesPage() {
  const [isPro, setIsPro] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [dayByDayItineraries, setDayByDayItineraries] = useState<SavedDayByDayItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'destinations' | 'itineraries'>('destinations');
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);
  const [selectedDayByDay, setSelectedDayByDay] = useState<SavedDayByDayItinerary | null>(null);
  const [healingJourneys, setHealingJourneys] = useState<SavedHealingJourney[]>([]);
  const [selectedHealingJourney, setSelectedHealingJourney] = useState<SavedHealingJourney | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const pro = checkProStatus();
    setIsPro(pro);

    const saved = getFavorites();
    setFavorites(saved);
    setItineraries(getSavedItineraries());
    setDayByDayItineraries(getSavedDayByDayItineraries());
    setHealingJourneys(getSavedHealingJourneys());

    // Fetch all destinations and filter by saved slugs
    fetch('/api/destinations?fields=card')
      .then(r => r.json())
      .then((data: { destinations: Destination[] }) => {
        const all = data.destinations || [];
        const filtered = all.filter((d: Destination) => saved.includes(d.slug));
        setDestinations(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRemove = (slug: string) => {
    removeFavorite(slug);
    setFavorites(getFavorites());
    setDestinations(prev => prev.filter(d => d.slug !== slug));
  };

  const handleClearAll = () => {
    if (confirm('Remove all saved destinations?')) {
      clearFavorites();
      setFavorites([]);
      setDestinations([]);
    }
  };

  const handleRemoveItinerary = (slug: string, phase: number, focus: string) => {
    removeItinerary(slug, phase, focus);
    setItineraries(getSavedItineraries());
  };

  const handleRemoveDayByDay = (id: string) => {
    removeDayByDayItinerary(id);
    setDayByDayItineraries(getSavedDayByDayItineraries());
  };

  const handleRemoveHealingJourney = (id: string) => {
    removeHealingJourney(id);
    setHealingJourneys(getSavedHealingJourneys());
  };

  const handleClearItineraries = () => {
    if (confirm('Remove all saved itineraries?')) {
      clearItineraries();
      setItineraries([]);
      setDayByDayItineraries([]);
      setHealingJourneys([]);
    }
  };

  // Free users: locked page
  if (!isPro) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container-full px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/5 rounded-full mb-6">
              <Lock className="w-10 h-10 text-primary/30" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-4">
              Pro Feature
            </h1>
            <p className="text-primary/60 mb-8">
              Save your favorite destinations and build a personalized shortlist with SereneStay Pro.
            </p>
            <Link
              href="/pricing"
              className="btn-secondary px-8 py-3 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pro users: favorites page with tabs
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="container-full px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full text-rose-600 text-sm mb-6">
          <Heart className="w-4 h-4 fill-rose-500" />
          <span>Your Shortlist</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-primary">
          Saved
        </h1>
        <p className="mt-4 text-primary/60 max-w-xl mx-auto">
          Your curated collection of healing stays and personalized itineraries.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'destinations'
                ? 'bg-rose-50 text-rose-600'
                : 'text-primary/40 hover:text-primary/60'
            }`}
          >
            <Heart className="w-4 h-4" />
            Destinations
          </button>
          <button
            onClick={() => setActiveTab('itineraries')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'itineraries'
                ? 'bg-[#6b8f71]/10 text-[#6b8f71]'
                : 'text-primary/40 hover:text-primary/60'
            }`}
          >
            <Map className="w-4 h-4" />
            Itineraries
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container-full px-4 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-primary/50">Loading...</p>
          </div>
        ) : activeTab === 'destinations' ? (
          /* Destinations Tab */
          destinations.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/5 rounded-full mb-4">
                <Heart className="w-8 h-8 text-primary/30" />
              </div>
              <h2 className="font-serif text-xl text-primary mb-2">No saved destinations yet</h2>
              <p className="text-primary/60 mb-6">
                Browse destinations and tap the heart icon to save your favorites here.
              </p>
              <Link
                href="/destinations"
                className="btn-secondary px-6 py-3 inline-flex items-center gap-2"
              >
                Browse Destinations
              </Link>
            </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex items-center justify-between max-w-5xl mx-auto mb-6">
                <p className="text-sm text-primary/50">
                  {destinations.length} destination{destinations.length !== 1 ? 's' : ''} saved
                </p>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-primary/40 hover:text-rose-500 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Destinations Grid */}
              <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                  <div key={dest.slug} className="relative group">
                    <Link
                      href={`/destinations/${dest.slug}`}
                      className="block bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={dest.images[0]}
                          alt={dest.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Remove button (hover reveal) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(dest.slug);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                        {/* Saved badge */}
                        <div className="absolute top-3 left-3 p-1.5 bg-white/90 rounded-full shadow-sm">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-serif text-lg text-primary">{dest.name}</h3>
                        <p className="text-sm text-primary/50 mt-1">{dest.country} · {dest.region}</p>
                        <p className="text-sm text-primary/60 mt-2 line-clamp-2">{dest.tagline}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          /* Itineraries Tab */
          (itineraries.length === 0 && dayByDayItineraries.length === 0 && healingJourneys.length === 0) ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/5 rounded-full mb-4">
                <Map className="w-8 h-8 text-primary/30" />
              </div>
              <h2 className="font-serif text-xl text-primary mb-2">No saved itineraries yet</h2>
              <p className="text-primary/60 mb-6">
                Generate and save trip itineraries to revisit them here.
              </p>
              <Link
                href="/destinations"
                className="btn-secondary px-6 py-3 inline-flex items-center gap-2"
              >
                Browse Destinations
              </Link>
            </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex items-center justify-between max-w-5xl mx-auto mb-6">
                <p className="text-sm text-primary/50">
                  {itineraries.length + dayByDayItineraries.length + healingJourneys.length} trip{(itineraries.length + dayByDayItineraries.length + healingJourneys.length) !== 1 ? 's' : ''} saved
                </p>
                <button
                  onClick={handleClearItineraries}
                  className="text-sm text-primary/40 hover:text-rose-500 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Healing Journeys */}
              {healingJourneys.length > 0 && (
                <div className="max-w-5xl mx-auto mb-8">
                  <h3 className="text-sm font-medium text-primary/60 mb-3 flex items-center gap-2">
                    <span>🌿</span>
                    Healing Journeys
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {healingJourneys.map((j) => {
                      const stateInfo = USER_STATES.find(s => s.id === j.currentState);
                      const intentionLabels = j.intentions.map(i => USER_INTENTIONS.find(ii => ii.id === i)?.label || i);
                      return (
                        <div key={j.id} className="relative group">
                          <div
                            onClick={() => {
                              setSelectedHealingJourney(j);
                              setExpandedDays(new Set());
                            }}
                            className="block bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            {/* Gradient cover */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-emerald-100 to-amber-50 flex items-center justify-center">
                              <span className="text-4xl">🌿</span>
                              {/* Remove button (hover reveal) */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveHealingJourney(j.id);
                                }}
                                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                                title="Remove journey"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                              </button>
                              {/* Duration badge */}
                              <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 rounded-full shadow-sm text-xs font-medium text-emerald-700">
                                {j.totalDays} {j.totalDays === 1 ? 'Day' : 'Days'}
                              </div>
                            </div>
                            {/* Info */}
                            <div className="p-4">
                              <h3 className="font-serif text-lg text-primary">{j.destinationName}</h3>
                              <p className="text-sm text-primary/50 mt-1 flex items-center gap-1">
                                <span>{stateInfo?.emoji}</span>
                                <span className="capitalize">{stateInfo?.label || j.currentState}</span>
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {intentionLabels.slice(0, 3).map(label => (
                                  <span key={label} className="text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-full">
                                    {label}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-primary/40 mt-2">
                                Saved {new Date(j.savedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day-by-Day Itineraries */}
              {dayByDayItineraries.length > 0 && (
                <div className="max-w-5xl mx-auto mb-8">
                  <h3 className="text-sm font-medium text-primary/60 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Day-by-Day Plans
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dayByDayItineraries.map((it) => (
                      <div key={it.id} className="relative group">
                        <div
                          onClick={() => {
                            setSelectedDayByDay(it);
                            setExpandedDays(new Set());
                          }}
                          className="block bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                          {/* Gradient cover */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-secondary/40" />
                            {/* Remove button (hover reveal) */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveDayByDay(it.id);
                              }}
                              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                              title="Remove itinerary"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                            {/* Duration badge */}
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 rounded-full shadow-sm text-xs font-medium text-secondary">
                              {it.totalDays} Days
                            </div>
                          </div>
                          {/* Info */}
                          <div className="p-4">
                            <h3 className="font-serif text-lg text-primary">{it.destinationName}</h3>
                            <p className="text-sm text-primary/50 mt-1 capitalize">{it.focus} focus</p>
                            <p className="text-xs text-primary/40 mt-2">
                              {it.days.length} days planned · Saved {new Date(it.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase-based Itineraries */}
              {itineraries.length > 0 && (
                <div className="max-w-5xl mx-auto">
                  {dayByDayItineraries.length > 0 && (
                    <h3 className="text-sm font-medium text-primary/60 mb-3 flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Full Trip Itineraries
                    </h3>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itineraries.map((it) => (
                      <div key={`${it.slug}-${it.duration}-${it.focus}`} className="relative group">
                        <div
                          onClick={() => setSelectedItinerary(it)}
                          className="block bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                          {/* Cover image or gradient */}
                          <div className="relative aspect-[16/10] overflow-hidden">
                            {it.coverImage ? (
                              <Image
                                src={it.coverImage}
                                alt={it.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#6b8f71]/20 to-[#e8b960]/20 flex items-center justify-center">
                                <Map className="w-12 h-12 text-[#6b8f71]/40" />
                              </div>
                            )}
                            {/* Remove button (hover reveal) */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveItinerary(it.slug, it.phase, it.focus);
                              }}
                              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                              title="Remove itinerary"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                            {/* Duration badge */}
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 rounded-full shadow-sm text-xs font-medium text-[#6b8f71]">
                              {it.duration} Days
                            </div>
                          </div>
                          {/* Info */}
                          <div className="p-4">
                            <h3 className="font-serif text-lg text-primary">{it.name}</h3>
                            <p className="text-sm text-primary/50 mt-1 capitalize">{it.focus} focus</p>
                            <p className="text-xs text-primary/40 mt-2">
                              Saved {new Date(it.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Itinerary Modal */}
      {selectedItinerary && (
        <ItineraryModal
          itinerary={selectedItinerary}
          onClose={() => setSelectedItinerary(null)}
          onDelete={() => {
            if (selectedItinerary) {
              handleRemoveItinerary(selectedItinerary.slug, selectedItinerary.phase, selectedItinerary.focus);
              setSelectedItinerary(null);
            }
          }}
        />
      )}

      {/* Day-by-Day Itinerary Viewer */}
      {selectedDayByDay && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedDayByDay(null)}
        >
          <div
            className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-primary/10 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-serif text-2xl text-primary">{selectedDayByDay.destinationName}</h2>
                <p className="text-sm text-primary/60 mt-0.5 capitalize">
                  {selectedDayByDay.totalDays}-day {selectedDayByDay.focus} trip
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm('Delete this trip?')) {
                      handleRemoveDayByDay(selectedDayByDay.id);
                      setSelectedDayByDay(null);
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete trip"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedDayByDay(null)}
                  className="p-2 text-primary/60 hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days */}
            <div className="p-6 space-y-3">
              {selectedDayByDay.days.map((day) => (
                <ItineraryDayCard
                  key={day.dayNumber}
                  dayNumber={day.dayNumber}
                  title={day.title}
                  content={day.content}
                  moodChips={day.moodChips}
                  isExpanded={expandedDays.has(day.dayNumber)}
                  onToggle={() => {
                    const next = new Set(expandedDays);
                    if (next.has(day.dayNumber)) next.delete(day.dayNumber);
                    else next.add(day.dayNumber);
                    setExpandedDays(next);
                  }}
                  onRegenerate={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Healing Journey Viewer Modal ─── */}
      {selectedHealingJourney && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-amber-50 px-6 py-4 flex items-center justify-between border-b border-primary/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌿</span>
                <div>
                  <h2 className="font-serif text-xl text-primary">{selectedHealingJourney.destinationName}</h2>
                  <p className="text-sm text-primary/50 flex items-center gap-1">
                    {USER_STATES.find(s => s.id === selectedHealingJourney.currentState)?.emoji}{' '}
                    <span className="capitalize">{USER_STATES.find(s => s.id === selectedHealingJourney.currentState)?.label || selectedHealingJourney.currentState}</span>
                    <span className="mx-1">·</span>
                    {selectedHealingJourney.totalDays} {selectedHealingJourney.totalDays === 1 ? 'Day' : 'Days'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm('Delete this healing journey?')) {
                      handleRemoveHealingJourney(selectedHealingJourney.id);
                      setSelectedHealingJourney(null);
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete journey"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedHealingJourney(null)}
                  className="p-2 text-primary/60 hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Intentions */}
            <div className="px-6 py-3 border-b border-primary/5 flex flex-wrap gap-1.5">
              {selectedHealingJourney.intentions.map(i => {
                const info = USER_INTENTIONS.find(ii => ii.id === i);
                return (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                    {info?.emoji} {info?.label || i}
                  </span>
                );
              })}
            </div>

            {/* Days */}
            <div className="p-6 space-y-3">
              {selectedHealingJourney.days.map((day) => (
                <ItineraryDayCard
                  key={day.dayNumber}
                  dayNumber={day.dayNumber}
                  title={day.title}
                  content={day.content}
                  moodChips={[]}
                  isExpanded={expandedDays.has(day.dayNumber)}
                  onToggle={() => {
                    const next = new Set(expandedDays);
                    if (next.has(day.dayNumber)) next.delete(day.dayNumber);
                    else next.add(day.dayNumber);
                    setExpandedDays(next);
                  }}
                  onRegenerate={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
