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
      title: `Plan Your Stay in ${destination.name} | SereneStay.ai`,
      description: `Create a personalized day-by-day itinerary for your healing stay in ${destination.name}.`,
    };
  } catch {
    return {
      title: 'Plan Your Stay | SereneStay.ai',
    };
  }
}

export default async function ItineraryPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  return <ItineraryClient destination={destination} />;
}
