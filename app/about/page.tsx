import { Metadata } from 'next';
import { Heart, Compass, Shield, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About SereneStay.ai | Our Mission',
  description: 'Built by a solo maker who believes healing should be easy to find. Learn about our mission to connect wellness travelers with transformative retreats worldwide.',
  keywords: 'wellness travel, healing retreats, solo maker, mindful travel, digital nomad wellness',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <section className="container-full px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm mb-6">
            <Heart className="w-4 h-4" />
            <span>Our Story</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl text-primary leading-tight">
            Built by a solo maker who believes healing should be easy to find
          </h1>

          <p className="mt-6 text-xl text-primary/70 leading-relaxed">
            SereneStay.ai started with a simple observation: finding the right place to heal,
            recharge, or reset shouldn't feel like another stressful task.
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section className="container-full px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="font-serif text-2xl text-primary">The Beginning</h2>
            </div>

            <div className="space-y-4 text-primary/80 leading-relaxed">
              <p>
                After years of burnout and searching for places to recover, I noticed something:
                the wellness travel industry was full of options but empty of clarity. Retreats
                promised transformation, but how do you know which one is right for <em>you</em>?
              </p>

              <p>
                I started building SereneStay.ai in my spare time — not as a company, but as a
                tool I wished existed. A place where AI could help match your emotional needs
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
      </section>

      {/* Mission Section */}
      <section className="container-full px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-secondary/5 via-white to-primary/5 rounded-2xl p-8 sm:p-12 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Compass className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="font-serif text-2xl text-primary">Our Mission</h2>
            </div>

            <div className="space-y-4 text-primary/80 leading-relaxed">
              <p>
                <strong>To make healing accessible.</strong> Not everyone can afford a $5,000
                retreat package. Not everyone has the time to research 50 destinations. We believe
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

      {/* Honest by Design */}
      <section className="container-full px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="font-serif text-2xl text-primary">Honest by Design</h2>
            </div>

            <div className="space-y-4 text-primary/80 leading-relaxed">
              <p>
                We don't take commissions from retreats. We don't rank destinations by who pays
                us. Our recommendations are based on real data, real scores, and real traveler
                needs.
              </p>

              <p>
                <strong>Veto warnings are real.</strong> If a destination has unreliable WiFi or
                limited medical access, we tell you — even if it means you won't book. Your
                healing journey depends on infrastructure, not just inspiration.
              </p>

              <p>
                <strong>Free tier is genuinely useful.</strong> Two AI matches are enough to
                experience our matching technology. We're not gating features to frustrate you
                into upgrading — we're building trust through value.
              </p>

              <p>
                <strong>Pro exists for depth, not scarcity.</strong> Unlimited conversations,
                emotional matching, and detailed healing insights are for people who
                want to go deeper. The free tier isn't a demo — it's a complete experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container-full px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl text-primary">
            Your sanctuary is waiting
          </h2>
          <p className="mt-4 text-primary/60">
            Whether you're ready to start searching or just curious about how AI matching works,
            we're here to help.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/chat"
              className="btn-secondary px-8 py-3"
            >
              Start Free Matching
            </a>
            <a
              href="/destinations"
              className="btn-outline px-8 py-3"
            >
              Browse Destinations
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
