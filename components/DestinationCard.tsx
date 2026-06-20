import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
  priority?: boolean; // For above-the-fold images
}

/**
 * DestinationCard Component
 * Displays a destination summary with image, name, and key info
 */
export default function DestinationCard({
  destination,
  priority = false,
}: DestinationCardProps) {
  // Healing tag display mapping — covers all 46 tags in the database
  const healingTagLabels: Record<string, { emoji: string; label: string }> = {
    // Original 16 that exist in DB
    'yoga': { emoji: '🧘', label: 'Yoga' },
    'meditation': { emoji: '🧠', label: 'Meditation' },
    'temple-stay': { emoji: '🛕', label: 'Temple Stay' },
    'forest-bathing': { emoji: '🌲', label: 'Forest Bathing' },
    'hot-springs': { emoji: '♨️', label: 'Hot Springs' },
    'sound-healing': { emoji: '🔔', label: 'Sound Healing' },
    'ayurveda': { emoji: '🌿', label: 'Ayurveda' },
    'thai-massage': { emoji: '💆', label: 'Thai Massage' },
    'mindfulness': { emoji: '🕯️', label: 'Mindfulness' },
    'tea-ceremony': { emoji: '🍵', label: 'Tea Ceremony' },
    'digital-detox': { emoji: '📵', label: 'Digital Detox' },
    'breathwork': { emoji: '🌬️', label: 'Breathwork' },
    'surf-therapy': { emoji: '🏄', label: 'Surf Therapy' },
    'reiki': { emoji: '✋', label: 'Reiki' },
    'qigong': { emoji: '☯️', label: 'Qigong' },
    'kirtan': { emoji: '🎶', label: 'Kirtan' },
    // Additional 30 tags from database
    'ocean-therapy': { emoji: '🌊', label: 'Ocean Therapy' },
    'balinese-massage': { emoji: '💆', label: 'Balinese Massage' },
    'cacao-ceremony': { emoji: '🍫', label: 'Cacao Ceremony' },
    'detox': { emoji: '🥗', label: 'Detox' },
    'ecstatic-dance': { emoji: '💃', label: 'Ecstatic Dance' },
    'hiking-meditation': { emoji: '🥾', label: 'Hiking Meditation' },
    'nature-therapy': { emoji: '🌿', label: 'Nature Therapy' },
    'vipassana': { emoji: '🧘', label: 'Vipassana' },
    'wild-swimming': { emoji: '🏊', label: 'Wild Swimming' },
    'tantra': { emoji: '🔥', label: 'Tantra' },
    'shamanic-journey': { emoji: '🔮', label: 'Shamanic Journey' },
    'community-healing': { emoji: '🤲', label: 'Community Healing' },
    'coworking-wellness': { emoji: '💻', label: 'Co-working Wellness' },
    'longevity-wellness': { emoji: '✨', label: 'Longevity' },
    'nomad-community': { emoji: '🫂', label: 'Nomad Community' },
    'volunteer-healing': { emoji: '🤝', label: 'Volunteer Healing' },
    'water-purification': { emoji: '💧', label: 'Water Purification' },
    'mediterranean-diet-wellness': { emoji: '🫒', label: 'Mediterranean Diet' },
    'spice-therapy': { emoji: '🌶️', label: 'Spice Therapy' },
    'island-meditation': { emoji: '🏝️', label: 'Island Meditation' },
    'sunrise-hiking': { emoji: '🌅', label: 'Sunrise Hiking' },
    'sunset-meditation': { emoji: '🌇', label: 'Sunset Meditation' },
    'birdwatching-meditation': { emoji: '🦜', label: 'Birdwatching Meditation' },
    'volcano-hiking': { emoji: '🌋', label: 'Volcano Hiking' },
    'alms-ceremony': { emoji: '🙏', label: 'Alms Ceremony' },
    'lantern-ceremony': { emoji: '🏮', label: 'Lantern Ceremony' },
    'cold-exposure': { emoji: '❄️', label: 'Cold Exposure' },
    'temazcal': { emoji: '🔥', label: 'Temazcal' },
    'zen-retreat': { emoji: '⛩️', label: 'Zen Retreat' },
    'yoga-therapy': { emoji: '🧘', label: 'Yoga Therapy' },
  };

  // Get top 2 healing tags for display
  const topHealingTags = destination.healingTags.slice(0, 2).map(tag => {
    const mapped = healingTagLabels[tag];
    return mapped || { emoji: '✨', label: tag.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') };
  });

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block rounded-xl overflow-hidden bg-white shadow-card card-hover"
      aria-label={`View details for ${destination.name}, ${destination.country}`}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Image
          src={destination.images[0]}
          alt={`${destination.name}, ${destination.country}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
        
        {/* Veto Warning Icon */}
        {destination.vetoWarning && (
          <div className="absolute top-3 left-3 bg-warning/90 backdrop-blur-sm text-primary text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Heads up</span>
          </div>
        )}

        {/* Location Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-sm">
          <MapPin className="w-4 h-4" />
          <span>{destination.country}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-xl text-primary group-hover:text-secondary transition-colors">
          {destination.name}
        </h3>
        <p className="mt-1 text-sm text-primary/60 line-clamp-2">
          {destination.tagline}
        </p>

        {/* Best For — top 2 healing tags */}
        {topHealingTags.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-primary/40">Best for</span>
            {topHealingTags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-0.5 text-xs bg-secondary/8 text-secondary px-2 py-0.5 rounded-full"
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Tags Preview */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {destination.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-surface px-2 py-0.5 rounded-full text-primary/70"
            >
              {tag}
            </span>
          ))}
          {destination.tags.length > 3 && (
            <span className="text-xs text-primary/50">
              +{destination.tags.length - 3}
            </span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs text-primary/50">From</span>
            <span className="font-mono text-sm font-semibold text-primary">
              ${destination.monthlyCost.budget}
            </span>
            <span className="text-xs text-primary/50">/month</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-primary/60">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Best: {destination.bestSeason.months.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
