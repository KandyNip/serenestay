import Link from 'next/link';

export default function Footer() {
  // Footer columns data
  const footerSections = [
    {
      title: 'Brand',
      links: [
        { label: 'About Us', href: '/' },
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
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'support@howistoday.online', href: 'mailto:support@howistoday.online' },
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
            <p className="text-white/70 text-sm">
              We&apos;re building something special. Newsletter coming soon.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} SereneStay.ai. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-white/50 text-sm">
              <Link href="/privacy" className="hover:text-secondary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-secondary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
