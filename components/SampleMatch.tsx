'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Leaf, Heart, X } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const sampleProfile = {
  name: 'Sarah',
  context: 'A burnt-out designer from the city, needing deep rest and reconnection',
  match: {
    name: 'Yamanaka-ko',
    country: 'Japan',
    tagline: 'Mountain lake sanctuary wrapped in mist and forest',
    image: '/nature/nat-onsen.jpg',
  },
  radarData: [
    { dimension: 'Serenity', user: 4.8, destination: 4.9 },
    { dimension: 'Nature', user: 4.5, destination: 5.0 },
    { dimension: 'Climate', user: 3.5, destination: 3.8 },
    { dimension: 'Affordability', user: 3.0, destination: 3.2 },
    { dimension: 'Wellness', user: 5.0, destination: 4.7 },
    { dimension: 'Community', user: 2.8, destination: 3.0 },
  ],
  whyMatch: [
    'The quiet lakeside setting mirrors your need for deep silence after constant city noise',
    'Hot spring onsen culture offers the slow, embodied rest your nervous system is craving',
    'Temple stays and forest walks nearby allow gentle reconnection without pressure',
  ],
};

export default function SampleMatch() {
  const [showMatch, setShowMatch] = useState(false);

  if (!showMatch) {
    return (
      <div className="text-center reveal">
        <p
          className="mb-6 text-sm"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}
        >
          Curious how it works? See a real example.
        </p>
        <button
          onClick={() => setShowMatch(true)}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--color-forest-deep)',
            color: 'var(--color-white)',
          }}
        >
          <Heart className="w-4 h-4" />
          Show me a sample match
        </button>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto"
      style={{
        animation: 'fadeInUp 0.6s ease-out forwards',
      }}
    >
      <div
        className="rounded-2xl p-8 md:p-12 relative"
        style={{
          background: 'var(--color-white)',
          boxShadow: '0 4px 24px rgba(14,36,25,0.12)',
        }}
      >
        <button
          onClick={() => setShowMatch(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/5"
          style={{ color: 'var(--color-ink-muted)' }}
          aria-label="Close sample match"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--color-forest-light)' }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
              Sample Match
            </p>
            <p className="text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}>
              {sampleProfile.name} — {sampleProfile.context}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div
              className="relative rounded-xl overflow-hidden mb-6"
              style={{ aspectRatio: '4/3' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sampleProfile.match.image}
                alt={sampleProfile.match.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(14,36,25,0.8) 0%, transparent 60%)',
                }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'var(--color-white)',
                  }}
                >
                  {sampleProfile.match.name}
                </h3>
                <div className="flex items-center gap-1 mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                    {sampleProfile.match.country}
                  </span>
                </div>
              </div>
            </div>

            <p
              className="text-sm italic mb-4"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}
            >
              &ldquo;{sampleProfile.match.tagline}&rdquo;
            </p>

            <div>
              <h4
                className="text-sm font-semibold mb-3"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
              >
                Why this matches:
              </h4>
              <ul className="space-y-2">
                {sampleProfile.whyMatch.map((reason, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-light)' }}
                  >
                    <span style={{ color: 'var(--color-canopy)' }}>—</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4
              className="text-sm font-semibold mb-4 text-center"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
            >
              Wellness Alignment
            </h4>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={sampleProfile.radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(27,58,45,0.15)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{
                      fill: '#5A7A6A',
                      fontSize: 11,
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar
                    name="You"
                    dataKey="user"
                    stroke="#5B8FA8"
                    fill="#5B8FA8"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Destination"
                    dataKey="destination"
                    stroke="#3A7D5C"
                    fill="#3A7D5C"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#5B8FA8', opacity: 0.6 }} />
                <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}>
                  Your profile
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#3A7D5C', opacity: 0.7 }} />
                <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}>
                  Destination
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-10 pt-8 text-center"
          style={{ borderTop: '1px solid rgba(27,58,45,0.1)' }}
        >
          <p
            className="mb-6 text-sm"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}
          >
            Want your own match? Take the gentle 2-minute reflection.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--color-sky)',
              color: 'var(--color-white)',
            }}
          >
            Find Your Retreat
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
