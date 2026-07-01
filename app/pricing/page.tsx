import { Metadata } from 'next';
import Link from 'next/link';
import { Wind, Check } from 'lucide-react';
import PricingCard from '@/components/PricingCard';
import WaveDivider from '@/components/WaveDivider';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Discover your Healing DNA for free, or unlock full matching with SereneStay Pro.',
};

const freeFeatures = [
  'Healing DNA test + 3 curated matches',
  'Browse & compare 56+ destinations',
  'Why You Match + Mind the Gap insights',
  'Save favorites & guided conversation',
];

const proFeatures = [
  'Everything in Explorer, plus 5 matches per search',
  'Personalized travel itineraries',
  'Day-by-day healing journey with daily check-ins',
  'Adaptive wellness guidance & return integration',
];

const comingSoonFeatures: string[] = [];

const faqs = [
  {
    question: 'How does the Explorer tier work?',
    answer: 'Explorer users get 3 curated matches after taking the Healing DNA test, plus destination comparison, favorites, Why You Match insights, and guided conversation. Both Explorer and Pro use the same 9-dimension scoring system.',
  },
  {
    question: 'Can I cancel my Pro subscription anytime?',
    answer: 'Yes, you can cancel your Pro subscription at any time. You\'ll continue to have Pro access until the end of your billing period. We also offer a 7-day money-back guarantee if you\'re not satisfied.',
  },
  {
    question: 'What\'s the difference between Explorer and Pro?',
    answer: 'Explorer users get 3 curated matches, comparison, favorites, insights, and guided conversation. Pro unlocks 5 curated matches and personalized travel itineraries (Healing Journey Companion).',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 7-day money-back guarantee for Pro annual plans. Monthly plans can be cancelled anytime, but we don\'t offer prorated refunds for unused months.',
  },
];

export default function PricingPage() {
  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
            style={{
              background: 'rgba(91,143,168,0.15)',
              color: 'var(--color-sky-light)',
              border: '1px solid rgba(91,143,168,0.2)',
            }}
          >
            <Wind className="w-4 h-4" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 
            className="text-4xl sm:text-5xl leading-tight"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-white)'
            }}
          >
            Choose Your Path to Serenity
          </h1>
          <p 
            className="mt-4 max-w-xl mx-auto text-lg"
            style={{ color: 'var(--color-white-60)' }}
          >
            Start your wellness journey for free, or unlock full matching and premium features with Pro.
          </p>
        </div>

        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <PricingCard
                tier="free"
                price={{ monthly: 0 }}
                features={freeFeatures}
                cta="Start Exploring"
                href="/chat"
              />

              <PricingCard
                tier="pro"
                price={{ monthly: 14.99 }}
                features={proFeatures}
                comingSoon={comingSoonFeatures}
                cta="Subscribe Now"
                href="https://www.creem.io/payment/prod_4Tswoy49WmcyoR0XrxO0SR"
                external
              />

              <PricingCard
                tier="pro"
                price={{ monthly: 9.99, yearly: 9.99 }}
                features={proFeatures}
                comingSoon={comingSoonFeatures}
                cta="Subscribe Now"
                href="https://www.creem.io/payment/prod_4D1Yb4ziXDLQ3ky8VufgdU"
                external
                isYearly
                badge="Best Value"
              />
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
                <span style={{ color: 'var(--color-white-60)' }}>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
                <span style={{ color: 'var(--color-white-60)' }}>7-day money back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
                <span style={{ color: 'var(--color-white-60)' }}>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider fill="rgba(58,125,92,0.08)" variant="forest" height={80} />

        <section className="py-16" style={{ background: 'rgba(58,125,92,0.05)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <h2 
              className="text-2xl text-center mb-8"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Feature Comparison
            </h2>

            <div
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-white-10)' }}>
                    <th 
                      className="text-left p-4 font-medium"
                      style={{ color: 'var(--color-white)' }}
                    >
                      Feature
                    </th>
                    <th 
                      className="p-4 text-center font-medium"
                      style={{ color: 'var(--color-white)' }}
                    >
                      Explorer
                    </th>
                    <th 
                      className="p-4 text-center font-medium"
                      style={{ 
                        color: 'var(--color-white)',
                        background: 'rgba(91,143,168,0.08)'
                      }}
                    >
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Curated Destination Matches', 'Unlimited', 'Unlimited'],
                    ['Matches per Search', '3', '5'],
                    ['Healing DNA Test', true, true],
                    ['Browse 56+ Destinations', true, true],
                    ['9-Dimension Wellness Scoring', true, true],
                    ['View Full Destination Details', true, true],
                    ['Veto Warnings (WiFi/Medical Alerts)', true, true],
                    ['Why You Match + Mind the Gap Insights', true, true],
                    ['Compare Destinations Head-to-Head', true, true],
                    ['Save Favorites & Shortlist', true, true],
                    ['Guided Conversation — Adjust Your Compass', true, true],
                    ['Curated Travel Itineraries', false, true],
                    ['Day-by-Day Healing Journey Companion', false, true],
                  ].map(([feature, free, pro], index) => (
                    <tr 
                      key={feature as string} 
                      style={{ 
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'
                      }}
                    >
                      <td className="p-4" style={{ color: 'var(--color-white-80)' }}>{feature}</td>
                      <td className="p-4 text-center">
                        {typeof free === 'boolean' ? (
                          free ? (
                            <Check className="w-5 h-5 mx-auto" style={{ color: 'var(--color-moss)' }} />
                          ) : (
                            <span style={{ color: 'var(--color-white-20)' }}>—</span>
                          )
                        ) : (
                          <span style={{ color: 'var(--color-white-60)' }}>{free}</span>
                        )}
                      </td>
                      <td 
                        className="p-4 text-center"
                        style={{ background: 'rgba(91,143,168,0.05)' }}
                      >
                        {typeof pro === 'boolean' ? (
                          pro ? (
                            <Check className="w-5 h-5 mx-auto" style={{ color: 'var(--color-sky-light)' }} />
                          ) : (
                            <span style={{ color: 'var(--color-white-20)' }}>—</span>
                          )
                        ) : (
                          <span className="font-medium" style={{ color: 'var(--color-white)' }}>{pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <WaveDivider fill="var(--color-forest-deep)" variant="transparent-light" height={80} />

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 
              className="text-2xl text-center mb-8"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group"
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                  }}
                >
                  <summary 
                    className="flex items-center justify-between p-6 cursor-pointer list-none"
                  >
                    <h3 
                      className="font-medium"
                      style={{ color: 'var(--color-white)' }}
                    >
                      {faq.question}
                    </h3>
                    <span 
                      className="w-6 h-6 transition-transform group-open:rotate-180"
                      style={{ color: 'var(--color-white-40)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div 
                    className="px-6 pb-6"
                    style={{ color: 'var(--color-white-60)' }}
                  >
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-8">
          <div 
            className="max-w-2xl mx-auto text-center p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(91,143,168,0.12) 0%, rgba(58,125,92,0.1) 50%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
            }}
          >
            <h2 
              className="text-2xl sm:text-3xl"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Ready to Find Your Sanctuary?
            </h2>
            <p 
              className="mt-4"
              style={{ color: 'var(--color-white-60)' }}
            >
              Take the free Healing DNA test and get 3 curated matches. No credit card required.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/chat"
                className="px-8 py-3 font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: 'var(--color-sky)',
                  color: 'var(--color-white)',
                  borderRadius: '9999px',
                }}
              >
                Start Free Matching
              </Link>
              <Link
                href="/destinations"
                className="px-8 py-3 font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: 'transparent',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-white-20)',
                  borderRadius: '9999px',
                }}
              >
                Browse Destinations
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
