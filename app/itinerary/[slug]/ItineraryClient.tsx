'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, Leaf, MapPin, Calendar, Compass, TreeDeciduous } from 'lucide-react';
import ItineraryFlow from '@/components/ItineraryFlow';
import DisclaimerNote from '@/components/DisclaimerNote';
import ShareButtons from '@/components/ShareButtons';
import { checkProStatus } from '@/lib/api';
import type { Destination } from '@/lib/types';

interface ItineraryClientProps {
  destination: Destination;
}

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

export default function ItineraryClient({ destination }: ItineraryClientProps) {
  const [isPro, setIsPro] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setIsPro(checkProStatus());
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(91, 143, 168, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Leaf className="w-6 h-6 animate-pulse" style={{ color: 'var(--color-sky)' }} />
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href={`/destinations/${destination.slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '14px', color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none', transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-sky)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div style={{ flex: 1 }} />
            <ShareButtons
              destinationName={destination.name}
              destinationSlug={destination.slug}
            />
          </div>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '64px 16px', textAlign: 'center' }}>
          <div style={{ ...glassCard, padding: '32px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(91, 143, 168, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Lock className="w-7 h-7" style={{ color: 'var(--color-sky)' }} />
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '24px',
              color: 'var(--color-white)', marginBottom: '8px'
            }}>
              Healing Journey Companion
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
              A personalized, day-by-day healing journey in {destination.name}.
              Share your state and intentions, and let a gentle plan unfold that adapts to you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '32px' }}>
              {[
                { icon: Calendar, text: 'Day-by-day journey with energy-aware pacing' },
                { icon: Compass, text: 'Adapts to daily check-ins and your evolving needs' },
                { icon: MapPin, text: 'Intention-driven — grounding, release, connection & more' },
                { icon: TreeDeciduous, text: 'Journey arc from arrival to deepening to integration' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: 'rgba(91, 143, 168, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon className="w-4 h-4" style={{ color: 'var(--color-sky)' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{text}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pricing"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '12px',
                background: 'var(--color-sky)', color: 'white',
                borderRadius: '12px', fontSize: '18px', fontWeight: 600,
                textDecoration: 'none', transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Leaf className="w-5 h-5" />
              Upgrade to Pro
            </Link>

            <p style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              Pro also unlocks 5 curated healing destinations, day-by-day journeys & more
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <DisclaimerNote />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href={`/destinations/${destination.slug}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none', transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-sky)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin className="w-4 h-4" style={{ color: 'var(--color-sky)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-white)' }}>{destination.name}</span>
          </div>
          <div style={{ flex: 1 }} />
          <ShareButtons
            destinationName={destination.name}
            destinationSlug={destination.slug}
          />
        </div>
      </div>

      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '32px 16px' }}>
        <ItineraryFlow
          destination={destination}
          initialFocus="wellness"
        />

        <div style={{ marginTop: '24px' }}>
          <DisclaimerNote />
        </div>
      </div>
    </div>
  );
}
