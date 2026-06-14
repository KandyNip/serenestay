import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="font-serif text-6xl text-primary/20 mb-4">404</h1>
        <h2 className="font-serif text-2xl text-primary mb-4">Page Not Found</h2>
        <p className="text-primary/60 mb-8 max-w-md mx-auto">
          Looks like this destination isn&apos;t on our map yet. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-secondary px-8 py-3">
            Go Home
          </Link>
          <Link href="/destinations" className="btn-outline px-8 py-3">
            Browse Destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
