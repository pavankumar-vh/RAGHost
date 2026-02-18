/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo-brutalism light palette
        nb: {
          bg: '#FFFEF0',          // warm off-white background
          card: '#FFFFFF',        // pure white cards
          border: '#000000',      // hard black borders
          text: '#0D0D0D',        // near-black text
          muted: '#6B6B6B',       // muted text
          yellow: '#FFE500',      // primary accent yellow
          pink: '#FF6B9D',        // secondary accent pink
          blue: '#4D9FFF',        // tertiary accent blue
          green: '#00C853',       // success green
          red: '#FF3B3B',         // error red
          orange: '#FF6B2B',      // warning orange
          purple: '#8B5CF6',      // purple accent
          shadow: '#000000',      // shadow color
        },
        // Keep for backwards compat
        dark: { bg: '#1F1F1F', card: '#313131' },
        accent: { pink: '#FF95DD', yellow: '#F6FF7F', blue: '#B7BEFE' },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'nb': '4px 4px 0px 0px #000000',
        'nb-sm': '2px 2px 0px 0px #000000',
        'nb-lg': '6px 6px 0px 0px #000000',
        'nb-xl': '8px 8px 0px 0px #000000',
        'nb-hover': '6px 6px 0px 0px #000000',
        'nb-yellow': '4px 4px 0px 0px #FFE500',
        'nb-pink': '4px 4px 0px 0px #FF6B9D',
        'nb-blue': '4px 4px 0px 0px #4D9FFF',
      },
      borderWidth: {
        '3': '3px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shake': 'shake 0.4s ease',
        'fadeIn': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translate3d(100%, 0, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
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
