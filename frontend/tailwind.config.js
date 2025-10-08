/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1F1F1F',
          card: '#313131',
        },
        accent: {
          pink: '#FF95DD',
          yellow: '#F6FF7F',
          blue: '#B7BEFE',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      // 60fps optimized animations
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'smooth-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out-right': 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translate3d(100%, 0, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
          '100%': { transform: 'translate3d(100%, 0, 0)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95) translateZ(0)', opacity: '0' },
          '100%': { transform: 'scale(1) translateZ(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    // Disable unused plugins for smaller bundle
    preflight: true,
  },
}
