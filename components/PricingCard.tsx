'use client';

import Link from 'next/link';
import { Check, Leaf, Sun } from 'lucide-react';

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
  external?: boolean;
  badge?: string;
}

export default function PricingCard({
  tier,
  price,
  features,
  comingSoon,
  cta,
  disabled = false,
  isYearly = false,
  href = '/chat',
  external = false,
  badge,
}: PricingCardProps) {
  const isPro = tier === 'pro';
  const displayPrice = isYearly ? price.yearly : price.monthly;

  return (
    <div
      className={`relative overflow-hidden transition-all duration-500 ${
        isPro
          ? 'scale-[1.02]'
          : ''
      }`}
      style={{
        background: isPro 
          ? 'linear-gradient(135deg, rgba(91,143,168,0.15) 0%, rgba(58,125,92,0.1) 50%, rgba(255,255,255,0.08) 100%)'
          : 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: isPro 
          ? '1px solid rgba(91,143,168,0.3)'
          : '1px solid var(--glass-border)',
        borderRadius: '20px',
      }}
    >
      {badge && (
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
          <div 
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-b-lg shadow-md"
            style={{ 
              background: 'var(--color-sky)',
              color: 'var(--color-white)'
            }}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        </div>
      )}

      <div className={`p-6 sm:p-8 ${badge ? 'pt-12' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: isPro ? 'rgba(91,143,168,0.2)' : 'rgba(107,158,126,0.2)',
            }}
          >
            {isPro ? (
              <Sun className="w-4 h-4" style={{ color: 'var(--color-sky-light)' }} />
            ) : (
              <Leaf className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
            )}
          </div>
          <h3 
            className="text-2xl"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-white)'
            }}
          >
            {isPro ? 'Pro' : 'Explorer'}
          </h3>
        </div>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-white-60)' }}
        >
          {isPro
            ? 'For those ready to find their sanctuary'
            : 'Begin your journey to serenity'}
        </p>

        <div className="mt-6 mb-6">
          <div className="flex items-baseline gap-1">
            {displayPrice !== 0 && (
              <span 
                className="text-4xl"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-white)'
                }}
              >
                ${displayPrice}
              </span>
            )}
            <span 
              className="text-sm"
              style={{ color: 'var(--color-white-60)' }}
            >
              {displayPrice === 0
                ? 'Free to start'
                : '/month'}
            </span>
          </div>
          {isPro && isYearly && price.monthly && (
            <p 
              className="mt-1 text-xs"
              style={{ color: 'var(--color-sky-light)' }}
            >
              Billed as ${((price.yearly || 0) * 12).toFixed(2)}/year · Save 33%
            </p>
          )}
          {isPro && !isYearly && (
            <p 
              className="mt-1 text-xs"
              style={{ color: 'var(--color-white-40)' }}
            >
              Billed monthly
            </p>
          )}
        </div>

        <div 
          className="h-px"
          style={{ background: 'var(--color-white-10)' }}
        />

        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background: isPro ? 'rgba(91,143,168,0.2)' : 'rgba(107,158,126,0.2)',
                }}
              >
                <Check 
                  className="w-3 h-3" 
                  style={{ color: isPro ? 'var(--color-sky-light)' : 'var(--color-moss)' }}
                />
              </div>
              <span 
                className="text-sm"
                style={{ color: 'var(--color-white-80)' }}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {comingSoon && comingSoon.length > 0 && (
          <div 
            className="mt-6 p-3 rounded-xl"
            style={{
              border: '1px dashed rgba(107,158,126,0.4)',
              background: 'rgba(107,158,126,0.08)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Leaf className="w-3.5 h-3.5" style={{ color: 'var(--color-moss)' }} />
              <span 
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-moss)' }}
              >
                Growing Soon
              </span>
            </div>
            <ul className="space-y-2">
              {comingSoon.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span 
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ background: 'rgba(107,158,126,0.5)' }}
                  />
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--color-white-40)' }}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {disabled ? (
          <button
            disabled
            className="mt-8 w-full py-3.5 px-6 rounded-xl font-medium text-center block cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--color-white-20)',
              borderRadius: '12px',
            }}
          >
            {cta}
          </button>
        ) : external ? (
          <a
            href={href}
            className="mt-8 w-full py-3.5 px-6 font-medium transition-all duration-300 text-center block hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isPro ? 'var(--color-sky)' : 'transparent',
              color: isPro ? 'var(--color-white)' : 'var(--color-white)',
              border: isPro ? 'none' : '1px solid var(--color-white-20)',
              borderRadius: '12px',
            }}
            aria-label={`${cta} - ${tier} plan`}
          >
            {cta}
          </a>
        ) : (
          <Link
            href={href}
            className="mt-8 w-full py-3.5 px-6 font-medium transition-all duration-300 text-center block hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isPro ? 'var(--color-sky)' : 'transparent',
              color: isPro ? 'var(--color-white)' : 'var(--color-white)',
              border: isPro ? 'none' : '1px solid var(--color-white-20)',
              borderRadius: '12px',
            }}
            aria-label={`${cta} - ${tier} plan`}
          >
            {cta}
          </Link>
        )}

        {isPro && !disabled && (
          <p 
            className="mt-4 text-center text-xs"
            style={{ color: 'var(--color-white-40)' }}
          >
            Cancel anytime • 7-day money back guarantee
          </p>
        )}
      </div>

      {isPro && (
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px]"
          style={{
            background: 'radial-gradient(circle at top right, rgba(91,143,168,0.15) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
