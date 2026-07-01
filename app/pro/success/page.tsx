'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, AlertCircle, Loader2, Leaf, Sun, Heart } from 'lucide-react';

function ProSuccessContent() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkout_id = searchParams.get('checkout_id') || '';
    const order_id = searchParams.get('order_id') || '';
    const customer_id = searchParams.get('customer_id') || '';
    const subscription_id = searchParams.get('subscription_id') || '';
    const product_id = searchParams.get('product_id') || '';
    const signature = searchParams.get('signature') || '';

    const hasAllParams = checkout_id && order_id && customer_id && subscription_id && product_id && signature;

    if (hasAllParams) {
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
            localStorage.setItem('serenestay_pro_token', data.token);
            localStorage.removeItem('serenestay_pro');
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMessage(data.error || 'Verification failed');
          }
        })
        .catch(() => {
          setStatus('error');
          setErrorMessage('Network error during verification');
        });
    } else {
      setStatus('error');
      setErrorMessage('Missing payment verification parameters');
    }
  }, [searchParams]);

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
      {status === 'loading' && (
        <>
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-sky-light)' }} />
          </div>
          <h1 
            className="text-3xl sm:text-4xl mb-4"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-white)'
            }}
          >
            Verifying Payment...
          </h1>
          <p style={{ color: 'var(--color-white-60)' }}>
            Please wait while we confirm your subscription.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 animate-breathe"
            style={{ background: 'rgba(107,158,126,0.2)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--color-moss)' }} />
          </div>
          <h1 
            className="text-3xl sm:text-4xl mb-4"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-white)'
            }}
          >
            Welcome to Pro!
          </h1>
          <p style={{ color: 'var(--color-white-60)' }} className="mb-2">
            Your SereneStay Pro subscription is now active.
          </p>
          <p style={{ color: 'var(--color-white-60)' }} className="mb-8">
            You now have access to personalized healing journey itineraries and 5 curated destinations.
          </p>

          <div
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              padding: '1.5rem',
            }}
            className="mb-8 text-left"
          >
            <h3 
              className="font-medium mb-4 text-lg"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              You&apos;ve unlocked:
            </h3>
            <ul className="space-y-3">
              {[
                { text: '5 curated healing destinations', icon: Leaf },
                { text: 'Personalized travel itineraries', icon: Sun },
                { text: 'Day-by-day healing journey companion', icon: Heart },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <div 
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(107,158,126,0.2)' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-moss)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--color-white-80)' }}>{feature.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="text-sm mb-4" style={{ color: 'var(--color-white-40)' }}>
            Redirecting to your journey in {countdown} seconds...
          </p>

          <a
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--color-sky)',
              color: 'var(--color-white)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Start Your Journey
            <ArrowRight className="w-4 h-4" />
          </a>
        </>
      )}

      {status === 'error' && (
        <>
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: 'rgba(212,197,169,0.15)' }}
          >
            <AlertCircle className="w-10 h-10" style={{ color: 'var(--color-sand)' }} />
          </div>
          <h1 
            className="text-3xl sm:text-4xl mb-4"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-white)'
            }}
          >
            Verification Issue
          </h1>
          <p style={{ color: 'var(--color-white-60)' }} className="mb-2">
            We couldn&apos;t verify your payment automatically.
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--color-white-40)' }}>
            {errorMessage}
          </p>

          <div
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              padding: '1.5rem',
            }}
            className="mb-8 text-left"
          >
            <h3 
              className="font-medium mb-3"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              What to do:
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-white-60)' }}>
              <li>• If you just completed payment, please wait a moment and refresh this page.</li>
              <li>• Check your email for a payment confirmation from Creem.</li>
              <li>• If the issue persists, please <a href="/contact" style={{ color: 'var(--color-sky-light)' }} className="underline">contact us</a> with your order details.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--color-sky)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Go to Chat
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'transparent',
                color: 'var(--color-white)',
                border: '1px solid var(--color-white-20)',
                fontFamily: 'var(--font-body)',
              }}
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
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Suspense fallback={
          <div className="max-w-md mx-auto text-center px-6 py-16">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-sky-light)' }} />
            </div>
            <h1 
              className="text-3xl sm:text-4xl mb-4"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Loading...
            </h1>
          </div>
        }>
          <ProSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
