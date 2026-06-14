import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SereneStay Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container-full px-4 py-16 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl text-primary mb-8">Terms of Service</h1>
        <p className="text-sm text-primary/50 mb-8">Last updated: June 2026</p>

        <div className="space-y-6 text-primary/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-primary mb-3">1. Service Description</h2>
            <p>SereneStay provides AI-powered wellness travel destination recommendations. Our suggestions are informational only and should not replace professional travel or medical advice.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">2. Free Tier</h2>
            <p>Free users receive 2 AI-powered destination matches. Usage is tracked via browser local storage.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">3. Pro Subscription</h2>
            <p>Pro subscribers receive unlimited AI conversations. Subscriptions can be cancelled at any time. We offer a 7-day money-back guarantee for annual plans.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">4. Accuracy Disclaimer</h2>
            <p>While we strive for accuracy, destination information and wellness scores may change. Always verify travel details, visa requirements, and safety conditions independently before making travel decisions.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-primary mb-3">5. Contact</h2>
            <p>For questions about these terms, contact us through our <Link href="/contact" className="text-secondary hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
