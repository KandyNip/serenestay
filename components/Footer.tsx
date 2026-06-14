'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, Mail } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate subscription
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Footer columns data
  const footerSections = [
    {
      title: 'Brand',
      links: [
        { label: 'About Us', href: '/#about' },
        { label: 'How It Works', href: '/#how-it-works' },
      ],
    },
    {
      title: 'Explore',
      links: [
        { label: 'Destinations', href: '/destinations' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'AI Matching', href: '/chat' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-primary text-white" role="contentinfo">
      <div className="container-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="font-serif text-2xl text-white hover:text-secondary transition-colors"
            >
              SereneStay.ai
            </Link>
            <p className="mt-4 text-white/70 text-sm leading-relaxed">
              Discover your perfect healing retreat with AI-powered matching.
              Find tranquility, connect with nature, and begin your wellness journey.
            </p>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-serif text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-secondary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-lg mb-4">Stay Updated</h3>
            <p className="text-white/70 text-sm mb-4">
              Get the latest destinations and wellness tips delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-secondary transition-colors"
                  aria-label="Email address"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-600 text-white py-3 px-4 rounded-lg transition-colors"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
            {isSubscribed && (
              <p className="mt-3 text-secondary text-sm animate-fade-in">
                Thank you for subscribing! 🌿
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} SereneStay.ai. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-white/50 text-sm">
              <Link href="#" className="hover:text-secondary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-secondary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
