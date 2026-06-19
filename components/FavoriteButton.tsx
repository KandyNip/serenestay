'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Lock } from 'lucide-react';
import { checkProStatus } from '@/lib/api';
import { getFavorites, addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';

interface FavoriteButtonProps {
  slug: string;
  name: string;
}

export default function FavoriteButton({ slug, name }: FavoriteButtonProps) {
  const [isPro, setIsPro] = useState(false);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setIsPro(checkProStatus());
    setSaved(isFavorite(slug));
    setCount(getFavorites().length);
  }, [slug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (saved) {
      removeFavorite(slug);
      setSaved(false);
    } else {
      addFavorite(slug);
      setSaved(true);
    }
    setCount(getFavorites().length);
  };

  // Free users: locked button linking to /pricing
  if (!isPro) {
    return (
      <Link
        href="/pricing"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = '/pricing'; }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs text-primary/50 hover:border-primary/20 transition-colors"
        title="Upgrade to Pro to save favorites"
      >
        <Lock className="w-3 h-3" />
        <span>Save</span>
      </Link>
    );
  }

  // Pro users: toggle heart button with count badge
  return (
    <button
      onClick={toggleFavorite}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        saved
          ? 'bg-rose-50 border border-rose-200 text-rose-600'
          : 'bg-primary/5 border border-primary/10 text-primary/50 hover:border-rose-200 hover:text-rose-500'
      }`}
      title={saved ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
    >
      <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500' : ''}`} />
      <span>{saved ? 'Saved' : 'Save'}</span>
      {count > 0 && (
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          saved ? 'bg-rose-100 text-rose-600' : 'bg-primary/10 text-primary/50'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
