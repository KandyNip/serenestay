import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDestinationBySlug } from '@/lib/destinations';
import ItineraryClient from './ItineraryClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const destination = await getDestinationBySlug(slug);
    if (!destination) {
      return { title: 'Destination Not Found' };
    }
    return {
      title: `Your Healing Journey in ${destination.name} | Serene Stay`,
      description: `A curated, day-by-day healing journey for your stay in ${destination.name}.`,
    };
  } catch {
    return {
      title: 'Your Healing Journey | Serene Stay',
    };
  }
}

export default async function ItineraryPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <ItineraryClient destination={destination} />
    </div>
  );
}
