import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
  priority?: boolean;
}

const healingTagLabels: Record<string, string> = {
  'yoga': 'Yoga',
  'meditation': 'Meditation',
  'temple-stay': 'Temple Stay',
  'forest-bathing': 'Forest Bathing',
  'hot-springs': 'Hot Springs',
  'sound-healing': 'Sound Healing',
  'ayurveda': 'Ayurveda',
  'thai-massage': 'Thai Massage',
  'mindfulness': 'Mindfulness',
  'tea-ceremony': 'Tea Ceremony',
  'digital-detox': 'Digital Detox',
  'breathwork': 'Breathwork',
  'surf-therapy': 'Surf Therapy',
  'reiki': 'Reiki',
  'qigong': 'Qigong',
  'kirtan': 'Kirtan',
  'ocean-therapy': 'Ocean Therapy',
  'balinese-massage': 'Balinese Massage',
  'cacao-ceremony': 'Cacao Ceremony',
  'detox': 'Detox',
  'ecstatic-dance': 'Ecstatic Dance',
  'hiking-meditation': 'Hiking Meditation',
  'nature-therapy': 'Nature Therapy',
  'vipassana': 'Vipassana',
  'wild-swimming': 'Wild Swimming',
  'zen-retreat': 'Zen Retreat',
  'yoga-therapy': 'Yoga Therapy',
  'island-meditation': 'Island Meditation',
  'sunrise-hiking': 'Sunrise Hiking',
  'sunset-meditation': 'Sunset Meditation',
};

export default function DestinationCard({
  destination,
}: DestinationCardProps) {
  const topHealingTags = (destination.healingTags ?? []).slice(0, 2).map((tag: string) => {
    return healingTagLabels[tag] || tag.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  });

  const imageSrc = destination.images[0];
  const monthCost = destination.monthlyCost?.budget ?? 800;
  const bestMonths = (destination.bestSeason?.months ?? []).slice(0, 2).join(', ');

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
      }}
      aria-label={`View details for ${destination.name}, ${destination.country}`}
    >
      <div className="relative h-52 sm:h-56 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={`${destination.name}, ${destination.country}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(14,36,25,0.85) 0%, rgba(14,36,25,0.3) 40%, transparent 70%)',
          }}
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
          <MapPin className="w-3.5 h-3.5" />
          <span style={{ fontFamily: 'var(--font-body)' }}>{destination.country}</span>
        </div>
      </div>

      <div className="p-5">
        <h3
          className="text-lg transition-colors group-hover:text-[var(--color-sky-light)]"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
        >
          {destination.name}
        </h3>
        <p
          className="mt-1 text-sm line-clamp-2"
          style={{ color: 'var(--color-white-50)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
        >
          {destination.tagline}
        </p>

        {topHealingTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topHealingTags.map((label: string) => (
              <span
                key={label}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(107,158,126,0.15)',
                  color: 'var(--color-moss)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: 'var(--color-white-40)' }}>From</span>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: 'var(--color-sand)' }}
            >
              ${monthCost}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-white-40)' }}>/mo</span>
          </div>

          {bestMonths && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-white-40)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-canopy)' }} />
              <span style={{ fontFamily: 'var(--font-body)' }}>{bestMonths}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
