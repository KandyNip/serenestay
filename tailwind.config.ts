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
        primary: {
          DEFAULT: '#1B4332',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#1B4332',
          600: '#1A3A2C',
          700: '#163125',
          800: '#13281F',
          900: '#0F1F17',
        },
        secondary: {
          DEFAULT: '#52B788',
          50: '#E8F5ED',
          100: '#D1EDD6',
          200: '#A3DBBD',
          300: '#75C9A4',
          400: '#52B788',
          500: '#3DA573',
          600: '#2E8F5E',
          700: '#257A4E',
          800: '#1C653E',
          900: '#13502E',
        },
        accent: {
          DEFAULT: '#D4A373',
          50: '#FDF8F3',
          100: '#FAF0E6',
          200: '#F5E1CC',
          300: '#EFD2B3',
          400: '#D4A373',
          500: '#C08B5A',
          600: '#A67241',
          700: '#8C5A28',
          800: '#72470F',
          900: '#583400',
        },
        surface: {
          DEFAULT: '#FEFAE0',
          50: '#FFFFFF',
          100: '#FEFAE0',
          200: '#FDF8D0',
          300: '#FCF5C0',
        },
        gold: {
          DEFAULT: '#B8860B',
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#B8860B',
          600: '#996F09',
          700: '#7A5807',
          800: '#5C4105',
          900: '#3D2A03',
        },
        danger: '#E57373',
        warning: '#FFB74D',
        success: '#81C784',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(27, 67, 50, 0.08)',
        'soft-lg': '0 8px 40px rgba(27, 67, 50, 0.12)',
        'card': '0 2px 12px rgba(27, 67, 50, 0.06)',
        'card-hover': '0 8px 30px rgba(27, 67, 50, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#52B788' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
