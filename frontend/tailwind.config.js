/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f8ff',
          100: '#ebf1ff',
          200: '#d6e4ff',
          300: '#adc9ff',
          400: '#84aeff',
          500: '#3b82f6', // Premium Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        darkBg: '#0f172a', // Slate 900
        darkCard: '#1e293b', // Slate 800
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
