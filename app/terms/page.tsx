import { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SereneStay Terms of Service',
};

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <div className="pt-24 pb-16">
        <div className="container-full px-4 py-8 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{ background: 'rgba(212,197,169,0.15)' }}
            >
              <FileText className="w-8 h-8" style={{ color: 'var(--color-sand)' }} />
            </div>
            <h1 
              className="text-4xl mb-4"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Terms of Service
            </h1>
            <p style={{ color: 'var(--color-white-40)' }} className="text-sm">
              Last updated: June 2026
            </p>
          </div>

          <div
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              padding: '2rem',
            }}
            className="sm:p-10"
          >
            <div className="space-y-8 leading-relaxed" style={{ color: 'var(--color-white-70)' }}>
              <section>
                <h2 
                  className="text-xl mb-3"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  1. Service Description
                </h2>
                <p>
                  SereneStay provides wellness travel guidance and curated destination recommendations. 
                  Our suggestions are informational only and should not replace professional travel, 
                  medical, or mental health advice. Always consult qualified professionals for medical concerns.
                </p>
              </section>

              <section>
                <h2 
                  className="text-xl mb-3"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  2. Free Tier
                </h2>
                <p>
                  Free users receive 1 destination match after taking the Healing DNA assessment. 
                  Usage is tracked via browser local storage.
                </p>
              </section>

              <section>
                <h2 
                  className="text-xl mb-3"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  3. Pro Subscription
                </h2>
                <p>
                  Pro subscribers receive 5 curated healing destinations with full insights and 
                  personalized journey guidance. Subscriptions can be cancelled at any time. 
                  We offer a 7-day money-back guarantee for annual plans.
                </p>
              </section>

              <section>
                <h2 
                  className="text-xl mb-3"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  4. Accuracy Disclaimer
                </h2>
                <p>
                  While we strive for accuracy, destination information and wellness scores may change. 
                  Always verify travel details, visa requirements, safety conditions, and healthcare access 
                  independently before making travel decisions.
                </p>
              </section>

              <section>
                <h2 
                  className="text-xl mb-3"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  5. Wellness Guidance Notice
                </h2>
                <p>
                  SereneStay provides general wellness travel information for educational and inspirational 
                  purposes only. It is not intended as a substitute for professional medical advice, diagnosis, 
                  or treatment. Always seek the advice of your physician or other qualified health providers 
                  with any questions regarding a medical condition.
                </p>
              </section>

              <section>
                <h2 
                  className="text-xl mb-3"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  6. Contact
                </h2>
                <p>
                  For questions about these terms, contact us through our{' '}
                  <Link 
                    href="/contact" 
                    style={{ color: 'var(--color-sky-light)' }}
                    className="hover:underline"
                  >
                    Contact page
                  </Link>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
