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
          gold: '#D4AF37',   // اللون الذهبي من اللوجو
          dark: '#0B0B0B',   // أسود فخم
          gray: '#F4F4F4',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'], // خط للعناوين فخم
        'body': ['Montserrat', 'sans-serif'],    // خط للنصوص مريح
      }
    },
  },
  plugins: [],
}