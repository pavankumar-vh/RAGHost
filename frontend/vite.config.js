import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for 60fps dev experience
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    })
  ],
  server: {
    port: 5173,
    open: true,
    // Enable fast HMR
    hmr: {
      overlay: false,
    },
  },
  build: {
    // Enable minification for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2, // Multiple passes for better compression
      },
    },
    // CSS code splitting for faster loads
    cssCodeSplit: true,
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000,
    // Rollup optimizations
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['lucide-react'],
          'firebase': ['firebase/auth', 'firebase/app'],
          'http': ['axios'],
        },
      },
    },
    // Source maps for debugging (disable in production)
    sourcemap: false,
    // Enable CSS minification
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: false, // Faster builds
  },
  // Pre-bundle dependencies for faster dev server
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'lucide-react', 
      'axios',
      'firebase/auth',
      'firebase/app'
    ],
    // Enable esbuild for faster dependency optimization
    esbuildOptions: {
      target: 'esnext',
    },
  },
  // Enable esbuild for faster builds
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
