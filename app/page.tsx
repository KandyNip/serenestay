import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, MessageCircle, MapPin, Compass, ArrowRight, CheckCircle } from 'lucide-react';
import DestinationCard from '@/components/DestinationCard';
import RadarChartPreview from '@/components/RadarChartPreview';
import { loadDestinations } from '@/lib/destinations';
import type { Destination } from '@/lib/types';

export const metadata = {
  title: 'SereneStay.ai — AI-Matched Healing Stays',
  description: 'Tell us how you feel. Get AI-matched to a healing stay — yoga in Bali, temple stays in Thailand, forest bathing in Japan. 56 curated places, 9-dimension scoring, free to start.',
};

// How it works steps
const steps = [
  {
    icon: MessageCircle,
    title: 'Share How You Feel',
    description: 'Tell our AI what you\'re feeling — stressed, burnt out, seeking peace. No forms, just conversation.',
  },
  {
    icon: Compass,
    title: 'Get Matched',
    description: 'Our AI matches your emotional state with healing stays — temples, hot springs, ocean sanctuaries — across 9 dimensions.',
  },
  {
    icon: MapPin,
    title: 'Start Healing',
    description: 'See where you\'ll heal, what it offers, and how to get there. Stay a week or a season.',
  },
];

export default async function HomePage() {
  // Load featured destinations directly (Server Component — no HTTP needed)
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
      .slice(0, 4);
  } catch (error) {
    console.error('Failed to load destinations:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Schema.org: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is SereneStay.ai?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "SereneStay.ai is an AI-powered platform that matches you with healing stay destinations worldwide. Tell us how you feel — we find where you'll heal. We evaluate 56 vetted destinations across 9 dimensions including serenity, nature, wellness, and more.",
                },
              },
              {
                "@type": "Question",
                name: "How does the AI matching work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our AI guide analyzes your emotional state, preferred healing methods, travel group size, and special needs through a personalized 4-step consultation, then recommends destinations that match your unique wellness goals.",
                },
              },
              {
                "@type": "Question",
                name: "What does Pro include?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Pro users get unlimited AI healing destination matches, detailed wellness scores, and personalized emotional matching with guided 4-step wellness consultations. Pro is $14.99/month or $119.88/year.",
                },
              },
              {
                "@type": "Question",
                name: "Are the destinations verified?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all 56 destinations are carefully vetted with a 9-dimension scoring system. Destinations with WiFi or medical scores of 2 or below trigger a veto warning to help you make informed decisions.",
                },
              },
            ],
          }),
        }}
      />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=80"
            alt="Serene nature background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Light Gradient Overlay — keeps image visible, ensures text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/40 to-surface/80" />

        {/* Content */}
        <div className="relative z-10 container-full px-4 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full text-secondary text-sm mb-8 animate-fade-in border border-white/30">
            <Sparkles className="w-4 h-4" />
            <span>AI-Matched Healing Stays</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary leading-tight animate-slide-up">
            Where Will Your
            <br />
            <span className="text-gradient">Soul Heal?</span>
          </h1>
          
          {/* Subheading */}
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-primary/70 animate-slide-up stagger-1">
            Tell us how you feel. We'll match you with a place to heal — for a week or a season.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
            <Link
              href="/chat"
              className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              How Are You Feeling?
            </Link>
            <Link
              href="/destinations"
              className="btn-outline text-lg px-8 py-4 flex items-center gap-2"
            >
              Browse Healing Stays
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Trust Signal */}
          <div className="mt-12 animate-slide-up stagger-3">
            <div className="flex items-center justify-center gap-6 text-primary/50 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                56 curated destinations
              </span>
              <span className="w-1 h-1 rounded-full bg-primary/30" />
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                7 regions worldwide
              </span>
              <span className="w-1 h-1 rounded-full bg-primary/30" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                AI-powered matching
              </span>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary/50 rounded-full animate-slide-down" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container-full px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-primary">
              How It Works
            </h2>
            <p className="mt-4 text-primary/60 max-w-xl mx-auto">
              From burnout to belonging — in three steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative text-center group"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-secondary/30 to-transparent" />
                )}
                
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-surface group-hover:bg-secondary/10 transition-colors duration-300">
                  <step.icon className="w-10 h-10 text-secondary" />
                </div>
                
                <h3 className="mt-6 font-serif text-xl text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 text-primary/60 max-w-xs mx-auto">
                  {step.description}
                </p>
                
                {/* Step Number Badge */}
                <div className="absolute top-0 right-1/2 translate-x-[calc(50%+3rem)] md:translate-x-[calc(50%+4rem)] -translate-y-1 w-8 h-8 rounded-full bg-secondary text-white font-mono text-sm flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {featuredDestinations.length > 0 && (
        <section className="py-20">
          <div className="container-full px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl text-primary">
                  Top Healing Stays
                </h2>
                <p className="mt-3 text-primary/60">
                  Curated places where healing begins — scored across 9 dimensions
                </p>
              </div>
              <Link
                href="/destinations"
                className="hidden sm:flex items-center gap-2 text-secondary hover:text-secondary-600 transition-colors"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  priority={index < 2}
                />
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/destinations"
                className="btn-outline inline-flex items-center gap-2"
              >
                View all healing stays
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Radar Chart Preview */}
      {featuredDestinations.length > 0 && (
        <RadarChartPreview destinations={featuredDestinations} />
      )}

      {/* Features Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container-full px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">
              Why Healing Stays Work
            </h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              We match your emotional state with places built for healing — not just travel.
            </p>
          </div>
          
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: '9-Dimensional Matching',
                description: 'Not just pretty photos. We score serenity, nature, wellness facilities, medical access, and 5 more dimensions — so your healing stay actually heals.',
              },
              {
                title: 'Honest Assessments',
                description: 'We flag dealbreakers like poor medical access or unstable WiFi before you commit. No surprises on your healing journey.',
              },
              {
                title: 'Budget Transparent',
                description: 'See real costs for different lifestyles — budget, mid, comfort. Plan a week or stay a season, you\'ll know what it costs.',
              },
              {
                title: 'Emotional Matching',
                description: 'Burnt out? We find temple stays and digital detox. Need nature? Forest bathing and hot springs. Your feeling drives the match.',
              },
              {
                title: 'Seasonal Intelligence',
                description: 'Healing isn\'t one-size-fits-all. Know the best season for weather, prices, and local wellness events at each destination.',
              },
              {
                title: '46 Healing Modalities',
                description: 'Yoga, meditation, sound healing, forest bathing, Ayurveda, temple stays — we match you with places that offer what you need.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <CheckCircle className="w-8 h-8 text-secondary mb-4" />
                <h3 className="font-serif text-xl mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container-full px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-6">
              <Sparkles className="w-10 h-10 text-secondary" />
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl text-primary">
              Ready to Find Where You Heal?
            </h2>
            <p className="mt-4 text-primary/60 max-w-xl mx-auto">
              56 curated healing stays. AI-matched to how you feel. Free to start.
            </p>

            <div className="mt-10">
              <Link
                href="/chat"
                className="btn-secondary text-lg px-10 py-4 inline-flex items-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                How Are You Feeling?
              </Link>
              <p className="mt-4 text-sm text-primary/50">
                Free: 2 AI matches + all destination scores + 9-dimension breakdowns
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
