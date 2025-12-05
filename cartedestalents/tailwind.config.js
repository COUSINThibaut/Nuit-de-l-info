/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Palette "Obsidian & Crimson" - Harmonisée
        primary: {
          DEFAULT: '#BA181B', // Rouge signature
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#BA181B', // Main
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
          950: '#450506',
        },
        // Gris neutres teintés (Zinc) pour l'interface
        secondary: {
          DEFAULT: '#71717a',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Couleurs sémantiques standardisées
        success: {
          DEFAULT: '#10b981', // Emerald 500
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber 500
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        accent: {
          DEFAULT: '#E5383B', // Rouge vif pour les détails
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#E5383B',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // Fond et Surfaces
        background: {
          DEFAULT: '#09090b', // Zinc 950 (Plus doux que le noir pur)
          light: '#18181b',   // Zinc 900
          lighter: '#27272a', // Zinc 800
          dark: '#000000',
        },
        surface: {
          DEFAULT: '#18181b', // Zinc 900
          light: '#27272a',   // Zinc 800
          dark: '#09090b',    // Zinc 950
        },
        text: {
          DEFAULT: '#f4f4f5', // Zinc 100
          muted: '#a1a1aa',   // Zinc 400
          dark: '#09090b',
        },
      },
      // Animations personnalisées pour l'effet "Wow"
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.7s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], // Recommandé: Importe la police Inter pour le look tech
      }
    },
  },
  plugins: [],
}