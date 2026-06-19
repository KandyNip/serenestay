'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import type { Destination } from '@/lib/types';
import { checkProStatus } from '@/lib/api';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';

interface DestinationChatCardProps {
  dest: Destination;
  emotionMatch?: string;  // 情绪匹配说明，Pro专属
  isTopPick?: boolean;
}

export default function DestinationChatCard({ dest, emotionMatch, isTopPick }: DestinationChatCardProps) {
  const [isPro] = useState(() => checkProStatus());
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

  // Pick 3 key scores to show
  const keyScores = [
    { label: 'Serenity', value: dest.scores.serenity },
    { label: 'Nature', value: dest.scores.nature },
    { label: 'Wellness', value: dest.scores.wellness },
  ];

  return (
    <Link
      href={`/destinations/${dest.slug}`}
      className="block my-3 max-w-[320px] bg-white rounded-xl border border-primary/10 shadow-card hover:shadow-lg hover:border-secondary/30 transition-all overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {/* Pro Pick Badge */}
        {isTopPick && isPro && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-[10px] font-semibold rounded-full">
            <Star className="w-3 h-3 fill-white" />
            Pro Pick
          </div>
        )}
        <Image
          src={dest.images[0]}
          alt={dest.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="320px"
        />
      </div>
      {/* Info */}
      <div className="p-3">
        <h4 className="font-serif text-primary text-base">🏡 {dest.name}</h4>
        <p className="text-xs text-primary/50 mt-0.5">{dest.country} · {dest.region}</p>
        <p className="text-xs text-primary/60 mt-1.5 italic line-clamp-2">{dest.tagline}</p>
        {/* Key Scores */}
        <div className="mt-2 space-y-1">
          {keyScores.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="text-primary/50 w-16">{label}</span>
              <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${(value / 5) * 100}%` }}
                />
              </div>
              <span className="text-primary/70 w-4 text-right">{value}</span>
            </div>
          ))}
        </div>
        {/* Emotional Match Badge - Pro Exclusive */}
        {emotionMatch && (
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-xs">💫</span>
            <span className="text-xs text-purple-700 font-medium">{emotionMatch}</span>
          </div>
        )}
        {/* Footer: View Details + Favorite */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-secondary font-medium group-hover:underline">
            View Details →
          </p>
          {isPro && (
            <button
              onClick={toggleFavorite}
              className={`p-1.5 rounded-full transition-colors ${
                saved
                  ? 'text-rose-500 hover:bg-rose-50'
                  : 'text-primary/30 hover:text-rose-400 hover:bg-rose-50'
              }`}
              title={saved ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
