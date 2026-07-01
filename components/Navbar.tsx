'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/destinations', label: 'Destinations' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/journal', label: 'Journal' },
    { href: '/contact', label: 'Contact' },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  if (pathname?.startsWith('/itinerary/')) return null;

  const navBg = isScrolled
    ? 'rgba(14,36,25,0.88)'
    : 'rgba(14,36,25,0.7)';
  const navBlur = isScrolled ? 'blur(24px)' : 'blur(20px)';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: navBg,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
        role="banner"
      >
        <nav className="px-6 md:px-10" role="navigation" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              className="text-xl md:text-2xl italic tracking-wide text-white hover:text-sky-light transition-colors duration-300"
              style={{ fontFamily: 'var(--font-display)' }}
              aria-label="SereneStay - Home"
            >
              SereneStay
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-wide text-white/60 hover:text-white transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link
              href="/chat"
              className="hidden md:inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'var(--color-sky)',
                color: 'var(--color-white)',
              }}
            >
              Find Your Retreat
            </Link>

            <button
              type="button"
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <>
                  <span className="block w-6 h-0.5 rounded bg-white transition-transform" />
                  <span className="block w-6 h-0.5 rounded bg-white transition-opacity" />
                  <span className="block w-6 h-0.5 rounded bg-white transition-transform" />
                </>
              )}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden transition-opacity duration-300"
        style={{
          background: 'rgba(14,36,25,0.95)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-3xl text-white hover:text-sky-light transition-colors duration-300"
            style={{ fontFamily: 'var(--font-display)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/chat"
          className="mt-4 inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--color-sky)',
            color: 'var(--color-white)',
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Find Your Retreat
        </Link>
      </div>
    </>
  );
}
