import { Suspense } from 'react';
import { Metadata } from 'next';
import DestinationsClient from './DestinationsClient';
import { loadDestinations } from '@/lib/destinations';
import type { Destination } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Explore Destinations',
  description: 'Browse our curated collection of healing retreats and wellness destinations around the world.',
};

interface PageProps {
  searchParams: Promise<{
    region?: string;
    sort?: string;
  }>;
}

export default async function DestinationsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Load destinations server-side
  let initialDestinations: Destination[] = [];
  try {
    initialDestinations = await loadDestinations();
  } catch (error) {
    console.error('Failed to load destinations:', error);
  }

  return (
    <div className="pt-20 pb-16">
      <div className="container-full px-4">
        {/* Header */}
        <div className="py-12 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-primary">
            Healing Retreats
          </h1>
          <p className="mt-4 text-primary/60 max-w-2xl mx-auto">
            Discover sanctuaries around the world, carefully curated for your wellness journey.
            From tropical paradises to mountain monasteries.
          </p>
        </div>

        {/* Client Component for Filtering */}
        <Suspense fallback={<DestinationsSkeleton />}>
          <DestinationsClient
            initialDestinations={initialDestinations}
            initialRegion={params.region || ''}
            initialSort={params.sort || 'name'}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Loading skeleton
function DestinationsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Filter Skeleton */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <div className="h-10 w-40 bg-primary/10 rounded-lg" />
        <div className="h-10 w-40 bg-primary/10 rounded-lg" />
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-card">
            <div className="h-48 bg-primary/10" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-primary/10 rounded w-3/4" />
              <div className="h-4 bg-primary/10 rounded w-1/2" />
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-primary/10 rounded-full w-16" />
                <div className="h-6 bg-primary/10 rounded-full w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
