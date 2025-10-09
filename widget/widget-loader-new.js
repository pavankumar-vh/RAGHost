/**
 * RAGhost Widget Loader
 * Simple script to load and initialize the chatbot widget
 */

(function() {
  'use strict';

  // Load widget script
  function loadWidget() {
    const script = document.createElement('script');
    script.src = 'https://rag-host.vercel.app/widget/widget-new.js';
    script.async = true;
    script.onload = () => {
      console.log('✨ RAGhost Widget loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load RAGhost Widget');
    };
    document.head.appendChild(script);
  }

  // Auto-load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
