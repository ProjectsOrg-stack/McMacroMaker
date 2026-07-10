/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0C0E14',
          surface: '#141822',
          hover: '#1C2233',
          elevated: '#1E2435',
        },
        border: {
          DEFAULT: '#2A3045',
          light: '#363D54',
        },
        text: {
          DEFAULT: '#E0E4EC',
          muted: '#7A8299',
          faint: '#4A5268',
        },
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          glow: 'rgba(59,130,246,0.4)',
        },
        accent: {
          DEFAULT: '#10B981',
          hover: '#059669',
          glow: 'rgba(16,185,129,0.4)',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          glow: 'rgba(239,68,68,0.3)',
        },
        cyan: {
          DEFAULT: '#22D3EE',
          glow: 'rgba(34,211,238,0.3)',
        },
        sand: '#C8956C',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(59,130,246,0.3)',
        'glow-accent': '0 0 20px rgba(16,185,129,0.3)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.3)',
        'glow-danger': '0 0 20px rgba(239,68,68,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
