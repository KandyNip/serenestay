'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, Sparkles, MapPin, Calendar, Compass } from 'lucide-react';
import ItineraryFlow from '@/components/ItineraryFlow';
import DisclaimerNote from '@/components/DisclaimerNote';
import ShareButtons from '@/components/ShareButtons';
import { checkProStatus } from '@/lib/api';
import type { Destination } from '@/lib/types';

interface ItineraryClientProps {
  destination: Destination;
}

export default function ItineraryClient({ destination }: ItineraryClientProps) {
  const [isPro, setIsPro] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setIsPro(checkProStatus());
    setChecked(true);
  }, []);

  // Loading state
  if (!checked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          </div>
          <p className="text-sm text-primary/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Pro paywall for free users
  if (!isPro) {
    return (
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <div className="bg-white border-b border-primary/10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link
              href={`/destinations/${destination.slug}`}
              className="flex items-center gap-1.5 text-sm text-primary/60 hover:text-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="flex-1" />
            <ShareButtons
              destinationName={destination.name}
              destinationSlug={destination.slug}
            />
          </div>
        </div>

        {/* Paywall Content */}
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-8">
            {/* Hero icon */}
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-secondary" />
            </div>

            <h1 className="font-serif text-2xl text-primary mb-2">
              Pro Feature: Day-by-Day Itinerary
            </h1>
            <p className="text-primary/60 mb-6">
              Create a personalized {destination.name} itinerary, one day at a time.
              Choose your mood, add special requests, and let AI craft the perfect plan.
            </p>

            {/* Feature list */}
            <div className="space-y-3 text-left mb-8">
              {[
                { icon: Calendar, text: 'Day-by-day planning with mood selection' },
                { icon: Compass, text: 'AI adapts to your preferences each day' },
                { icon: MapPin, text: 'Context-aware — no repeated activities' },
                { icon: Sparkles, text: 'Regenerate or edit any day' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-sm text-primary/70">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/pricing"
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade to Pro
            </Link>

            <p className="mt-3 text-xs text-primary/40">
              Pro also unlocks 5 AI-matched healing destinations, day-by-day itineraries & more
            </p>
          </div>

          {/* AI disclaimer */}
          <div className="mt-4">
            <DisclaimerNote />
          </div>
        </div>
      </div>
    );
  }

  // Pro user — show the itinerary flow
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-primary/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/destinations/${destination.slug}`}
            className="flex items-center gap-1.5 text-sm text-primary/60 hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="font-serif text-lg text-primary">{destination.name}</span>
          </div>
          <div className="flex-1" />
          <ShareButtons
            destinationName={destination.name}
            destinationSlug={destination.slug}
          />
        </div>
      </div>

      {/* Flow */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ItineraryFlow
          destination={destination}
          initialFocus="wellness"
        />

        {/* AI disclaimer */}
        <div className="mt-6">
          <DisclaimerNote />
        </div>
      </div>
    </div>
  );
}
