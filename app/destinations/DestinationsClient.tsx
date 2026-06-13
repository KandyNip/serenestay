'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import DestinationCard from '@/components/DestinationCard';
import { fetchDestinations } from '@/lib/api';
import { Destination } from '@/lib/types';

// Region options
const regions = [
  { value: '', label: 'All Regions' },
  { value: 'Southeast Asia', label: 'Southeast Asia' },
  { value: 'Central America', label: 'Central America' },
  { value: 'South America', label: 'South America' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Oceania', label: 'Oceania' },
  { value: 'Africa', label: 'Africa' },
];

// Sort options
const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'serenity', label: 'Highest Serenity' },
  { value: 'affordability', label: 'Most Affordable' },
  { value: 'wellness', label: 'Best Wellness' },
];

export default function DestinationsClient({
  initialRegion,
  initialSort,
}: {
  initialRegion: string;
  initialSort: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState(initialRegion);
  const [sort, setSort] = useState(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch destinations with filters
  const loadDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchDestinations({
        region: region || undefined,
        sort: sort as 'name' | 'serenity' | 'affordability' | 'wellness',
      });
      setDestinations(data.destinations);
    } catch (err) {
      setError('Failed to load destinations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [region, sort]);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (sort && sort !== 'name') params.set('sort', sort);
    
    const queryString = params.toString();
    router.push(`/destinations${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [region, sort, router]);

  // Group destinations by region
  const groupedDestinations = destinations.reduce((acc, dest) => {
    const regionName = dest.region || 'Other';
    if (!acc[regionName]) {
      acc[regionName] = [];
    }
    acc[regionName].push(dest);
    return acc;
  }, {} as Record<string, Destination[]>);

  // Format region label
  const formatRegionLabel = (regionValue: string): string => {
    const found = regions.find(r => r.value === regionValue);
    return found?.label || regionValue;
  };

  return (
    <div>
      {/* Filters Bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-surface/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-8 border-b border-primary/10">
        <div className="container-full mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Region Select */}
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="appearance-none bg-white border border-primary/20 rounded-lg pl-4 pr-10 py-2.5 text-primary text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 cursor-pointer"
                aria-label="Filter by region"
              >
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 pointer-events-none" />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white border border-primary/20 rounded-lg pl-4 pr-10 py-2.5 text-primary text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 cursor-pointer"
                aria-label="Sort destinations"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(region || sort !== 'name') && (
              <button
                onClick={() => {
                  setRegion('');
                  setSort('name');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-secondary hover:text-secondary-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <p className="text-sm text-primary/60">
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `${destinations.length} destination${destinations.length !== 1 ? 's' : ''}`
            )}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-danger">{error}</p>
          <button
            onClick={loadDestinations}
            className="mt-4 btn-outline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="animate-pulse">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-card">
                <div className="h-48 bg-primary/10" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-primary/10 rounded w-3/4" />
                  <div className="h-4 bg-primary/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && destinations.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-primary mb-2">
            No destinations found
          </h3>
          <p className="text-primary/60 mb-4">
            Try adjusting your filters or exploring a different region.
          </p>
          <button
            onClick={() => {
              setRegion('');
              setSort('name');
            }}
            className="btn-outline"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Destinations Grid */}
      {!loading && !error && destinations.length > 0 && (
        <div>
          {/* If filtering by region, show simple grid */}
          {region ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((destination, index) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            /* Grouped by region */
            Object.entries(groupedDestinations).map(([regionName, dests]) => (
              <div key={regionName} className="mb-12">
                {/* Region Header */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-serif text-2xl text-primary">
                    {formatRegionLabel(regionName)}
                  </h2>
                  <div className="flex-1 h-px bg-primary/10" />
                  <span className="text-sm text-primary/50">
                    {dests.length} destination{dests.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Region Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {dests.map((destination, index) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      priority={index < 2}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
