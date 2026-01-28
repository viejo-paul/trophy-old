/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trophy: {
          dark: '#1a1a1a',     // Fondo principal oscuro
          panel: '#262626',    // Paneles ligeramente más claros
          gold: '#d4af37',     // Color de acento (Trophy Gold)
          red: '#8a1c1c',      // Color de acento (Daño/Ruina)
          text: '#e5e5e5',     // Texto legible (blanco roto)
          sub: '#a3a3a3'       // Textos secundarios (gris)
        }
      },
      fontFamily: {
        // Usaremos fuentes del sistema por ahora, luego importaremos Google Fonts
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}