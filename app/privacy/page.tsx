import { Metadata } from 'next';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SereneStay Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <div className="pt-24 pb-16">
        <div className="container-full px-4 py-8 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{ background: 'rgba(91,143,168,0.15)' }}
            >
              <Shield className="w-8 h-8" style={{ color: 'var(--color-sky-light)' }} />
            </div>
            <h1 
              className="text-4xl mb-4"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Privacy Policy
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
                  1. Information We Collect
                </h2>
                <p>We collect minimal information to provide our wellness travel guidance service:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Chat messages you send during our guided destination matching conversation</li>
                  <li>Browser-local storage for match count (no server-side personal data storage)</li>
                </ul>
              </section>

              <section>
                <h2 
                  className="text-xl mb-3"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  2. How We Use Your Information
                </h2>
                <p>
                  Your conversation messages are processed to provide curated destination recommendations 
                  tailored to your wellness travel preferences. These messages are sent to our processing 
                  service for real-time guidance generation and are not permanently stored by SereneStay. 
                  Our service provides wellness travel guidance only and is not a substitute for professional 
                  medical advice, diagnosis, or treatment.
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
                  3. Local Storage
                </h2>
                <p>
                  We use your browser&apos;s local storage to track free match usage and subscription status. 
                  This data never leaves your device and can be cleared at any time through your browser settings.
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
                  4. Third-Party Services
                </h2>
                <p>
                  We work with trusted service providers to deliver our curated destination recommendations. 
                  These providers process your conversation data to generate travel guidance responses. 
                  We do not control their data retention practices — please review their privacy policies for details.
                </p>
                <p className="mt-2">
                  Our contact form uses <strong style={{ color: 'var(--color-white)' }}>FormSubmit.co</strong>, 
                  a secure form-to-email service. When you submit the contact form, your name, email, and message 
                  are temporarily processed by FormSubmit.co and forwarded to our email. FormSubmit.co does not 
                  store your data permanently.
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
                  5. Contact
                </h2>
                <p>
                  For privacy-related questions, contact us through our{' '}
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
