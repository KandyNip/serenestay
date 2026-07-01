import Link from 'next/link';
import { Compass, TreePine, Home, Map } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-lg">
          <div className="relative mb-8">
            <div 
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 animate-float-gentle"
              style={{ background: 'rgba(107,158,126,0.15)' }}
            >
              <Compass className="w-12 h-12" style={{ color: 'var(--color-moss)' }} />
            </div>
            <TreePine 
              className="absolute -bottom-2 -right-4 w-8 h-8 opacity-40"
              style={{ color: 'var(--color-canopy)' }}
            />
            <TreePine 
              className="absolute -bottom-1 -left-6 w-6 h-6 opacity-30"
              style={{ color: 'var(--color-moss)' }}
            />
          </div>

          <h1 
            className="text-7xl sm:text-8xl mb-4"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-white-20)'
            }}
          >
            404
          </h1>

          <h2 
            className="text-2xl sm:text-3xl mb-4"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-white)'
            }}
          >
            This path leads nowhere
          </h2>

          <p style={{ color: 'var(--color-white-60)' }} className="mb-8 text-lg leading-relaxed">
            Looks like this destination isn&apos;t on our map yet. 
            Let&apos;s get you back to a place of calm and healing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--color-sky)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'transparent',
                color: 'var(--color-white)',
                border: '1px solid var(--color-white-20)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Map className="w-4 h-4" />
              Explore Destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
