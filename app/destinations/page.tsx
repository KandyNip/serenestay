import { Suspense } from 'react';
import { Metadata } from 'next';
import { Compass, MapPin, Leaf } from 'lucide-react';
import DestinationsClient from './DestinationsClient';
import WaveDivider from '@/components/WaveDivider';
import { loadDestinations } from '@/lib/destinations';
import type { Destination } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Explore Destinations',
  description: 'Browse our curated collection of healing stays and wellness destinations around the world.',
};

const heroImage = '/nature/nat-forest.jpg';

interface PageProps {
  searchParams: Promise<{
    region?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function DestinationsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let initialDestinations: Destination[] = [];
  try {
    initialDestinations = await loadDestinations();
  } catch (error) {
    console.error('Failed to load destinations:', error);
  }

  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <section
        className="relative flex items-center justify-center immersive-section"
        style={{ backgroundImage: `url(${heroImage})`, minHeight: '60vh' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(14,36,25,0.4) 0%, rgba(14,36,25,0.7) 60%, rgba(14,36,25,0.95) 100%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-12">
          <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in-up">
            <Compass className="w-6 h-6" style={{ color: 'var(--color-sky-light)' }} />
            <span
              className="text-sm tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
            >
              Curated Sanctuaries
            </span>
          </div>

          <h1
            className="balance-text text-shadow-medium animate-fade-in-up stagger-1"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              color: 'var(--color-white)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Healing Stays
          </h1>
          <p
            className="mt-5 text-lg max-w-2xl mx-auto text-shadow-soft animate-fade-in-up stagger-2"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            Discover sanctuaries around the world, carefully curated for your wellness journey.
            From tropical paradises to mountain monasteries.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm animate-fade-in-up stagger-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
              {initialDestinations.length} destinations
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full" style={{ background: 'var(--color-white-20)' }} />
            <span className="hidden sm:flex items-center gap-1.5">
              <Leaf className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
              7 regions worldwide
            </span>
          </div>
        </div>
      </section>

      <WaveDivider fill="#0E2419" variant="forest" height={80} />

      <div className="pb-20" style={{ background: 'var(--color-forest-deep)' }}>
        <div className="container-max px-4 sm:px-6">
          <Suspense fallback={<DestinationsSkeleton />}>
            <DestinationsClient
              initialDestinations={initialDestinations}
              initialRegion={params.region || ''}
              initialSort={params.sort || 'name'}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function DestinationsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <div className="h-11 w-44 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="h-11 w-44 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="h-52" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="p-5 space-y-3">
              <div className="h-5 rounded w-3/4" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="h-4 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex gap-2 mt-4">
                <div className="h-6 rounded-full w-16" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-6 rounded-full w-16" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
