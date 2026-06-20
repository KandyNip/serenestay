'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Lock, Trash2, Sparkles, Map } from 'lucide-react';
import { checkProStatus } from '@/lib/api';
import { getFavorites, removeFavorite, clearFavorites } from '@/lib/favorites';
import { getSavedItineraries, removeItinerary, clearItineraries } from '@/lib/itinerary-storage';
import type { SavedItinerary } from '@/lib/itinerary-storage';
import type { Destination } from '@/lib/types';
import ItineraryModal from '@/components/ItineraryModal';

export default function FavoritesPage() {
  const [isPro, setIsPro] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'destinations' | 'itineraries'>('destinations');
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);

  useEffect(() => {
    const pro = checkProStatus();
    setIsPro(pro);

    const saved = getFavorites();
    setFavorites(saved);
    setItineraries(getSavedItineraries());

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

  const handleClearItineraries = () => {
    if (confirm('Remove all saved itineraries?')) {
      clearItineraries();
      setItineraries([]);
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
          itineraries.length === 0 ? (
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
                  {itineraries.length} trip{itineraries.length !== 1 ? 's' : ''} saved
                </p>
                <button
                  onClick={handleClearItineraries}
                  className="text-sm text-primary/40 hover:text-rose-500 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Itineraries Grid */}
              <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
