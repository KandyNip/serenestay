'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Destination } from '@/lib/types';

interface DestinationChatCardProps {
  dest: Destination;
}

export default function DestinationChatCard({ dest }: DestinationChatCardProps) {
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
        <p className="mt-2 text-xs text-secondary font-medium group-hover:underline">
          View Details →
        </p>
      </div>
    </Link>
  );
}
