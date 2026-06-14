import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SereneStay Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container-full px-4 py-16 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl text-primary mb-8">Privacy Policy</h1>
        <p className="text-sm text-primary/50 mb-8">Last updated: June 2026</p>

        <div className="space-y-6 text-primary/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-primary mb-3">1. Information We Collect</h2>
            <p>We collect minimal information to provide our service:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Chat messages you send to our AI for destination matching</li>
              <li>Browser-local storage for match count (no server-side personal data)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">2. How We Use Your Information</h2>
            <p>Your chat messages are processed by our AI to provide personalized destination recommendations. We do not store your conversations on our servers or share them with third parties.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">3. Local Storage</h2>
            <p>We use your browser&apos;s local storage to track free match usage. This data never leaves your device and can be cleared at any time through your browser settings.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">4. Third-Party Services</h2>
            <p>We use AI services to power our chat recommendations. These services may temporarily process your messages to generate responses, but do not retain your data.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">5. Contact</h2>
            <p>For privacy-related questions, contact us through our <Link href="/contact" className="text-secondary hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
