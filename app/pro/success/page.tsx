'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function ProSuccessPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Restore Pro status
    localStorage.setItem('serenestay_pro', 'true');

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/chat';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-secondary/10">
      <div className="max-w-md mx-auto text-center px-6 py-16">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/10 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-secondary" />
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-4">
          Welcome to Pro!
        </h1>

        {/* Description */}
        <p className="text-primary/60 mb-2">
          Your SereneStay Pro subscription is now active.
        </p>
        <p className="text-primary/60 mb-8">
          You now have unlimited AI conversations to find your perfect sanctuary.
        </p>

        {/* Features Unlocked */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 text-left">
          <h3 className="font-medium text-primary mb-4">You've unlocked:</h3>
          <ul className="space-y-3">
            {[
              'Unlimited AI conversations',
              'All 56+ destinations access',
              '9-dimension wellness scoring',
              'Priority support',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-secondary" />
                </div>
                <span className="text-sm text-primary/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Auto Redirect Notice */}
        <p className="text-sm text-primary/40 mb-4">
          Redirecting to AI matching in {countdown} seconds...
        </p>

        {/* Manual Link */}
        <a
          href="/chat"
          className="inline-flex items-center gap-2 btn-secondary px-8 py-3"
        >
          Start Matching Now
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
