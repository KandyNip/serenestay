import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Compass, Shield, TreePine, Wind } from 'lucide-react';
import WaveDivider from '@/components/WaveDivider';

export const metadata: Metadata = {
  title: 'About SereneStay | Our Mission',
  description: 'Built by a solo maker who believes healing should be easy to find. Learn about our mission to connect wellness travelers with transformative healing stays worldwide.',
  keywords: 'wellness travel, healing stays, solo maker, mindful travel',
};

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <div className="pt-20 pb-16">
        <section className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
              style={{
                background: 'rgba(107,158,126,0.15)',
                color: 'var(--color-moss)',
                border: '1px solid rgba(107,158,126,0.2)',
              }}
            >
              <Heart className="w-4 h-4" />
              <span>Our Story</span>
            </div>

            <h1 
              className="text-4xl sm:text-5xl leading-tight"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Built by a solo maker who believes healing should be easy to find
            </h1>

            <p 
              className="mt-6 text-xl leading-relaxed"
              style={{ color: 'var(--color-white-60)' }}
            >
              SereneStay started with a simple observation: finding the right place to heal,
              recharge, or reset shouldn't feel like another stressful task.
            </p>
          </div>
        </section>

        <WaveDivider fill="rgba(58,125,92,0.08)" variant="forest" height={80} />

        <section className="py-12" style={{ background: 'rgba(58,125,92,0.05)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '2rem',
                }}
                className="sm:p-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(107,158,126,0.15)' }}
                  >
                    <TreePine className="w-6 h-6" style={{ color: 'var(--color-moss)' }} />
                  </div>
                  <h2 
                    className="text-2xl"
                    style={{ 
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-white)'
                    }}
                  >
                    The Beginning
                  </h2>
                </div>

                <div className="space-y-4 leading-relaxed" style={{ color: 'var(--color-white-80)' }}>
                  <p>
                    After years of burnout and searching for places to recover, I noticed something:
                    the wellness travel industry was full of options but empty of clarity. Healing stays
                    promised transformation, but how do you know which one is right for <em>you</em>?
                  </p>

                  <p>
                    I started building SereneStay in my spare time — not as a company, but as a
                    tool I wished existed. A place where thoughtful matching could help connect your emotional needs
                    with destinations that actually deliver on their promises.
                  </p>

                  <p>
                    Every destination in our database is researched with the same questions I ask
                    myself: <em>Is the WiFi reliable? Can I get medical help if needed? Will I feel
                    safe here? Is it affordable for a long stay?</em> These aren't luxuries — they're
                    the foundation of any healing journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider fill="var(--color-forest-deep)" variant="transparent-light" height={80} />

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(91,143,168,0.1) 0%, rgba(255,255,255,0.08) 50%, rgba(58,125,92,0.05) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(91,143,168,0.2)',
                borderRadius: '20px',
                padding: '2rem',
              }}
              className="sm:p-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(91,143,168,0.15)' }}
                >
                  <Compass className="w-6 h-6" style={{ color: 'var(--color-sky-light)' }} />
                </div>
                <h2 
                  className="text-2xl"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-white)'
                  }}
                >
                  Our Mission
                </h2>
              </div>

              <div className="space-y-4 leading-relaxed" style={{ color: 'var(--color-white-80)' }}>
                <p>
                  <strong>To make healing accessible.</strong> Not everyone can afford a $5,000
                  healing stay package. Not everyone has the time to research 50 destinations. We believe
                  that finding your sanctuary should be as simple as having a conversation.
                </p>

                <p>
                  Our 9-dimension scoring system evaluates destinations on what actually matters:
                  serenity, nature, climate, affordability, wellness facilities, community, WiFi
                  quality, visa friendliness, and medical access. No fluff, no marketing speak —
                  just honest data to help you decide.
                </p>

                <p>
                  We're building for the burnt-out developer, the overwhelmed parent, the seeker
                  looking for meaning, the digital nomad needing a reset. Whoever you are, wherever
                  you're starting from — there's a place that can help you heal.
                </p>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider fill="rgba(58,125,92,0.05)" variant="sand" height={80} />

        <section className="py-12" style={{ background: 'rgba(58,125,92,0.03)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '2rem',
                }}
                className="sm:p-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(107,158,126,0.15)' }}
                  >
                    <Shield className="w-6 h-6" style={{ color: 'var(--color-canopy)' }} />
                  </div>
                  <h2 
                    className="text-2xl"
                    style={{ 
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-white)'
                    }}
                  >
                    Honest by Design
                  </h2>
                </div>

                <div className="space-y-4 leading-relaxed" style={{ color: 'var(--color-white-80)' }}>
                  <p>
                    We don't take commissions from healing stays. We don't rank destinations by who pays
                    us. Our recommendations are based on real data, real scores, and real traveler
                    needs.
                  </p>

                  <p>
                    <strong>Veto warnings are real.</strong> If a destination has unreliable WiFi or
                    limited medical access, we tell you — even if it means you won't book. Your
                    healing journey depends on infrastructure, not just inspiration.
                  </p>

                  <p>
                    <strong>Explorer tier is genuinely useful.</strong> The Healing DNA test plus 3 curated matches is enough to
                    experience our matching technology. We're not gating features to frustrate you
                    into upgrading — we're building trust through value.
                  </p>

                  <p>
                    <strong>Pro exists for depth, not scarcity.</strong> 5 curated destinations,
                    full Why You Match insights, and detailed healing analysis are for people who
                    want to go deeper. The Explorer tier isn't a demo — it's a complete experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider fill="var(--color-forest-deep)" variant="transparent-light" height={80} />

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(91,143,168,0.15)' }}
              >
                <Wind className="w-8 h-8" style={{ color: 'var(--color-sky-light)' }} />
              </div>
            </div>
            <h2 
              className="text-3xl"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Your sanctuary is waiting
            </h2>
            <p 
              className="mt-4"
              style={{ color: 'var(--color-white-60)' }}
            >
              Whether you're ready to start searching or just curious about how our matching works,
              we're here to help.
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
