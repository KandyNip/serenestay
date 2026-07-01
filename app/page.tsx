import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Compass, Leaf, Heart, Mountain, Waves, Sun } from 'lucide-react';
import DestinationCard from '@/components/DestinationCard';
import WaveDivider from '@/components/WaveDivider';
import SampleMatch from '@/components/SampleMatch';
import { loadDestinations } from '@/lib/destinations';
import type { Destination } from '@/lib/types';

export const metadata = {
  title: 'SereneStay — The Place You Need Already Exists',
  description: 'We find healing retreats that were waiting for you. Tell us how you feel — discover yoga in Bali, temple stays in Thailand, forest bathing in Japan.',
};

const journeySteps = [
  {
    number: '01',
    title: 'Tell Us How You Feel',
    description: 'Answer a few honest questions about where you are right now. No labels, no jargon — just reflection.',
  },
  {
    number: '02',
    title: 'We Listen to Nature',
    description: 'We consider nine dimensions of wellness, seasonal rhythms, and the unique character of each place.',
  },
  {
    number: '03',
    title: 'Your Retreat Finds You',
    description: 'See exactly why this place is your healing match — emotional, physical, and seasonal reasons.',
  },
];

const features = [
  {
    icon: Leaf,
    title: 'Holistic Wellness Profile',
    description: 'Not just pretty photos. We score serenity, nature, wellness facilities, and six more dimensions — so your retreat actually heals.',
  },
  {
    icon: Heart,
    title: 'Emotional Matching',
    description: 'Burnt out? We find temple stays and digital detox. Need nature? Forest bathing and hot springs. Your feeling guides the match.',
  },
  {
    icon: Compass,
    title: 'Honest Assessments',
    description: 'We flag dealbreakers like poor medical access before you commit. No surprises on your healing journey.',
  },
  {
    icon: Mountain,
    title: 'Seasonal Intelligence',
    description: 'Know the best season for weather, prices, and local wellness events. Timing is everything for healing.',
  },
  {
    icon: Waves,
    title: '46 Healing Modalities',
    description: 'Yoga, meditation, sound healing, forest bathing, Ayurveda, temple stays — matched to what you need.',
  },
  {
    icon: Sun,
    title: 'Budget Transparent',
    description: 'See real costs for different lifestyles — budget, mid, comfort. Plan a week or stay a season.',
  },
];

const heroImage = '/nature/nat-hero.jpg';
const forestImage = '/nature/nat-forest.jpg';
const oceanImage = '/nature/nat-ocean.jpg';
const mountainImage = '/nature/nat-mountain.jpg';

export default async function HomePage() {
  let featuredDestinations: Destination[] = [];
  try {
    const all = await loadDestinations();
    featuredDestinations = [...all]
      .filter(d => d.scores.wifi > 2 && d.scores.medical > 2)
      .sort((a, b) => {
        const avgA = (a.scores.serenity + a.scores.nature + a.scores.climate + a.scores.affordability + a.scores.wellness + a.scores.community + a.scores.wifi + a.scores.visa + a.scores.medical) / 9;
        const avgB = (b.scores.serenity + b.scores.nature + b.scores.climate + b.scores.affordability + b.scores.wellness + b.scores.community + b.scores.wifi + b.scores.visa + b.scores.medical) / 9;
        return avgB - avgA;
      })
      .slice(0, 3);
  } catch (error) {
    console.error('Failed to load destinations:', error);
  }

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is SereneStay?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "SereneStay helps you find healing retreats matched to how you feel. We curate destinations worldwide — from yoga in Bali to forest bathing in Japan — and evaluate each across nine wellness dimensions.",
                },
              },
              {
                "@type": "Question",
                name: "How does the matching work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We ask you gentle questions about your emotional state, then match you with retreats that fit your needs across nine dimensions: serenity, nature, climate, affordability, wellness, community, WiFi, visa access, and medical care.",
                },
              },
              {
                "@type": "Question",
                name: "What does Pro include?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Pro includes personalized day-by-day healing itineraries for your matched destinations. All matching and destination browsing is free.",
                },
              },
            ],
          }),
        }}
      />

      {/* ═══════════════════════════════════════════
          HERO — Full viewport, immersive
          ═══════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-center immersive-section immersive-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(14,36,25,0.9) 0%, rgba(14,36,25,0.3) 40%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
          <h1
            className="balance-text text-shadow-medium animate-fade-in-up"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 80px)',
              color: 'var(--color-white)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            The Place You Need Already Exists
          </h1>
          <p
            className="mt-6 md:mt-8 text-lg md:text-xl max-w-2xl mx-auto text-shadow-soft animate-fade-in-up stagger-1"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-white-80)',
            }}
          >
            We don&apos;t create retreats. We find the ones that were waiting for you.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
            <Link
              href="/chat"
              className="btn-glass text-base"
            >
              Find Your Retreat
            </Link>
            <a
              href="#sample"
              className="btn-ghost-float"
            >
              See a sample match
              <ArrowRight className="w-4 h-4 arrow-icon" />
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-sm animate-fade-in-up stagger-3" style={{ color: 'var(--color-white-40)' }}>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              56 curated destinations
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full" style={{ background: 'var(--color-white-20)' }} />
            <span className="hidden sm:flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              7 regions worldwide
            </span>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-float-gentle">
          <span
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}
          >
            Scroll
          </span>
          <svg className="w-5 h-5 animate-bounce-slow" style={{ color: 'var(--color-white-60)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <WaveDivider fill="#0E2419" variant="forest" />

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Forest full-bleed
          ═══════════════════════════════════════════ */}
      <section
        className="relative py-28 md:py-40 overflow-hidden immersive-section"
        style={{ backgroundImage: `url(${forestImage})` }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(14,36,25,0.65)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2
            className="text-center mb-20 balance-text text-shadow-medium reveal"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              color: 'var(--color-white)',
            }}
          >
            Your Healing Journey Begins With...
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {journeySteps.map((step) => (
              <div key={step.number} className="reveal" style={{ borderLeft: '2px solid rgba(255,255,255,0.15)', paddingLeft: '1.5rem' }}>
                <span
                  className="block mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(48px, 6vw, 72px)',
                    color: 'var(--color-white)',
                    opacity: 0.5,
                    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  {step.number}
                </span>
                <h3
                  className="mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'var(--color-white)',
                    textShadow: '0 1px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fill="rgba(14,36,25,0.6)" variant="transparent-dark" />

      {/* ═══════════════════════════════════════════
          FEATURED DESTINATIONS — Ocean full-bleed
          ═══════════════════════════════════════════ */}
      <section
        className="relative py-28 md:py-40 overflow-hidden immersive-section"
        style={{ backgroundImage: `url(${oceanImage})` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(14,36,25,0.75) 0%, rgba(14,36,25,0.4) 50%, rgba(14,36,25,0.55) 100%)',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2
            className="text-center mb-6 balance-text text-shadow-medium reveal"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              color: 'var(--color-white)',
            }}
          >
            Where Will Nature Take You?
          </h2>
          <p
            className="text-center mb-16 max-w-xl mx-auto reveal"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
          >
            Curated sanctuaries where healing begins — scored across nine dimensions of wellness.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-14">
            {featuredDestinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.slug}`}
                className="card-hover-subtle reveal"
                style={{
                  background: 'var(--glass-bg-strong)',
                  backdropFilter: 'var(--glass-blur-heavy)',
                  WebkitBackdropFilter: 'var(--glass-blur-heavy)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  display: 'block',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-white)' }}>
                  {dest.name}
                </h3>
                <p className="mb-4 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                  {dest.tagline}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-sky-light)' }}
                >
                  Explore
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center reveal">
            <Link href="/destinations" className="btn-accent">
              View All Destinations
            </Link>
          </div>
        </div>
      </section>

      <WaveDivider fill="#E8DECA" variant="sand" />

      {/* ═══════════════════════════════════════════
          SAMPLE MATCH — Warm sand-light section
          ═══════════════════════════════════════════ */}
      <section id="sample" className="warm-section-sand py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-center mb-6 balance-text reveal"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: 'var(--color-forest-deep)',
            }}
          >
            See What a Match Looks Like
          </h2>
          <p
            className="text-center mb-16 text-lg max-w-xl mx-auto reveal"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}
          >
            A glimpse of what awaits when you tell us how you feel.
          </p>
          <SampleMatch />
        </div>
      </section>

      <WaveDivider fill="#1B3A2D" variant="cream" />

      {/* ═══════════════════════════════════════════
          WHY IT WORKS — Mountain deep forest
          ═══════════════════════════════════════════ */}
      <section
        className="relative py-28 md:py-40 overflow-hidden immersive-section"
        style={{ backgroundImage: `url(${mountainImage})`, backgroundColor: '#1B3A2D' }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(14,36,25,0.72)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2
            className="text-center mb-6 balance-text text-shadow-medium reveal"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              color: 'var(--color-white)',
            }}
          >
            Why Healing Stays Work
          </h2>
          <p
            className="text-center mb-16 max-w-2xl mx-auto reveal"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
          >
            We match your emotional state with places built for healing — not just travel.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="reveal p-6 card-hover-subtle"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <feature.icon className="w-8 h-8 mb-4" style={{ color: 'var(--color-sky-light)' }} />
                <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-white)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fill="#0E2419" variant="forest" />

      {/* ═══════════════════════════════════════════
          FINAL CTA — Path full-bleed
          ═══════════════════════════════════════════ */}
      <section
        className="relative py-28 md:py-40 overflow-hidden immersive-section flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})`, minHeight: '80vh' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(14,36,25,0.85) 0%, rgba(14,36,25,0.5) 50%, rgba(14,36,25,0.4) 100%)',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2
            className="mb-6 balance-text text-shadow-medium reveal"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              color: 'var(--color-white)',
            }}
          >
            Your Healing Journey Starts with a Single Step
          </h2>
          <p
            className="mb-10 text-lg leading-relaxed reveal"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-80)' }}
          >
            We believe the right place can change everything. Not a vacation — a return to yourself.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal">
            <Link href="/chat" className="btn-accent">
              Start Matching
            </Link>
            <Link href="/destinations" className="btn-outline-light">
              Browse Destinations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
