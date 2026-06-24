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
        uno: {
          red: {
            DEFAULT: '#ea3323',
            light: '#ff6b5c',
            dark: '#b31b10',
          },
          blue: {
            DEFAULT: '#0055b3',
            light: '#3388ff',
            dark: '#003366',
          },
          green: {
            DEFAULT: '#2ca847',
            light: '#5ad979',
            dark: '#1b6e2d',
          },
          yellow: {
            DEFAULT: '#ffcc00',
            light: '#ffdd55',
            dark: '#cc9900',
          },
          dark: {
            DEFAULT: '#121212',
            card: '#1e1e1e',
            border: '#2e2e2e',
          }
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 2.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'deal-card': 'dealCard 0.5s ease-out forwards',
        'draw-card': 'drawCard 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dealCard: {
          '0%': { transform: 'scale(0.5) rotate(-180deg) translate(0, -200px)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg) translate(0, 0)', opacity: '1' },
        },
        drawCard: {
          '0%': { transform: 'translateY(-50px) scale(0.8)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
