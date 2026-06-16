'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function ProSuccessContent() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Read Creem redirect parameters from URL
    const checkout_id = searchParams.get('checkout_id') || '';
    const order_id = searchParams.get('order_id') || '';
    const customer_id = searchParams.get('customer_id') || '';
    const subscription_id = searchParams.get('subscription_id') || '';
    const product_id = searchParams.get('product_id') || '';
    const signature = searchParams.get('signature') || '';

    const hasAllParams = checkout_id && order_id && customer_id && subscription_id && product_id && signature;

    if (hasAllParams) {
      // Call verification API
      fetch('/api/pro/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkout_id,
          order_id,
          customer_id,
          subscription_id,
          product_id,
          signature,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.token) {
            // Verification successful — store Pro token
            localStorage.setItem('serenestay_pro_token', data.token);
            // Clear old insecure key
            localStorage.removeItem('serenestay_pro');
            setStatus('success');
          } else {
            // Verification failed
            setStatus('error');
            setErrorMessage(data.error || 'Verification failed');
          }
        })
        .catch(() => {
          setStatus('error');
          setErrorMessage('Network error during verification');
        });
    } else {
      // No parameters — show error but don't clear existing Pro status (backward compatibility)
      setStatus('error');
      setErrorMessage('Missing payment verification parameters');
    }
  }, [searchParams]);

  // Countdown timer (only on success)
  useEffect(() => {
    if (status !== 'success') return;

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
  }, [status]);

  return (
    <div className="max-w-md mx-auto text-center px-6 py-16">
      {/* Loading State */}
      {status === 'loading' && (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-4">
            Verifying Payment...
          </h1>
          <p className="text-primary/60">
            Please wait while we confirm your subscription.
          </p>
        </>
      )}

      {/* Success State */}
      {status === 'success' && (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/10 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-4">
            Welcome to Pro!
          </h1>
          <p className="text-primary/60 mb-2">
            Your SereneStay Pro subscription is now active.
          </p>
          <p className="text-primary/60 mb-8">
            You now have unlimited AI conversations to find your perfect sanctuary.
          </p>

          {/* Features Unlocked */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 text-left">
            <h3 className="font-medium text-primary mb-4">You&apos;ve unlocked:</h3>
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
        </>
      )}

      {/* Error State */}
      {status === 'error' && (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-4">
            Verification Issue
          </h1>
          <p className="text-primary/60 mb-2">
            We couldn&apos;t verify your payment automatically.
          </p>
          <p className="text-sm text-primary/50 mb-8">
            {errorMessage}
          </p>

          {/* Help Notice */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 text-left">
            <h3 className="font-medium text-primary mb-3">What to do:</h3>
            <ul className="space-y-2 text-sm text-primary/70">
              <li>• If you just completed payment, please wait a moment and refresh this page.</li>
              <li>• Check your email for a payment confirmation from Creem.</li>
              <li>• If the issue persists, please <a href="/contact" className="text-secondary underline">contact us</a> with your order details.</li>
            </ul>
          </div>

          {/* Manual Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/chat"
              className="inline-flex items-center gap-2 btn-secondary px-6 py-3"
            >
              Go to Chat
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 btn-outline px-6 py-3"
            >
              Contact Support
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-secondary/10">
      <Suspense fallback={
        <div className="max-w-md mx-auto text-center px-6 py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-4">Loading...</h1>
        </div>
      }>
        <ProSuccessContent />
      </Suspense>
    </div>
  );
}
