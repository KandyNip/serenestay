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
  // Find the highest scoring dimension
  const scoreEntries = Object.entries(destination.scores);
  const highestScore = scoreEntries.reduce((max, [key, value]) => {
    return value > max.value ? { key, value } : max;
  }, { key: '', value: 0 });

  // Format the dimension label
  const dimensionLabels: Record<string, string> = {
    serenity: 'Serenity',
    nature: 'Nature',
    climate: 'Climate',
    affordability: 'Affordable',
    wellness: 'Wellness',
    community: 'Community',
    wifi: 'WiFi',
    visa: 'Visa',
    medical: 'Medical',
  };

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
        
        {/* Top Badge - Highest Score */}
        {highestScore.value >= 4 && (
          <div className="absolute top-3 right-3 bg-secondary/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
            {dimensionLabels[highestScore.key] || highestScore.key} {highestScore.value}
          </div>
        )}

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
