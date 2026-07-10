/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        success: {
          DEFAULT: '#16a34a',
          600: '#15803d',
        },
        danger: {
          DEFAULT: '#dc2626',
        },
        surface: '#ffffff',
        muted: '#6b7280',
        panel: '#f8fafc',
        codeBg: '#0b1220',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
}
