'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, Map, Calendar, X, Compass, Leaf } from 'lucide-react';
import { getFavorites, removeFavorite, clearFavorites } from '@/lib/favorites';
import { getSavedItineraries, removeItinerary, clearItineraries, getSavedDayByDayItineraries, removeDayByDayItinerary, getSavedHealingJourneys, removeHealingJourney } from '@/lib/itinerary-storage';
import type { SavedItinerary, SavedDayByDayItinerary, SavedHealingJourney } from '@/lib/itinerary-storage';
import { USER_STATES, USER_INTENTIONS } from '@/lib/healing-types';
import type { Destination } from '@/lib/types';
import ItineraryModal from '@/components/ItineraryModal';
import ItineraryDayCard from '@/components/ItineraryDayCard';
import LucideIcon from '@/components/LucideIcon';

export default function FavoritesPage() {
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
    const saved = getFavorites();
    setFavorites(saved);
    setItineraries(getSavedItineraries());
    setDayByDayItineraries(getSavedDayByDayItineraries());
    setHealingJourneys(getSavedHealingJourneys());

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

  const glassCardStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
  };

  const inputLikeStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh', paddingTop: '80px', paddingBottom: '64px' }}>
      <div className="container-max px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6" style={{ background: 'rgba(91,143,168,0.15)', color: 'var(--color-sky-light)' }}>
          <Heart className="w-4 h-4" style={{ fill: 'var(--color-sky)' }} />
          <span style={{ fontFamily: 'var(--font-body)' }}>Your Shortlist</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 48px)', color: 'var(--color-white)' }}>
          Saved
        </h1>
        <p className="mt-4 max-w-xl mx-auto" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
          Your curated collection of healing stays and personalized itineraries.
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors`}
            style={{
              fontFamily: 'var(--font-body)',
              background: activeTab === 'destinations' ? 'rgba(107,158,126,0.2)' : 'transparent',
              color: activeTab === 'destinations' ? 'var(--color-moss)' : 'var(--color-white-40)',
              border: activeTab === 'destinations' ? '1px solid rgba(107,158,126,0.3)' : '1px solid transparent',
            }}
          >
            <Heart className="w-4 h-4" />
            Destinations
          </button>
          <button
            onClick={() => setActiveTab('itineraries')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors`}
            style={{
              fontFamily: 'var(--font-body)',
              background: activeTab === 'itineraries' ? 'rgba(91,143,168,0.15)' : 'transparent',
              color: activeTab === 'itineraries' ? 'var(--color-sky-light)' : 'var(--color-white-40)',
              border: activeTab === 'itineraries' ? '1px solid rgba(91,143,168,0.3)' : '1px solid transparent',
            }}
          >
            <Map className="w-4 h-4" />
            Itineraries
          </button>
        </div>
      </div>

      <div className="container-max px-4 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>Loading...</p>
          </div>
        ) : activeTab === 'destinations' ? (
          destinations.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Heart className="w-8 h-8" style={{ color: 'var(--color-white-40)' }} />
              </div>
              <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>No saved destinations yet</h2>
              <p className="mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                Browse destinations and tap the heart icon to save your favorites here.
              </p>
              <Link
                href="/destinations"
                className="px-6 py-3 inline-flex items-center gap-2 transition-all hover:scale-105"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '9999px',
                  color: 'var(--color-white)',
                  fontWeight: 600,
                }}
              >
                <Compass className="w-4 h-4" />
                Browse Destinations
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between max-w-5xl mx-auto mb-6">
                <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
                  {destinations.length} destination{destinations.length !== 1 ? 's' : ''} saved
                </p>
                <button
                  onClick={handleClearAll}
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-sand)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-white-40)'}
                >
                  Clear All
                </button>
              </div>

              <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                  <div key={dest.slug} className="relative group">
                    <Link
                      href={`/destinations/${dest.slug}`}
                      className="block overflow-hidden transition-all hover:scale-[1.02]"
                      style={glassCardStyle}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={dest.images[0]}
                          alt={dest.name}
                          fill
                          className="object-cover transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,36,25,0.5) 0%, transparent 50%)' }} />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(dest.slug);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />
                        </button>
                        <div className="absolute top-3 left-3 p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                          <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-moss)', fill: 'var(--color-moss)' }} />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>{dest.name}</h3>
                        <p className="text-sm mt-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>{dest.country} · {dest.region}</p>
                        <p className="text-sm mt-2 line-clamp-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>{dest.tagline}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          (itineraries.length === 0 && dayByDayItineraries.length === 0 && healingJourneys.length === 0) ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Map className="w-8 h-8" style={{ color: 'var(--color-white-40)' }} />
              </div>
              <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>No saved itineraries yet</h2>
              <p className="mb-6" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                Generate and save trip itineraries to revisit them here.
              </p>
              <Link
                href="/destinations"
                className="px-6 py-3 inline-flex items-center gap-2 transition-all hover:scale-105"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '9999px',
                  color: 'var(--color-white)',
                  fontWeight: 600,
                }}
              >
                <Compass className="w-4 h-4" />
                Browse Destinations
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between max-w-5xl mx-auto mb-6">
                <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
                  {itineraries.length + dayByDayItineraries.length + healingJourneys.length} trip{(itineraries.length + dayByDayItineraries.length + healingJourneys.length) !== 1 ? 's' : ''} saved
                </p>
                <button
                  onClick={handleClearItineraries}
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-sand)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-white-40)'}
                >
                  Clear All
                </button>
              </div>

              {healingJourneys.length > 0 && (
                <div className="max-w-5xl mx-auto mb-8">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                    <Leaf className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
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
                            className="block overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                            style={glassCardStyle}
                          >
                            <div className="relative aspect-[16/10] overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(58,125,92,0.3), rgba(212,197,169,0.2))' }}>
                              <Leaf className="w-12 h-12" style={{ color: 'var(--color-moss)' }} />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveHealingJourney(j.id);
                                }}
                                className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                                title="Remove journey"
                              >
                                <Trash2 className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />
                              </button>
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(107,158,126,0.3)', backdropFilter: 'blur(8px)', color: 'var(--color-moss)' }}>
                                {j.totalDays} {j.totalDays === 1 ? 'Day' : 'Days'}
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>{j.destinationName}</h3>
                              <p className="text-sm mt-1 flex items-center gap-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                                {stateInfo && <LucideIcon name={stateInfo.emoji} className="w-4 h-4" />}
                                <span className="capitalize">{stateInfo?.label || j.currentState}</span>
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {intentionLabels.slice(0, 3).map(label => (
                                  <span key={label} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(91,143,168,0.15)', color: 'var(--color-sky-light)' }}>
                                    {label}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs mt-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
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

              {dayByDayItineraries.length > 0 && (
                <div className="max-w-5xl mx-auto mb-8">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
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
                          className="block overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                          style={glassCardStyle}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Calendar className="w-12 h-12" style={{ color: 'var(--color-white-20)' }} />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveDayByDay(it.id);
                              }}
                              className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                              title="Remove itinerary"
                            >
                              <Trash2 className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />
                            </button>
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(91,143,168,0.2)', backdropFilter: 'blur(8px)', color: 'var(--color-sky-light)' }}>
                              {it.totalDays} Days
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>{it.destinationName}</h3>
                            <p className="text-sm mt-1 capitalize" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>{it.focus} focus</p>
                            <p className="text-xs mt-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
                              {it.days.length} days planned · Saved {new Date(it.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itineraries.length > 0 && (
                <div className="max-w-5xl mx-auto">
                  {dayByDayItineraries.length > 0 && (
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                      <Map className="w-4 h-4" />
                      Full Trip Itineraries
                    </h3>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itineraries.map((it) => (
                      <div key={`${it.slug}-${it.duration}-${it.focus}`} className="relative group">
                        <div
                          onClick={() => setSelectedItinerary(it)}
                          className="block overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                          style={glassCardStyle}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            {it.coverImage ? (
                              <Image
                                src={it.coverImage}
                                alt={it.name}
                                fill
                                className="object-cover transition-transform duration-500"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(58,125,92,0.2), rgba(212,197,169,0.15))' }}>
                                <Map className="w-12 h-12" style={{ color: 'var(--color-white-20)' }} />
                              </div>
                            )}
                            <div className="absolute inset-0" style={{ background: it.coverImage ? 'linear-gradient(to top, rgba(14,36,25,0.4) 0%, transparent 50%)' : 'transparent' }} />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveItinerary(it.slug, it.phase, it.focus);
                              }}
                              className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                              title="Remove itinerary"
                            >
                              <Trash2 className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />
                            </button>
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(107,158,126,0.3)', backdropFilter: 'blur(8px)', color: 'var(--color-moss)' }}>
                              {it.duration} Days
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>{it.name}</h3>
                            <p className="text-sm mt-1 capitalize" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>{it.focus} focus</p>
                            <p className="text-xs mt-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
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

      {selectedDayByDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedDayByDay(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ ...glassCardStyle, background: 'rgba(14,36,25,0.95)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between z-10" style={{ background: 'rgba(14,36,25,0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>{selectedDayByDay.destinationName}</h2>
                <p className="text-sm mt-0.5 capitalize" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
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
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-sand)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,197,169,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Delete trip"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedDayByDay(null)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-white-60)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

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

      {selectedHealingJourney && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-3xl my-8 overflow-hidden" style={glassCardStyle}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(to right, rgba(58,125,92,0.3), rgba(212,197,169,0.2))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                <Leaf className="w-6 h-6" style={{ color: 'var(--color-moss)' }} />
                <div>
                  <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>{selectedHealingJourney.destinationName}</h2>
                  <p className="text-sm flex items-center gap-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                    {(() => {
                      const state = USER_STATES.find(s => s.id === selectedHealingJourney.currentState);
                      return state ? <LucideIcon name={state.emoji} className="w-4 h-4" /> : null;
                    })()}{' '}
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
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-sand)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,197,169,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Delete journey"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedHealingJourney(null)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-white-60)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 flex flex-wrap gap-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {selectedHealingJourney.intentions.map(i => {
                const info = USER_INTENTIONS.find(ii => ii.id === i);
                return (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full" style={{ background: 'rgba(91,143,168,0.15)', color: 'var(--color-sky-light)' }}>
                    {info && <LucideIcon name={info.emoji} className="w-3 h-3" />} {info?.label || i}
                  </span>
                );
              })}
            </div>

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
