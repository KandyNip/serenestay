'use client';

import Link from 'next/link';
import { Check, Sparkles, Clock } from 'lucide-react';

interface PricingCardProps {
  tier: 'free' | 'pro';
  price: {
    monthly?: number;
    yearly?: number;
  };
  features: string[];
  comingSoon?: string[];
  cta: string;
  disabled?: boolean;
  isYearly?: boolean;
  href?: string;
  badge?: string;
}

/**
 * PricingCard Component
 * Displays pricing tiers with feature comparison
 * Free: Clean white card
 * Pro: Gold accent with gradient background
 */
export default function PricingCard({
  tier,
  price,
  features,
  comingSoon,
  cta,
  disabled = false,
  isYearly = false,
  href = '/chat',
  badge,
}: PricingCardProps) {
  const isPro = tier === 'pro';
  const displayPrice = isYearly ? price.yearly : price.monthly;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isPro
          ? 'bg-gradient-to-br from-surface via-white to-gold-100 shadow-soft-lg border-2 border-gold scale-105'
          : 'bg-white shadow-soft border border-primary/10'
      }`}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-0 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 bg-gold text-white text-xs font-semibold px-4 py-1.5 rounded-b-lg shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        </div>
      )}

      <div className={`p-6 ${badge ? 'pt-12' : ''}`}>
        {/* Tier Name */}
        <h3 className="font-serif text-2xl text-primary">
          {isPro ? 'Pro' : 'Free'}
        </h3>
        <p className="mt-2 text-sm text-primary/60">
          {isPro
            ? 'For those serious about finding their sanctuary'
            : 'Start your journey to serenity'}
        </p>

        {/* Price */}
        <div className="mt-6 mb-6">
          <div className="flex items-baseline gap-1">
            {displayPrice !== 0 && (
              <span className="text-4xl font-serif text-primary">
                ${displayPrice}
              </span>
            )}
            <span className="text-primary/60 text-sm">
              {displayPrice === 0
                ? 'Free forever'
                : isYearly
                  ? '/month'
                  : '/month'}
            </span>
          </div>
          {isPro && isYearly && price.monthly && (
            <p className="mt-1 text-xs text-secondary">
              Billed as ${((price.yearly || 0) * 12).toFixed(2)}/year · Save 33%
            </p>
          )}
          {isPro && !isYearly && (
            <p className="mt-1 text-xs text-primary/50">
              Billed monthly
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-primary/10" />

        {/* Features List */}
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  isPro ? 'bg-secondary/20 text-secondary' : 'bg-primary/10 text-primary'
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm text-primary/80">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Coming Soon Section */}
        {comingSoon && comingSoon.length > 0 && (
          <div className="mt-6 p-3 rounded-xl border border-dashed border-gold/40 bg-gold/5">
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold uppercase tracking-wide">
                Coming Soon
              </span>
            </div>
            <ul className="space-y-2">
              {comingSoon.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gold/40 mt-1.5" />
                  <span className="text-xs text-primary/50">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        {disabled ? (
          <button
            disabled
            className={`mt-8 w-full py-3.5 px-6 rounded-xl font-medium text-center block cursor-not-allowed ${
              isPro
                ? 'bg-primary/20 text-primary/40'
                : 'bg-primary/10 text-primary/30'
            }`}
          >
            {cta}
          </button>
        ) : (
          <Link
            href={href}
            className={`mt-8 w-full py-3.5 px-6 rounded-xl font-medium transition-all duration-200 text-center block ${
              isPro
                ? 'bg-gold hover:bg-gold-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
                : 'btn-outline hover:bg-primary hover:text-white'
            }`}
            aria-label={`${cta} - ${tier} plan`}
          >
            {cta}
          </Link>
        )}

        {/* Pro Extras */}
        {isPro && !disabled && (
          <p className="mt-4 text-center text-xs text-primary/50">
            Cancel anytime • 7-day money back guarantee
          </p>
        )}
      </div>

      {/* Decorative Corner */}
      {isPro && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/10 to-transparent rounded-bl-[100px]" />
      )}
    </div>
  );
}
