import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'forest-deep': '#0E2419',
        'forest': '#1B3A2D',
        'forest-light': '#2D5A45',
        'canopy': '#3A7D5C',
        'moss': '#6B9E7E',
        'sky': '#5B8FA8',
        'sky-light': '#7EB5CC',
        'sky-pale': '#B8D8E8',
        'sand': '#D4C5A9',
        'sand-light': '#E8DECA',
        'sand-warm': '#C9B896',
        'cream': '#F5F0E6',
        'mist': '#E8EDF0',
        'ink': '#1A2E23',
        'ink-light': '#2A4A3A',
        'ink-muted': '#5A7A6A',
        'ink-faint': '#8AA89A',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'glass': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(27, 58, 45, 0.08)',
        'medium': '0 8px 40px rgba(27, 58, 45, 0.12)',
        'deep': '0 16px 64px rgba(27, 58, 45, 0.16)',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'float-gentle': 'floatGentle 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'bounce-slow': 'bounceSlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
