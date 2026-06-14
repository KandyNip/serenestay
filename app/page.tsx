import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, MessageCircle, MapPin, Compass, ArrowRight, CheckCircle } from 'lucide-react';
import DestinationCard from '@/components/DestinationCard';
import { loadDestinations } from '@/lib/destinations';
import type { Destination } from '@/lib/types';

export const metadata = {
  title: 'Find Your Perfect Healing Retreat',
  description: 'Discover tranquility with AI-powered healing retreat matching. Find your perfect sanctuary for wellness, nature, and serenity around the world.',
};

// How it works steps
const steps = [
  {
    icon: MessageCircle,
    title: 'Chat with Serene',
    description: 'Share your wellness dreams and preferences with our AI guide in a natural conversation.',
  },
  {
    icon: Compass,
    title: 'Get Matched',
    description: 'Our AI analyzes hundreds of destinations to find your perfect sanctuary based on your unique needs.',
  },
  {
    icon: MapPin,
    title: 'Plan Your Journey',
    description: 'Receive detailed guides, cost estimates, and practical tips for your healing retreat.',
  },
];

export default async function HomePage() {
  // Load featured destinations directly (Server Component — no HTTP needed)
  let featuredDestinations: Destination[] = [];
  try {
    const all = await loadDestinations();
    featuredDestinations = [...all]
      .sort((a, b) => b.scores.serenity - a.scores.serenity)
      .slice(0, 4);
  } catch (error) {
    console.error('Failed to load destinations:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface to-white" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 container-full px-4 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Matching</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary leading-tight animate-slide-up">
            Find Your Perfect
            <br />
            <span className="text-gradient">Healing Retreat</span>
          </h1>
          
          {/* Subheading */}
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-primary/70 animate-slide-up stagger-1">
            Discover tranquility with personalized AI recommendations. 
            From mountain monasteries to coastal sanctuaries, find where your soul belongs.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
            <Link
              href="/chat"
              className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Start AI Matching
            </Link>
            <Link
              href="/destinations"
              className="btn-outline text-lg px-8 py-4 flex items-center gap-2"
            >
              Explore Destinations
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
              Three simple steps to your perfect wellness retreat
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
                  Trending Retreats
                </h2>
                <p className="mt-3 text-primary/60">
                  Most loved by the wellness community this month
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
                View all destinations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container-full px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">
              Why Choose SereneStay?
            </h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              We combine AI intelligence with deep wellness expertise to match you with retreats that truly transform.
            </p>
          </div>
          
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: '9-Dimensional Matching',
                description: 'We analyze serenity, nature, climate, affordability, wellness facilities, community, WiFi, visa, and medical access.',
              },
              {
                title: 'Honest Assessments',
                description: 'Every destination is scored with real data. We flag dealbreakers like poor WiFi or limited medical facilities upfront.',
              },
              {
                title: 'Budget Transparent',
                description: 'See exact monthly costs for different lifestyles — from backpacker to comfort living.',
              },
              {
                title: 'Veto Warnings',
                description: 'We flag potential dealbreakers like poor WiFi or limited medical facilities before you commit.',
              },
              {
                title: 'Seasonal Intelligence',
                description: 'Know the perfect time to visit for weather, prices, and local events.',
              },
              {
                title: 'Holistic Wellness',
                description: 'From yoga retreats to digital detox, find experiences that match your wellness journey.',
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
              Ready to Find Your Sanctuary?
            </h2>
            <p className="mt-4 text-primary/60 max-w-xl mx-auto">
              Explore 56 curated wellness destinations across 7 regions with AI-powered personalized matching.
            </p>
            
            <div className="mt-10">
              <Link
                href="/chat"
                className="btn-secondary text-lg px-10 py-4 inline-flex items-center gap-2 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Begin Your Journey
              </Link>
              <p className="mt-4 text-sm text-primary/50">
                Free to start — 2 AI matches included
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
