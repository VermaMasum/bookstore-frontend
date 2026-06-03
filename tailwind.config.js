/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
      },
      boxShadow: {
        'xs':    '0 1px 2px rgba(0,0,0,0.05)',
        'card':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'modal': '0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)',
        'btn':   '0 1px 2px rgba(0,0,0,0.08)',
        'btn-primary': '0 1px 3px rgba(79,70,229,0.3), 0 1px 2px rgba(79,70,229,0.2)',
        'inset': 'inset 0 1px 2px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4F46E5, #6366F1)',
        'gradient-dark':  'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.15s ease-out',
        'slide-up':   'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in':   'scaleIn 0.15s ease-out',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-6px)'},  to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.97)' },    to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' },              to: { backgroundPosition: '200% 0' } },
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
