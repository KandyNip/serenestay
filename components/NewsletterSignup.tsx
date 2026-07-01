'use client';

import { useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'dark' | 'light';
  className?: string;
}

export default function NewsletterSignup({ variant = 'dark', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('_subject', 'New SereneStay Newsletter Subscription');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      await fetch('https://formsubmit.co/ajax/kx6m2fp8@mozmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          _subject: 'New SereneStay Newsletter Subscription',
          _template: 'table',
          _captcha: 'false',
        }),
      });

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('success');
      setEmail('');
    }
  };

  const isDark = variant === 'dark';

  if (status === 'success') {
    return (
      <p
        className={`text-sm ${className}`}
        style={{ color: isDark ? 'var(--color-moss)' : 'var(--color-canopy)' }}
      >
        Thank you. You&apos;ll hear from us soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-all duration-300 focus:ring-2"
        style={{
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,36,25,0.05)',
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(14,36,25,0.1)',
          color: isDark ? 'var(--color-white)' : 'var(--color-ink)',
          fontFamily: 'var(--font-body)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = isDark ? 'var(--color-sky-light)' : 'var(--color-sky)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(14,36,25,0.1)';
        }}
      />
      <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
        style={{
          background: isDark ? 'var(--color-sky)' : 'var(--color-sky)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
        }}
      >
        {status === 'submitting' ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
