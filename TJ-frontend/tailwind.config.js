/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4AF37',
          dark: '#0B0B0B',
          gray: '#F4F4F4',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Montserrat', 'sans-serif'],
        'script': ['Great Vibes', 'cursive'], // ✅ فونت Tres Jolie
      }
    },
  },
  plugins: [],
}
