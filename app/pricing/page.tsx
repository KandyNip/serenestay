import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Check } from 'lucide-react';
import PricingCard from '@/components/PricingCard';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose your path to serenity. Start free or unlock unlimited matches with SereneStay Pro.',
};

// Pricing data
const freeFeatures = [
  '2 AI-powered destination matches',
  'Access to destination database',
  'Basic matching criteria',
  'View destination details',
  'Community forums access',
];

const proFeatures = [
  'Unlimited AI-powered matches',
  'Advanced matching with deep preferences',
  'Detailed destination insights',
  'Save & compare destinations',
  'Download comprehensive guides',
  'Priority support',
  'Early access to new destinations',
  'Exclusive wellness partner discounts',
];

// FAQ data
const faqs = [
  {
    question: 'How does the free tier work?',
    answer: 'Free users get 2 AI-powered destination matches to experience our matching technology. After that, you can upgrade to Pro for unlimited matches and premium features.',
  },
  {
    question: 'Can I cancel my Pro subscription anytime?',
    answer: 'Yes, you can cancel your Pro subscription at any time. You\'ll continue to have Pro access until the end of your billing period. We also offer a 7-day money-back guarantee if you\'re not satisfied.',
  },
  {
    question: 'What makes the AI matching different in Pro?',
    answer: 'Pro users get access to our advanced matching algorithm that considers 9+ dimensions including serenity, nature, wellness facilities, community vibes, WiFi quality, visa requirements, and more. Free tier uses a simplified matching system.',
  },
  {
    question: 'Are the destination guides really comprehensive?',
    answer: 'Yes! Pro users get detailed guides including month-by-month cost breakdowns, visa application tips, health & safety notes, local customs, and insider tips from verified visitors.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 7-day money-back guarantee for Pro annual plans. Monthly plans can be cancelled anytime, but we don\'t offer prorated refunds for unused months.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="container-full px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Simple, Transparent Pricing</span>
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl text-primary">
          Choose Your Path to Serenity
        </h1>
        <p className="mt-4 text-primary/60 max-w-xl mx-auto">
          Start your wellness journey for free, or unlock unlimited matching and premium features with Pro.
        </p>
      </div>

      {/* Pricing Cards */}
      <section className="container-full px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Billing Toggle Info */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm text-primary/60">Monthly</span>
            <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full">
              Save 33% with Annual
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Free Tier */}
            <PricingCard
              tier="free"
              price={{ monthly: 0 }}
              features={freeFeatures}
              cta="Start Free"
              href="/chat"
            />

            {/* Pro Tier */}
            <PricingCard
              tier="pro"
              price={{ monthly: 9.99, yearly: 79 }}
              features={proFeatures}
              cta="Upgrade to Pro"
              isYearly={true}
              href="/chat"
            />
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-primary/50">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary" />
              <span>7-day money back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container-full px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl text-primary text-center mb-8">
            Feature Comparison
          </h2>
          
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left p-4 text-primary font-medium">Feature</th>
                  <th className="p-4 text-center text-primary font-medium">Free</th>
                  <th className="p-4 text-center text-primary font-medium bg-secondary/5">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Destination Matches', '2', 'Unlimited'],
                  ['Matching Dimensions', 'Basic (3)', 'Advanced (9+)'],
                  ['Destination Database Access', true, true],
                  ['Detailed Insights', false, true],
                  ['Save Favorites', false, true],
                  ['Compare Destinations', false, true],
                  ['Download Guides', false, true],
                  ['Priority Support', false, true],
                  ['Early Access to New Destinations', false, true],
                ].map(([feature, free, pro], index) => (
                  <tr key={feature as string} className={index % 2 === 0 ? 'bg-surface/50' : ''}>
                    <td className="p-4 text-primary">{feature}</td>
                    <td className="p-4 text-center">
                      {typeof free === 'boolean' ? (
                        free ? (
                          <Check className="w-5 h-5 text-secondary mx-auto" />
                        ) : (
                          <span className="text-primary/30">—</span>
                        )
                      ) : (
                        <span className="text-primary/70">{free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-secondary/5">
                      {typeof pro === 'boolean' ? (
                        pro ? (
                          <Check className="w-5 h-5 text-secondary mx-auto" />
                        ) : (
                          <span className="text-primary/30">—</span>
                        )
                      ) : (
                        <span className="font-medium text-primary">{pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container-full px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl text-primary text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-xl shadow-card overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-medium text-primary">{faq.question}</h3>
                  <span className="w-6 h-6 text-primary/40 group-open:rotate-180 transition-transform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-primary/70">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-full px-4 pb-8">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-surface via-white to-secondary/10 rounded-3xl p-12">
          <h2 className="font-serif text-2xl sm:text-3xl text-primary">
            Ready to Find Your Sanctuary?
          </h2>
          <p className="mt-4 text-primary/60">
            Start with 2 free AI matches. No credit card required.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="btn-secondary px-8 py-3"
            >
              Start Free Matching
            </Link>
            <Link
              href="/destinations"
              className="btn-outline px-8 py-3"
            >
              Browse Destinations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
