'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { getFavorites, addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';

interface FavoriteButtonProps {
  slug: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function FavoriteButton({
  slug,
  initialFavorited = false,
  size = 'md',
  showLabel = false,
}: FavoriteButtonProps) {
  const [saved, setSaved] = useState(initialFavorited);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(slug));
  }, [slug]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    if (saved) {
      removeFavorite(slug);
      setSaved(false);
    } else {
      addFavorite(slug);
      setSaved(true);
    }
    setTimeout(() => setAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-12 h-12',
  };

  const iconSize = {
    sm: 17,
    md: 20,
    lg: 22,
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center gap-2 transition-all duration-300 ${
        animating ? 'scale-110' : 'hover:scale-105'
      }`}
      style={{
        background: saved
          ? 'rgba(194,120,92,0.2)'
          : 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: saved
          ? '1px solid rgba(194,120,92,0.4)'
          : '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <Heart
        width={iconSize[size]}
        height={iconSize[size]}
        style={{
          color: saved ? '#c2785c' : 'rgba(255,255,255,0.6)',
          fill: saved ? '#c2785c' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
      {showLabel && (
        <span
          className="text-xs font-medium"
          style={{ color: saved ? '#c2785c' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}
        >
          {saved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
