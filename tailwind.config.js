/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Crimson Text', 'Merriweather', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Crimson Text', 'Merriweather', 'serif'],
      },
      maxWidth: {
        '4xl': '56rem',
      },
      colors: {
        'editorial': {
          'black': '#000000',
          'white': '#ffffff',
          'cream': '#fefefe',
          'burgundy': '#8B0000',
          'newsprint': '#1e3a8a',
          'gray': {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'draw-line': 'drawLine 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'typewriter': 'typewriter 2s steps(40, end)',
        'ink-spread': 'inkSpread 1.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
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
        drawLine: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        inkSpread: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
