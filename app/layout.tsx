import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

// Font configurations
const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// Site metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://howistoday.online'),
  title: {
    default: 'SereneStay.ai — AI-Matched Healing Stays',
    template: '%s | SereneStay.ai',
  },
  description:
    'Tell us how you feel. Get AI-matched to a healing stay — yoga in Bali, temple stays in Thailand, forest bathing in Japan. 56 curated places, 9-dimension scoring, free to start.',
  keywords: [
    'healing stay',
    'wellness travel',
    'serenity',
    'nature healing stay',
    'wellness destination',
    'mindfulness travel',
  ],
  authors: [{ name: 'SereneStay.ai' }],
  creator: 'SereneStay.ai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://howistoday.online',
    siteName: 'SereneStay.ai',
    title: 'SereneStay.ai — AI-Matched Healing Stays',
    description:
      'Tell us how you feel. Get AI-matched to a healing stay — yoga in Bali, temple stays in Thailand, forest bathing in Japan.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SereneStay.ai — AI-Powered Healing Stay Matching',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SereneStay.ai — AI-Matched Healing Stays',
    description:
      'Tell us how you feel. Get AI-matched to a healing stay — yoga in Bali, temple stays in Thailand, forest bathing in Japan.',
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
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-surface">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SereneStay.ai",
              url: "https://howistoday.online",
              description: "AI-powered healing stay matching platform",
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
              name: "SereneStay.ai",
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
        <Analytics />
      </body>
    </html>
  );
}
