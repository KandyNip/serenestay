import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';

export default function Footer() {
  return (
    <footer
      className="py-10"
      style={{
        background: '#0E2419',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <Link
              href="/"
              className="text-xl md:text-2xl italic text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SereneStay
            </Link>
            <p
              className="mt-4 text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--color-white-60)' }}
            >
              We believe the right place can change everything. Not a vacation — a return to yourself.
            </p>
          </div>

          <div>
            <h4
              className="text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--color-white-80)', fontFamily: 'var(--font-body)' }}
            >
              Explore
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/destinations"
                  className="text-sm transition-colors duration-300 hover:text-white"
                  style={{ color: 'var(--color-white-60)' }}
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm transition-colors duration-300 hover:text-white"
                  style={{ color: 'var(--color-white-60)' }}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm transition-colors duration-300 hover:text-white"
                  style={{ color: 'var(--color-white-60)' }}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/journal"
                  className="text-sm transition-colors duration-300 hover:text-white"
                  style={{ color: 'var(--color-white-60)' }}
                >
                  Journal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--color-white-80)', fontFamily: 'var(--font-body)' }}
            >
              Healing Inspiration
            </h4>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--color-white-60)' }}
            >
              Weekly retreat picks and wellness wisdom, delivered gently.
            </p>
            <NewsletterSignup variant="dark" />
          </div>
        </div>

        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span style={{ color: 'var(--color-white-40)' }}>
            © {new Date().getFullYear()} SereneStay. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="transition-colors duration-300 hover:text-white"
              style={{ color: 'var(--color-white-60)' }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors duration-300 hover:text-white"
              style={{ color: 'var(--color-white-60)' }}
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="transition-colors duration-300 hover:text-white"
              style={{ color: 'var(--color-white-60)' }}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
