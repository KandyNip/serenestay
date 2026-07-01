import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getDestinationBySlug,
  loadDestinations,
} from '@/lib/destinations';
import { Metadata } from 'next';
import DestinationRadar from '@/components/DestinationRadar';
import ScoreBar from '@/components/ScoreBar';
import HealingChips from '@/components/HealingChips';
import FavoriteButton from '@/components/FavoriteButton';
import JourneyPreview from '@/components/JourneyPreview';
import WaveDivider from '@/components/WaveDivider';
import type { Destination } from '@/lib/types';

const RELATED_LIMIT = 3;

const HEALING_TAGS = [
  { label: 'Yoga', value: 'yoga' },
  { label: 'Meditation', value: 'meditation' },
  { label: 'Forest Bathing', value: 'forest-bathing' },
  { label: 'Hot Springs', value: 'hot-springs' },
  { label: 'Temple Stay', value: 'temple-stay' },
  { label: 'Mindfulness', value: 'mindfulness' },
  { label: 'Surf Therapy', value: 'surf-therapy' },
  { label: 'Nature Therapy', value: 'nature-therapy' },
  { label: 'Zen Retreat', value: 'zen-retreat' },
  { label: 'Digital Detox', value: 'digital-detox' },
  { label: 'Breathwork', value: 'breathwork' },
  { label: 'Sound Healing', value: 'sound-healing' },
  { label: 'Ayurveda', value: 'ayurveda' },
  { label: 'Tea Ceremony', value: 'tea-ceremony' },
  { label: 'Island Meditation', value: 'island-meditation' },
  { label: 'Ocean Therapy', value: 'ocean-therapy' },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};
  return {
    title: `${destination.name}, ${destination.country} — Serene Stay`,
    description: destination.tagline,
    openGraph: {
      title: `${destination.name}, ${destination.country}`,
      description: destination.tagline,
      images: destination.images?.[0] ? [{ url: destination.images[0] }] : [],
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const healings = HEALING_TAGS;

  const allDestinations = await loadDestinations();
  const similar = allDestinations
    .filter((d: Destination) => d.id !== destination.id)
    .map((d: Destination) => {
      const dTags = d.healingTags ?? [];
      const myTags = destination.healingTags ?? [];
      const overlap = dTags.filter((t: string) => myTags.includes(t)).length;
      const sameRegion = d.region === destination.region ? 2 : 0;
      return { d, score: overlap + sameRegion };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_LIMIT)
    .map((x) => x.d);

  const bestForTags = destination.healingTags ?? [];
  const notIdealTags: string[] = [];

  const scoreLabels: Record<string, string> = {
    serenity: 'Serenity',
    nature: 'Nature',
    climate: 'Climate',
    affordability: 'Affordability',
    wellness: 'Wellness',
    community: 'Community',
  };

  return (
    <main style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <div
        className="relative h-[60vh] md:h-[75vh] flex items-end"
        style={{
          backgroundImage: `url(${destination.images[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '80px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(14,36,25,0.2) 0%, rgba(14,36,25,0.5) 50%, rgba(14,36,25,0.95) 100%)',
          }}
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 md:pb-24">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-80"
            style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
          >
            ← Back to destinations
          </Link>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p
                className="text-sm uppercase tracking-widest mb-3"
                style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}
              >
                {destination.region} · {destination.country}
              </p>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', fontWeight: 500 }}
              >
                {destination.name}
              </h1>
              <p
                className="text-lg md:text-xl max-w-2xl"
                style={{ color: 'var(--color-white-70)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
              >
                {destination.tagline}
              </p>
            </div>
            <FavoriteButton slug={destination.slug} size="lg" />
          </div>
        </div>
        <WaveDivider fill="var(--color-forest-deep)" variant="forest" height={60} />
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24 -mt-8 relative z-10">
        <section className="mb-16 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2
                className="text-xl md:text-2xl mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
              >
                About this place
              </h2>
              <p
                className="leading-relaxed"
                style={{ color: 'var(--color-white-70)', fontFamily: 'var(--font-body)' }}
              >
                {destination.description}
              </p>
            </div>

            {bestForTags.length > 0 && (
              <div>
                <h3
                  className="text-sm uppercase tracking-widest mb-3"
                  style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}
                >
                  Best For
                </h3>
                <HealingChips
                  tags={bestForTags}
                  healingTags={healings}
                  size="md"
                  activeColor="var(--color-canopy)"
                />
              </div>
            )}

            {notIdealTags.length > 0 && (
              <div>
                <h3
                  className="text-sm uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(194,120,92,0.8)', fontFamily: 'var(--font-body)' }}
                >
                  May not be ideal for
                </h3>
                <HealingChips
                  tags={notIdealTags}
                  healingTags={healings}
                  size="md"
                  activeColor="#c2785c"
                />
              </div>
            )}

            {(destination.bestSeason?.months?.length ?? 0) > 0 && (
              <div>
                <h3
                  className="text-sm uppercase tracking-widest mb-2"
                  style={{ color: 'var(--color-sand)', fontFamily: 'var(--font-body)' }}
                >
                  Best Season
                </h3>
                <p style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}>
                  {destination.bestSeason?.months?.join(' · ')}
                </p>
                {destination.bestSeason?.description && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-white-40)', fontFamily: 'var(--font-body)' }}
                  >
                    {destination.bestSeason.description}
                  </p>
                )}
              </div>
            )}

            {destination.practicalInfo && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h3
                  className="text-lg mb-4"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
                >
                  Practical notes
                </h3>
                <div className="space-y-4 text-sm" style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}>
                  {destination.practicalInfo.gettingThere && (
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-moss)' }}>Getting There</p>
                      <p className="leading-relaxed">{destination.practicalInfo.gettingThere}</p>
                    </div>
                  )}
                  {destination.practicalInfo.tips && (
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-moss)' }}>Tips</p>
                      <p className="leading-relaxed">{destination.practicalInfo.tips}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {destination.highlights && destination.highlights.length > 0 && (
              <div>
                <h3
                  className="text-sm uppercase tracking-widest mb-3"
                  style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}
                >
                  Highlights
                </h3>
                <ul className="space-y-2">
                  {destination.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm"
                      style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
                    >
                      <span style={{ color: 'var(--color-sky-light)' }}>·</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--glass-bg-strong)',
                backdropFilter: 'var(--glass-blur-heavy)',
                WebkitBackdropFilter: 'var(--glass-blur-heavy)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2
                className="text-lg mb-5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
              >
                Healing profile
              </h2>
              <DestinationRadar destinations={[destination]} />
            </div>

            <div
              className="rounded-2xl p-6 space-y-3"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h3
                className="text-sm uppercase tracking-widest mb-2"
                style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}
              >
                Scores
              </h3>
              {Object.entries(scoreLabels).map(([key, label]) => {
                const score = (destination.scores as unknown as Record<string, number>)[key] ?? 0;
                return (
                  <ScoreBar key={key} label={label} score={Math.round(score)} />
                );
              })}
            </div>
          </div>
        </section>

        <WaveDivider fill="rgba(255,255,255,0.03)" variant="transparent-light" height={30} />

        <JourneyPreview
          destinationName={destination.name}
          destinationSlug={destination.slug}
          healingTags={bestForTags}
        />

        {similar.length > 0 && (
          <section className="mt-20">
            <h2
              className="text-2xl md:text-3xl mb-8"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
            >
              You may also feel drawn to
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similar.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${d.slug}`}
                  className="group block rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.images[0]}
                      alt={d.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(14,36,25,0.7), transparent 60%)',
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <p
                      className="text-xs uppercase tracking-widest mb-1"
                      style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}
                    >
                      {d.country}
                    </p>
                    <h3
                      className="text-lg mb-1"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
                    >
                      {d.name}
                    </h3>
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--color-white-50)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
                    >
                      {d.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
