'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Home } from 'lucide-react';
import type { Destination } from '@/lib/types';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';

interface DestinationChatCardProps {
  dest: Destination;
  emotionMatch?: string;
  isTopPick?: boolean;
}

const cardStyle = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.2s ease',
} as React.CSSProperties;

export default function DestinationChatCard({ dest, emotionMatch, isTopPick }: DestinationChatCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(dest.slug));
  }, [dest.slug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFavorite(dest.slug);
      setSaved(false);
    } else {
      addFavorite(dest.slug);
      setSaved(true);
    }
  };

  const keyScores = [
    { label: 'Serenity', value: dest.scores.serenity },
    { label: 'Nature', value: dest.scores.nature },
    { label: 'Wellness', value: dest.scores.wellness },
  ];

  return (
    <Link
      href={`/destinations/${dest.slug}`}
      className="block my-3 max-w-[320px] group"
      style={cardStyle}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {isTopPick && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 text-white text-[10px] font-semibold rounded-full" style={{ background: 'var(--color-sky)' }}>
            <Star className="w-3 h-3 fill-white" />
            Pro Pick
          </div>
        )}
        <Image
          src={dest.images[0]}
          alt={dest.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="320px"
        />
      </div>
      <div className="p-3">
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Home className="w-4 h-4" style={{ color: 'var(--color-moss)' }} /> {dest.name}
        </h4>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{dest.country} · {dest.region}</p>
        <p className="text-xs mt-1.5 italic line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{dest.tagline}</p>
        <div className="mt-2 space-y-1">
          {keyScores.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-16" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(value / 5) * 100}%`, background: 'var(--color-moss)' }}
                />
              </div>
              <span className="w-4 text-right" style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
            </div>
          ))}
        </div>
        {emotionMatch && (
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(91,143,168,0.15)', border: '1px solid rgba(91,143,168,0.3)' }}>
            <Star className="w-3 h-3" style={{ color: 'var(--color-sky)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-sky)' }}>{emotionMatch}</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs font-medium group-hover:underline" style={{ color: 'var(--color-sky)' }}>
            View Details →
          </p>
          <button
            onClick={toggleFavorite}
            className="p-1.5 rounded-full transition-colors"
            style={{
              color: saved ? 'var(--color-terracotta)' : 'rgba(255,255,255,0.3)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(194,120,92,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title={saved ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </Link>
  );
}
