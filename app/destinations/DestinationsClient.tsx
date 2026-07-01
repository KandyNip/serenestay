'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, Compass, MapPin } from 'lucide-react';
import DestinationCard from '@/components/DestinationCard';
import { Destination } from '@/lib/types';

const regions = [
  { value: '', label: 'All Regions' },
  { value: 'Southeast Asia', label: 'Southeast Asia' },
  { value: 'South Asia', label: 'South Asia' },
  { value: 'East Asia', label: 'East Asia' },
  { value: 'Southern Europe', label: 'Southern Europe' },
  { value: 'Central America', label: 'Central America' },
  { value: 'South America', label: 'South America' },
  { value: 'Africa', label: 'Africa' },
];

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'serenity', label: 'Highest Serenity' },
  { value: 'affordability', label: 'Most Affordable' },
  { value: 'wellness', label: 'Best Wellness' },
];

const selectStyles = {
  appearance: 'none' as const,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 'var(--radius-xl)',
  paddingLeft: '1rem',
  paddingRight: '2.5rem',
  paddingTop: '0.625rem',
  paddingBottom: '0.625rem',
  color: 'var(--color-white)',
  fontSize: '0.875rem',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all var(--transition-base)',
};

export default function DestinationsClient({
  initialDestinations,
  initialRegion,
  initialSort,
}: {
  initialDestinations: Destination[];
  initialRegion: string;
  initialSort: string;
}) {
  const router = useRouter();

  const [region, setRegion] = useState(initialRegion);
  const [sort, setSort] = useState(initialSort);

  const destinations = useMemo(() => {
    let filtered = initialDestinations;

    if (region) {
      filtered = filtered.filter((d) => d.region === region);
    }

    const sorted = [...filtered];
    if (sort === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'serenity') {
      sorted.sort((a, b) => b.scores.serenity - a.scores.serenity);
    } else if (sort === 'affordability') {
      sorted.sort((a, b) => b.scores.affordability - a.scores.affordability);
    } else if (sort === 'wellness') {
      sorted.sort((a, b) => b.scores.wellness - a.scores.wellness);
    }

    return sorted;
  }, [initialDestinations, region, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (sort && sort !== 'name') params.set('sort', sort);

    const queryString = params.toString();
    router.push(`/destinations${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [region, sort, router]);

  const groupedDestinations = destinations.reduce((acc, dest) => {
    const regionName = dest.region || 'Other';
    if (!acc[regionName]) {
      acc[regionName] = [];
    }
    acc[regionName].push(dest);
    return acc;
  }, {} as Record<string, Destination[]>);

  const formatRegionLabel = (regionValue: string): string => {
    const found = regions.find(r => r.value === regionValue);
    return found?.label || regionValue;
  };

  return (
    <div>
      <div
        className="sticky z-30 py-4 -mx-4 px-4 mb-10"
        style={{
          top: '64px',
          background: 'rgba(14,36,25,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="container-max mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={selectStyles}
                aria-label="Filter by region"
                className="hover:border-white/25 focus:border-[var(--color-sky-light)]"
              >
                {regions.map((r) => (
                  <option key={r.value} value={r.value} style={{ background: 'var(--color-forest-deep)', color: 'var(--color-white)' }}>
                    {r.label}
                  </option>
                ))}
              </select>
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-white-40)' }} />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={selectStyles}
                aria-label="Sort destinations"
                className="hover:border-white/25 focus:border-[var(--color-sky-light)]"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value} style={{ background: 'var(--color-forest-deep)', color: 'var(--color-white)' }}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-white-40)' }} />
            </div>

            {(region || sort !== 'name') && (
              <button
                onClick={() => {
                  setRegion('');
                  setSort('name');
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors rounded-xl hover:bg-white/5"
                style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}>
            <Compass className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
            {destinations.length} destination{destinations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {destinations.length === 0 && (
        <div className="text-center py-20">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Search className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          <h3
            className="text-2xl mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
          >
            No destinations found
          </h3>
          <p
            className="mb-8 max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
          >
            Try adjusting your filters or exploring a different region.
          </p>
          <button
            onClick={() => {
              setRegion('');
              setSort('name');
            }}
            className="btn-outline-light"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {destinations.length > 0 && (
        <div>
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
            Object.entries(groupedDestinations).map(([regionName, dests]) => (
              <div key={regionName} className="mb-14">
                <div className="flex items-center gap-4 mb-6">
                  <h2
                    className="flex items-center gap-2 text-2xl"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: 'var(--color-moss)' }} />
                    {formatRegionLabel(regionName)}
                  </h2>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-white-40)', fontFamily: 'var(--font-body)' }}
                  >
                    {dests.length} destination{dests.length !== 1 ? 's' : ''}
                  </span>
                </div>

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
