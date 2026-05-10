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
        primary: {
          DEFAULT: '#EB1C23',
          50: '#fdf3f3',
          100: '#fce4e5',
          200: '#f8c2c4',
          300: '#f39aa0',
          400: '#eb4f58',
          500: '#EB1C23',
          600: '#d4151a',
          700: '#b10f14',
          800: '#921014',
          900: '#791215',
        },
        navy: { dark: '#2a3241' },
        warm: { 50: '#fcf6f6', 100: '#faecec', 200: '#f5dada' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    }
  },
  plugins: [],
}
