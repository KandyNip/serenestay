import Link from 'next/link';
import { Metadata } from 'next';
import { journalArticles } from '@/lib/journal';
import WaveDivider from '@/components/WaveDivider';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Journal — Serene Stay',
  description: 'Stories, science, and guidance for healing travel. Forest bathing, hot springs, silent retreats, and the places that restore us.',
};

export default function JournalPage() {
  const [featured, ...rest] = journalArticles;

  return (
    <main style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <section
        className="relative flex items-end min-h-[55vh]"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1511497584788-876760111969?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '80px',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(14,36,25,0.2) 0%, rgba(14,36,25,0.5) 40%, rgba(14,36,25,0.95) 100%)',
          }}
        />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16">
          <p
            className="text-sm uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}
          >
            The Journal
          </p>
          <h1
            className="text-4xl md:text-6xl mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', fontWeight: 500 }}
          >
            Stories for the
            <br />
            quiet traveler
          </h1>
          <p
            className="text-lg max-w-xl"
            style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
          >
            Reflections, science, and guidance on healing travel.
          </p>
        </div>
        <WaveDivider fill="var(--color-forest-deep)" variant="forest" height={60} />
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Featured article */}
        {featured && (
          <Link
            href={`/journal/${featured.slug}`}
            className="group block mb-20 rounded-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.01]"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(107,158,126,0.15)',
                      color: 'var(--color-moss)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Featured
                  </span>
                  <span
                    className="text-xs flex items-center gap-1"
                    style={{ color: 'var(--color-white-40)', fontFamily: 'var(--font-body)' }}
                  >
                    <Clock className="w-3 h-3" />
                    {featured.readTime}
                  </span>
                </div>
                <h2
                  className="text-2xl md:text-3xl mb-3 transition-colors group-hover:text-[var(--color-sky-light)]"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', fontWeight: 500, lineHeight: 1.2 }}
                >
                  {featured.title}
                </h2>
                <p
                  className="text-sm md:text-base leading-relaxed mb-6"
                  style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
                >
                  {featured.excerpt}
                </p>
                <div
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--color-sky-light)', fontFamily: 'var(--font-body)' }}
                >
                  Read the story
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Article grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              className="group block rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(14,36,25,0.6), transparent 60%)' }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-white-40)' }}>
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
                <h3
                  className="text-lg mb-2 leading-snug transition-colors group-hover:text-[var(--color-sky-light)]"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', fontWeight: 500 }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: 'var(--color-white-50)', fontFamily: 'var(--font-body)' }}
                >
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div
          className="mt-20 text-center p-10 md:p-14 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(58,125,92,0.15), rgba(91,143,168,0.15))',
            border: '1px solid rgba(126,181,204,0.2)',
          }}
        >
          <BookOpen className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--color-sky-light)' }} />
          <h2
            className="text-2xl md:text-3xl mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', fontWeight: 500 }}
          >
            Healing inspiration, once a week
          </h2>
          <p
            className="text-sm max-w-md mx-auto mb-6"
            style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
          >
            New journal stories, destination finds, and quiet travel reflections. No noise, just calm.
          </p>
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--color-sky)',
              color: 'var(--color-white)',
            }}
          >
            Subscribe
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
