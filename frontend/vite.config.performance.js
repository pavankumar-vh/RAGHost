// Vite Performance Configuration for 60fps
export default {
  build: {
    // Enable minification for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide-icons': ['lucide-react'],
          'ui-vendor': ['firebase/auth', 'axios'],
        },
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'axios'],
  },
  server: {
    // Enable fast refresh
    hmr: {
      overlay: false,
    },
  },
};
