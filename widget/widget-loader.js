/**
 * RAGhost Chat Widget - Standalone Loader
 * This script dynamically loads the widget iframe
 */

(function() {
  'use strict';

  // Get configuration
  const config = window.raghostConfig || {};
  const botId = config.botId || 'demo';
  const apiUrl = config.apiUrl || 'http://localhost:5001';
  const template = config.template || 'default';

  // Determine widget URL
  const widgetUrl = `${apiUrl}/widget/templates/${template}.html`;

  // Create iframe container
  const iframe = document.createElement('iframe');
  iframe.id = 'raghost-widget-frame';
  iframe.src = widgetUrl;
  iframe.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    border: none;
    z-index: 999999;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: transparent;
  `;
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowtransparency', 'true');

  // Append to body when DOM is ready
  function injectWidget() {
    document.body.appendChild(iframe);
    
    // Enable pointer events after load
    iframe.onload = function() {
      iframe.style.pointerEvents = 'auto';
      
      // Pass config to iframe
      try {
        iframe.contentWindow.postMessage({
          type: 'raghost-init',
          config: config
        }, '*');
      } catch (e) {
        console.log('[RAGhost] Widget loaded');
      }
    };

    console.log('[RAGhost] Widget initialized');
    console.log('[RAGhost] Bot ID:', botId);
    console.log('[RAGhost] Template:', template);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }

  // Public API
  window.RAGhostWidget = {
    open: function() {
      iframe.contentWindow.postMessage({ type: 'raghost-open' }, '*');
    },
    close: function() {
      iframe.contentWindow.postMessage({ type: 'raghost-close' }, '*');
    },
    toggle: function() {
      iframe.contentWindow.postMessage({ type: 'raghost-toggle' }, '*');
    },
    sendMessage: function(message) {
      iframe.contentWindow.postMessage({ 
        type: 'raghost-send', 
        message: message 
      }, '*');
    }
  };

})();
