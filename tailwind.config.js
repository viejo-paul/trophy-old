/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // La oscuridad de la mazmorra (fondos)
        'trophy-dark': '#1c1917',   // Stone 900
        'trophy-panel': '#292524',  // Stone 800
        
        // El tesoro y el texto destacado (Gold)
        'trophy-gold': '#d4af37',   // Metallic Gold
        'trophy-gold-dim': '#b5952f',
        
        // La sangre y el horror (Dark)
        'trophy-red': '#7f1d1d',    // Red 900
        'trophy-blood': '#450a0a',  // Red 950
        
        // Textos generales
        'trophy-text': '#e7e5e4',   // Stone 200
        'trophy-sub': '#a8a29e',    // Stone 400
      },
      fontFamily: {
        serif: ['"Crimson Text"', 'serif'], // Ideal para rol clásico
        sans: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        // Un degradado sutil para dar atmósfera
        'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}