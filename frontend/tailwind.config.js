/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'cursive'],
        vt: ['"VT323"', 'monospace'],
      },
      colors: {
        background: '#060816',
        surface: '#0B1020',
        'surface-2': '#121A2C',
        border: '#2A3555',
        accent: {
          DEFAULT: '#7C5CFF',
          hover: '#9D87FF',
        },
        'accent-secondary': '#4CC9F0',
        danger: '#FF5E7E',
        success: '#5EEB8F',
        'text-primary': '#F8FAFC',
        'text-secondary': '#AAB3D1',
        muted: '#6B728A',
      },
      boxShadow: {
        card: '4px 4px 0px 0px rgba(42,53,85,0.8), inset 0 0 0 1px rgba(124,92,255,0.2)',
        glow: '0 0 15px rgba(124,92,255,0.4)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.5)',
        'pixel-md': '4px 4px 0px 0px rgba(0,0,0,0.5)',
        'pixel-accent': '4px 4px 0px 0px #7C5CFF',
        'pixel-danger': '4px 4px 0px 0px #FF5E7E',
      },
      animation: {
        'scanlines': 'scanlines 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(124,92,255,0.4)' },
          '50%': { opacity: '.8', boxShadow: '0 0 5px rgba(124,92,255,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
