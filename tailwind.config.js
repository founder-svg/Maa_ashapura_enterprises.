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
          blue: '#1E3A8A',     // Deep Navy Blue (from business card)
          cyan: '#0284C7',     // Vibrant Cyan
          orange: '#EA580C',   // Energetic LPG Orange (from business card)
          red: '#DC2626',      // LPG Cylinder Red
          dark: '#0F172A',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0'
        }
      }
    },
  },
  plugins: [],
}
