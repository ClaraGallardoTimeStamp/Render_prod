/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Surface system ──────────────────────────────────
        surface: {
          base:      '#080B0D',
          elevated:  '#141416',
          overlay:   '#1F1F22',
          highlight: '#2A2A2E',
        },
        // ── Accent palette ──────────────────────────────────
        accent: {
          violet:      '#A78BFA',
          purple:      '#C084FC',
          sage:        '#7C8C6A',
          'sage-light':'#A3B18A',
          gold:        '#D4AF37',
          wine:        '#2A1F1F',
        },
        // ── Content/text ────────────────────────────────────
        ink: {
          primary:   '#EDEDED',
          secondary: '#9A9A9A',
          tertiary:  '#5A5A5A',
        },
        // ── Primary interactive → violet (replaces red) ─────
        primary: {
          DEFAULT: '#A78BFA',
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // ── Legacy warm (kept for backward compat) ──────────
        warm: { 50: '#fcf6f6', 100: '#faecec', 200: '#f5dada' },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-violet': 'linear-gradient(135deg, #A78BFA 0%, #C084FC 100%)',
        'gradient-sage':   'linear-gradient(135deg, #A3B18A 0%, #7C8C6A 100%)',
        'gradient-gold':   'linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)',
      },
      boxShadow: {
        'glow-violet': '0 0 24px rgba(167,139,250,0.15)',
        'glow-sage':   '0 0 24px rgba(163,177,138,0.12)',
        'surface':     '0 1px 3px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)',
        'elevated':    '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
      },
    }
  },
  plugins: [],
}
