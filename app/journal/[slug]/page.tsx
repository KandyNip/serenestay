import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleBySlug, journalArticles } from '@/lib/journal';
import WaveDivider from '@/components/WaveDivider';
import { ArrowLeft, Clock, Calendar, BookOpen, MapPin } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return journalArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} — Serene Stay Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.coverImage }],
      type: 'article',
    },
  };
}

export default async function JournalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = article.relatedDestinations ?? [];

  return (
    <main style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        className="relative flex items-end min-h-[60vh]"
        style={{
          backgroundImage: `url(${article.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '80px',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(14,36,25,0.15) 0%, rgba(14,36,25,0.5) 40%, rgba(14,36,25,0.97) 100%)',
          }}
        />
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-14">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-80"
            style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: 'rgba(107,158,126,0.2)',
                color: 'var(--color-moss)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {article.category}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-white-40)', fontFamily: 'var(--font-body)' }}>
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-white-40)', fontFamily: 'var(--font-body)' }}>
              <Calendar className="w-3 h-3" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1
            className="text-3xl md:text-5xl leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', fontWeight: 500 }}
          >
            {article.title}
          </h1>
        </div>
        <WaveDivider fill="var(--color-forest-deep)" variant="forest" height={50} />
      </section>

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Content */}
        <div className="space-y-6">
          {article.content.map((block, i) => {
            if (block.type === 'paragraph') {
              return (
                <p
                  key={i}
                  className="leading-relaxed text-base md:text-lg"
                  style={{ color: 'var(--color-white-70)', fontFamily: 'var(--font-body)' }}
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === 'heading') {
              const Tag = block.level === 2 ? 'h2' : 'h3';
              const sizeClass = block.level === 2 ? 'text-2xl md:text-3xl mt-10' : 'text-xl md:text-2xl mt-8';
              return (
                <Tag
                  key={i}
                  className={sizeClass}
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)', fontWeight: 500 }}
                >
                  {block.text}
                </Tag>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote
                  key={i}
                  className="my-8 pl-6 py-2"
                  style={{ borderLeft: '3px solid var(--color-moss)' }}
                >
                  <p
                    className="text-lg md:text-xl italic leading-relaxed"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-sand)' }}
                  >
                    {block.text}
                  </p>
                  {block.cite && (
                    <cite
                      className="text-sm mt-2 block not-italic"
                      style={{ color: 'var(--color-white-40)', fontFamily: 'var(--font-body)' }}
                    >
                      — {block.cite}
                    </cite>
                  )}
                </blockquote>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={i} className="space-y-3 my-4" style={{ listStyle: 'none' }}>
                  {block.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex gap-3 text-base leading-relaxed"
                      style={{ color: 'var(--color-white-70)', fontFamily: 'var(--font-body)' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"
                        style={{ background: 'var(--color-sky-light)' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--color-white-50)',
                    fontFamily: 'var(--font-body)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related destinations */}
        {related.length > 0 && (
          <div
            className="mt-12 p-6 md:p-8 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3
              className="text-lg mb-4 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
            >
              <MapPin className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />
              Places mentioned
            </h3>
            <div className="flex flex-wrap gap-3">
              {related.map((dest) => (
                <Link
                  key={dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="text-sm px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(91,143,168,0.15)',
                    color: 'var(--color-sky-light)',
                    border: '1px solid rgba(91,143,168,0.3)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {dest.name} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to journal link */}
        <div className="mt-16 text-center">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--color-sky)',
              color: 'var(--color-white)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <BookOpen className="w-4 h-4" />
            More stories from the Journal
          </Link>
        </div>
      </article>
    </main>
  );
}
