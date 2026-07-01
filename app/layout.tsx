import type { Metadata } from 'next';
import { Playfair_Display, Nunito, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import ScrollReveal from '@/components/ScrollReveal';

const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '600', '700'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://howistoday.online'),
  title: {
    default: 'SereneStay — The Place You Need Already Exists',
    template: '%s | SereneStay',
  },
  description:
    'We find healing retreats that were waiting for you. Tell us how you feel — discover yoga in Bali, temple stays in Thailand, forest bathing in Japan, and hot spring sanctuaries worldwide.',
  keywords: [
    'healing retreat',
    'wellness travel',
    'serenity',
    'nature retreat',
    'wellness destination',
    'mindfulness travel',
    'forest bathing',
    'hot springs',
    'yoga retreat',
    'meditation retreat',
  ],
  authors: [{ name: 'SereneStay' }],
  creator: 'SereneStay',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://howistoday.online',
    siteName: 'SereneStay',
    title: 'SereneStay — The Place You Need Already Exists',
    description:
      'We find healing retreats that were waiting for you. Tell us how you feel — discover your perfect sanctuary.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SereneStay — Find Your Healing Retreat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SereneStay — The Place You Need Already Exists',
    description:
      'We find healing retreats that were waiting for you. Tell us how you feel.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${nunito.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-forest-deep text-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SereneStay",
              url: "https://howistoday.online",
              description: "Find healing retreats matched to how you feel",
              email: "support@howistoday.online",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SereneStay",
              url: "https://howistoday.online",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://howistoday.online/destinations?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollReveal />
        <Analytics />
      </body>
    </html>
  );
}
