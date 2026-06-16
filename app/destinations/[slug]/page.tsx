import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Calendar, MessageCircle, Plane, Wifi, Heart, Clock, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getDestinationBySlug, loadDestinations } from '@/lib/destinations';
import ScoreBar from '@/components/ScoreBar';
import VetoWarning from '@/components/VetoWarning';
import DestinationCard from '@/components/DestinationCard';
import ImageGallery from '@/components/ImageGallery';
import ProsConsCard from '@/components/ProsConsCard';
import HealingTagsCard from '@/components/HealingTagsCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const destination = await getDestinationBySlug(slug);
    if (!destination) {
      return { title: 'Destination Not Found' };
    }
    return {
      title: `${destination.name}, ${destination.country}`,
      description: destination.tagline,
      openGraph: {
        title: `${destination.name} | SereneStay.ai`,
        description: destination.tagline,
        images: [destination.images[0]],
      },
    };
  } catch {
    return {
      title: 'Destination Not Found',
    };
  }
}

// Generate static params for popular destinations
export async function generateStaticParams() {
  try {
    const destinations = await loadDestinations();
    return destinations.slice(0, 20).map((d) => ({
      slug: d.slug,
    }));
  } catch {
    return [];
  }
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  const destination = await getDestinationBySlug(slug);
  if (!destination) {
    notFound();
  }

  // Load related destinations (same region, exclude current)
  let relatedDestinations: typeof destination[] = [];
  try {
    const all = await loadDestinations();
    relatedDestinations = all
      .filter((d) => d.region === destination.region && d.id !== destination.id)
      .slice(0, 3);
  } catch {
    // Ignore related destinations errors
  }

  // Score labels mapping
  const scoreLabels: Record<string, string> = {
    serenity: 'Serenity',
    nature: 'Nature & Scenery',
    climate: 'Climate',
    affordability: 'Affordability',
    wellness: 'Wellness Facilities',
    community: 'Community',
    wifi: 'WiFi Quality',
    visa: 'Visa Friendliness',
    medical: 'Medical Access',
  };

  // Determine veto warning type
  const getWarningType = (): 'wifi' | 'medical' | 'general' => {
    if (destination.vetoWarning?.toLowerCase().includes('wifi')) return 'wifi';
    if (destination.vetoWarning?.toLowerCase().includes('medical')) return 'medical';
    return 'general';
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Back Navigation */}
      <div className="container-full px-4 py-4">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 text-primary/60 hover:text-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Destinations</span>
        </Link>
      </div>

      {/* Hero Image Gallery */}
      <ImageGallery images={destination.images} destinationName={destination.name} />

      {/* Main Content */}
      <div className="container-full px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl text-primary">
                {destination.name}
              </h1>
              <p className="mt-3 text-xl text-primary/70">
                {destination.tagline}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Emotional Tagline */}
              {destination.emotionalTagline && (
                <div className="mt-6 bg-gradient-to-r from-purple-50 via-emerald-50 to-sky-50 rounded-2xl p-6 shadow-card">
                  <p className="font-serif text-xl sm:text-2xl text-primary/90 leading-relaxed italic">
                    "{destination.emotionalTagline}"
                  </p>
                </div>
              )}
            </div>

            {/* Veto Warning */}
            {destination.vetoWarning && (
              <VetoWarning
                warning={destination.vetoWarning}
                type={getWarningType()}
              />
            )}

            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl text-primary mb-4">
                About This Retreat
              </h2>
              <p className="text-primary/70 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* 9-Dimensional Scores */}
            <div>
              <h2 className="font-serif text-2xl text-primary mb-6">
                Rating Breakdown
              </h2>
              <div className="bg-white rounded-2xl p-6 shadow-card space-y-4">
                {Object.entries(destination.scores).map(([key, score]) => (
                  <ScoreBar
                    key={key}
                    label={scoreLabels[key] || key}
                    score={score}
                    size="lg"
                  />
                ))}
              </div>
            </div>

            {/* Best Season */}
            <div>
              <h2 className="font-serif text-2xl text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-secondary" />
                Best Time to Visit
              </h2>
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex flex-wrap gap-2 mb-4">
                  {destination.bestSeason.months.map((month) => (
                    <span
                      key={month}
                      className="px-4 py-2 bg-secondary/10 text-secondary font-medium rounded-lg"
                    >
                      {month}
                    </span>
                  ))}
                </div>
                <p className="text-primary/70">{destination.bestSeason.description}</p>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="font-serif text-2xl text-primary mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-secondary" />
                Highlights
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {destination.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-card"
                  >
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-secondary font-mono text-sm">{index + 1}</span>
                    </div>
                    <p className="text-primary/80">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Healing Tags */}
            {destination.healingTags && destination.healingTags.length > 0 && (
              <HealingTagsCard
                healingTags={destination.healingTags}
                emotionalTagline={destination.emotionalTagline || ''}
              />
            )}

            {/* Pros & Cons */}
            {destination.pros && destination.pros.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-primary mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-6 h-6 text-secondary" />
                  Pros & Cons
                </h2>
                <ProsConsCard pros={destination.pros} cons={destination.cons || []} />
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Chat CTA */}
            <div className="bg-gradient-to-br from-secondary to-primary rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl">Chat with Serene</h3>
                  <p className="text-white/70 text-sm">AI Wellness Guide</p>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-4">
                Have questions about {destination.name}? Chat with our AI guide for personalized insights.
              </p>
              <Link
                href={`/chat?context=${destination.slug}&name=${encodeURIComponent(destination.name)}`}
                className="block w-full py-3 bg-white text-primary text-center rounded-xl font-medium hover:bg-surface transition-colors"
              >
                Ask Serene About {destination.name}
              </Link>
            </div>

            {/* Monthly Costs */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-serif text-xl text-primary mb-4">
                Monthly Living Costs
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
                  <span className="text-primary/70">Budget</span>
                  <span className="font-mono text-lg font-semibold text-primary">
                    ${destination.monthlyCost.budget}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/5 border border-secondary/20 rounded-xl">
                  <span className="text-secondary">Mid-range</span>
                  <span className="font-mono text-lg font-semibold text-secondary">
                    ${destination.monthlyCost.mid}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
                  <span className="text-primary/70">Comfort</span>
                  <span className="font-mono text-lg font-semibold text-primary">
                    ${destination.monthlyCost.comfort}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs text-primary/50 text-center">
                Estimated costs in {destination.monthlyCost.currency} per month
              </p>
            </div>

            {/* Practical Info */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-serif text-xl text-primary mb-4">
                Practical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-primary/60 mb-1 flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Getting There
                  </h4>
                  <p className="text-sm text-primary/80">{destination.practicalInfo.gettingThere}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-primary/60 mb-1 flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    WiFi
                  </h4>
                  <p className="text-sm text-primary/80">{destination.practicalInfo.wifi}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-primary/60 mb-1 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Medical
                  </h4>
                  <p className="text-sm text-primary/80">{destination.practicalInfo.medical}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-primary/60 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Visa
                  </h4>
                  <p className="text-sm text-primary/80">{destination.practicalInfo.visa}</p>
                </div>
              </div>
              
              {/* Tips */}
              <div className="mt-6 pt-4 border-t border-primary/10">
                <h4 className="text-sm font-medium text-primary/60 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Local Tips
                </h4>
                <p className="text-sm text-primary/80">{destination.practicalInfo.tips}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Destinations */}
        {relatedDestinations.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-serif text-2xl text-primary">
                More in {destination.region}
              </h2>
              <div className="flex-1 h-px bg-primary/10" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedDestinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
