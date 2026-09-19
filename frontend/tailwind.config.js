/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#2a2305',
          100: '#3a3007',
          200: '#5c4b08',
          300: '#8a730a',
          400: '#c9a100',
          500: '#FFD21F',
          600: '#E5B800',
          700: '#b78e00',
          800: '#8a6a00',
          900: '#4d3d00',
        },
        accent: {
          50: '#fffaeb',
          100: '#fff1c6',
          200: '#ffe288',
          300: '#ffcf4d',
          400: '#FFD21F',
          500: '#E5B800',
          600: '#dd7602',
          700: '#b75306',
          800: '#943f0c',
          900: '#7a330d',
        },
        dark: {
          50: '#0A0A0A',
          100: '#151515',
          200: '#2D2D2D',
          300: '#3f3f3f',
          400: '#737373',
          500: '#A3A3A3',
          600: '#CFCFCF',
          700: '#E5E5E5',
          800: '#F5F5F5',
          900: '#FFFFFF',
          850: '#202020',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}