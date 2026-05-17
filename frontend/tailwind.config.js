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
      },
      colors: {
        background: '#09090b',
        surface: '#111115',
        'surface-2': '#18181f',
        border: 'rgba(255,255,255,0.06)',
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 20px rgba(99,102,241,0.15)',
      },
    },
  },
  plugins: [],
}
