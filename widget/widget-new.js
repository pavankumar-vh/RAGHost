/**
 * RAGhost Chat Widget - Enhanced Version
 * Beautiful floating bubble chatbot with markdown support
 */

(function() {
  'use strict';

  // Configuration
  const _rc = window.RAGhostConfig || window.raghostConfig || {};
  const config = {
    botId: _rc.botId || 'demo',
    apiUrl: _rc.apiUrl || 'https://raghost-pcgw.onrender.com',
    botName: _rc.botName || 'AI Assistant',
    botType: _rc.botType || 'Support',
    color: _rc.color || 'blue',
    welcomeMessage: _rc.welcomeMessage || 'Hi! How can I help you today? 👋',
    template: _rc.template || 'modern-gradient',
    // Custom style overrides from WidgetCustomizer
    primaryColor:    _rc.primaryColor    || null,
    secondaryColor:  _rc.secondaryColor  || null,
    backgroundColor: _rc.backgroundColor || null,
    textColor:       _rc.textColor       || null,
    width:           _rc.width           || 400,
    height:          _rc.height          || 600,
    position:        _rc.position        || 'bottom-right',
    borderRadius:    _rc.borderRadius    != null ? _rc.borderRadius : 16,
    buttonSize:      _rc.buttonSize      || 64,
    buttonStyle:     _rc.buttonStyle     || 'circle',
    fontFamily:      _rc.fontFamily      || null,
    animationSpeed:  _rc.animationSpeed  || 'normal',
  };

  // State
  let sessionId = getSessionId();
  let isTyping = false;
  let isOpen = false;

  // Elements (will be created dynamically)
  let chatButton, chatWindow, closeBtn, messagesContainer, input, sendBtn;

  // Initialize
  function init() {
    injectStyles();
    createWidget();
    attachEventListeners();
    console.log('✨ RAGhost Widget initialized', config);
  }

  // Session ID management
  function getSessionId() {
    let sid = localStorage.getItem('raghost-session-id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('raghost-session-id', sid);
    }
    return sid;
  }

  // Inject base styles
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = getBaseStyles();
    document.head.appendChild(style);
  }

  // Get base styles (common to all templates)
  function getBaseStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * {
        box-sizing: border-box;
      }

      .raghost-widget-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .raghost-chat-button {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .raghost-chat-button:hover {
        transform: scale(1.1);
      }

      .raghost-chat-button:active {
        transform: scale(0.95);
      }

      .raghost-chat-button svg {
        width: 28px;
        height: 28px;
        fill: white;
        transition: transform 0.3s ease;
      }

      .raghost-chat-button.open svg {
        transform: rotate(180deg);
      }

      .raghost-chat-window {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 400px;
        max-width: calc(100vw - 48px);
        height: 600px;
        max-height: calc(100vh - 140px);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform-origin: bottom right;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        transform: scale(0.8) translateY(20px);
        pointer-events: none;
      }

      .raghost-chat-window.open {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: all;
      }

      .raghost-header {
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .raghost-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .raghost-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }

      .raghost-bot-details {
        flex: 1;
        min-width: 0;
      }

      .raghost-bot-name {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .raghost-bot-status {
        font-size: 12px;
        opacity: 0.8;
        margin: 2px 0 0 0;
      }

      .raghost-header-actions {
        display: flex;
        gap: 8px;
      }

      .raghost-header-btn {
        width: 36px;
        height: 36px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.35);
        border-color: rgba(255, 255, 255, 0.6);
        transform: rotate(90deg) scale(1.1);
      }

      .raghost-header-btn:active {
        transform: rotate(90deg) scale(0.95);
      }

      .raghost-header-btn svg {
        width: 20px;
        height: 20px;
        stroke-width: 2.5;
      }

      .raghost-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .raghost-messages::-webkit-scrollbar {
        width: 6px;
      }

      .raghost-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .raghost-messages::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      .raghost-message {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        animation: messageSlideIn 0.3s ease;
      }

      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .raghost-message.user {
        flex-direction: row-reverse;
      }

      .raghost-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }

      .raghost-message-content {
        max-width: 75%;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .raghost-message.user .raghost-message-content {
        align-items: flex-end;
      }

      .raghost-message-bubble {
        padding: 12px 16px;
        border-radius: 16px;
        word-wrap: break-word;
        line-height: 1.5;
        font-size: 14px;
      }

      .raghost-message.user .raghost-message-bubble {
        border-bottom-right-radius: 4px;
      }

      .raghost-message.bot .raghost-message-bubble {
        border-bottom-left-radius: 4px;
      }

      .raghost-message-time {
        font-size: 11px;
        opacity: 0.6;
        padding: 0 4px;
      }

      /* Markdown styling */
      .raghost-message-bubble p {
        margin: 0 0 8px 0;
      }

      .raghost-message-bubble p:last-child {
        margin-bottom: 0;
      }

      .raghost-message-bubble strong {
        font-weight: 600;
      }

      .raghost-message-bubble em {
        font-style: italic;
      }

      .raghost-message-bubble code {
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }

      .raghost-message-bubble pre {
        background: rgba(0, 0, 0, 0.2);
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 8px 0;
      }

      .raghost-message-bubble pre code {
        background: none;
        padding: 0;
      }

      .raghost-message-bubble ul,
      .raghost-message-bubble ol {
        margin: 8px 0;
        padding-left: 24px;
      }

      .raghost-message-bubble li {
        margin: 4px 0;
      }

      .raghost-message-bubble a {
        color: inherit;
        text-decoration: underline;
      }

      .raghost-message-bubble blockquote {
        border-left: 3px solid rgba(255, 255, 255, 0.3);
        padding-left: 12px;
        margin: 8px 0;
        opacity: 0.9;
      }

      /* Typing indicator */
      .raghost-typing {
        display: flex;
        gap: 4px;
        padding: 8px 0;
      }

      .raghost-typing span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.6;
        animation: typingBounce 1.4s infinite;
      }

      .raghost-typing span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .raghost-typing span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingBounce {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }

      .raghost-input-area {
        padding: 16px 20px;
        display: flex;
        gap: 12px;
        align-items: flex-end;
        flex-shrink: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .raghost-watermark {
        padding: 8px 20px;
        text-align: center;
        font-size: 11px;
        opacity: 0.6;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .raghost-watermark a {
        color: inherit;
        text-decoration: none;
        transition: opacity 0.2s ease;
      }

      .raghost-watermark a:hover {
        opacity: 1;
      }

      .raghost-input-wrapper {
        flex: 1;
        position: relative;
      }

      .raghost-input {
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: none;
        outline: none;
        font-family: inherit;
        font-size: 14px;
        resize: none;
        max-height: 120px;
        overflow-y: auto;
      }

      .raghost-input::-webkit-scrollbar {
        width: 4px;
      }

      .raghost-input::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
      }

      .raghost-send-btn {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .raghost-send-btn:hover:not(:disabled) {
        transform: scale(1.05);
      }

      .raghost-send-btn:active:not(:disabled) {
        transform: scale(0.95);
      }

      .raghost-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .raghost-send-btn svg {
        width: 20px;
        height: 20px;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .raghost-chat-window {
          width: calc(100vw - 32px);
          height: calc(100vh - 120px);
          right: 16px;
          bottom: 90px;
        }

        .raghost-widget-container {
          right: 16px;
          bottom: 16px;
        }

        .raghost-chat-button {
          width: 56px;
          height: 56px;
        }
      }
    `;
  }

  // Create widget HTML
  function createWidget() {
    const container = document.createElement('div');
    container.className = 'raghost-widget-container';
    container.innerHTML = getWidgetHTML();
    document.body.appendChild(container);

    // Get element references
    chatButton = container.querySelector('.raghost-chat-button');
    chatWindow = container.querySelector('.raghost-chat-window');
    closeBtn = container.querySelector('.raghost-close-btn');
    messagesContainer = container.querySelector('.raghost-messages');
    input = container.querySelector('.raghost-input');
    sendBtn = container.querySelector('.raghost-send-btn');

    // Apply template styles
    applyTemplateStyles();

    // Apply custom config overrides (from WidgetCustomizer)
    applyCustomConfig();

    // Add welcome message
    setTimeout(() => {
      addMessage(config.welcomeMessage, 'bot');
    }, 500);
  }

  // Get widget HTML
  function getWidgetHTML() {
    return `
      <button class="raghost-chat-button" aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.29-3.86-.82l-.28-.15-2.9.49.49-2.9-.15-.28C4.29 14.68 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="12" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      </button>

      <div class="raghost-chat-window">
        <div class="raghost-header">
          <div class="raghost-header-info">
            <div class="raghost-avatar">🤖</div>
            <div class="raghost-bot-details">
              <p class="raghost-bot-name">${config.botName}</p>
              <p class="raghost-bot-status">Online • Ready to help</p>
            </div>
          </div>
          <div class="raghost-header-actions">
            <button class="raghost-header-btn raghost-close-btn" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="raghost-messages"></div>

        <div class="raghost-input-area">
          <div class="raghost-input-wrapper">
            <textarea 
              class="raghost-input" 
              placeholder="Type your message..." 
              rows="1"
              maxlength="1000"
            ></textarea>
          </div>
          <button class="raghost-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <div class="raghost-watermark">
          Powered by <a href="https://rag-host.vercel.app" target="_blank" rel="noopener">RAGhost</a>
        </div>
      </div>
    `;
  }

  // Apply custom config overrides on top of template styles
  function applyCustomConfig() {
    const container = chatButton ? chatButton.closest('.raghost-widget-container') : null;
    if (!container) return;

    const posMap = {
      'bottom-right': { bottom: '24px', right: '24px', top: '',     left: ''    },
      'bottom-left':  { bottom: '24px', left:  '24px', top: '',     right: ''   },
      'top-right':    { top:    '24px', right: '24px', bottom: '',  left: ''    },
      'top-left':     { top:    '24px', left:  '24px', bottom: '',  right: ''   },
    };
    const pos = posMap[config.position] || posMap['bottom-right'];
    Object.assign(container.style, pos);

    const isLeft = config.position.includes('left');
    const isTop  = config.position.includes('top');
    if (chatWindow) {
      chatWindow.style.bottom = isTop ? '' : '90px';
      chatWindow.style.top    = isTop ? '90px' : '';
      chatWindow.style[isLeft ? 'left' : 'right'] = '0';
      chatWindow.style[isLeft ? 'right' : 'left'] = '';
      chatWindow.style.transformOrigin = `${isTop ? 'top' : 'bottom'} ${isLeft ? 'left' : 'right'}`;
      chatWindow.style.width     = `${config.width}px`;
      chatWindow.style.maxWidth  = 'calc(100vw - 48px)';
      chatWindow.style.height    = `${config.height}px`;
      chatWindow.style.maxHeight = 'calc(100vh - 140px)';
      chatWindow.style.borderRadius = `${config.borderRadius}px`;
    }
    if (chatButton) {
      chatButton.style.width  = `${config.buttonSize}px`;
      chatButton.style.height = `${config.buttonSize}px`;
      if (config.buttonStyle === 'rounded') chatButton.style.borderRadius = '12px';
      else if (config.buttonStyle === 'square') chatButton.style.borderRadius = '0px';
      else chatButton.style.borderRadius = '50%';
    }
    if (config.fontFamily && config.fontFamily !== 'Inter') {
      container.style.fontFamily = `'${config.fontFamily}', sans-serif`;
    }
    const animMs = config.animationSpeed === 'fast' ? 150 : config.animationSpeed === 'slow' ? 600 : 300;
    const animStyle = document.createElement('style');
    animStyle.textContent = `.raghost-chat-window { transition: all ${animMs}ms cubic-bezier(0.4,0,0.2,1) !important; }`;
    document.head.appendChild(animStyle);

    if (config.primaryColor || config.secondaryColor || config.backgroundColor || config.textColor) {
      const pc = config.primaryColor    || '#667eea';
      const sc = config.secondaryColor  || '#764ba2';
      const bg = config.backgroundColor || '#ffffff';
      const tc = config.textColor       || '#1a1a2e';
      const r  = parseInt(pc.slice(1,3), 16) || 102;
      const g  = parseInt(pc.slice(3,5), 16) || 126;
      const b  = parseInt(pc.slice(5,7), 16) || 234;
      const colorStyle = document.createElement('style');
      colorStyle.textContent = `
        .raghost-chat-button { background: linear-gradient(135deg, ${pc}, ${sc}) !important; box-shadow: 0 8px 32px rgba(${r},${g},${b},0.4) !important; }
        .raghost-chat-window { background: ${bg} !important; }
        .raghost-header { background: linear-gradient(135deg, ${pc}, ${sc}) !important; color: white !important; }
        .raghost-avatar { background: rgba(255,255,255,0.2) !important; }
        .raghost-message.user .raghost-message-bubble { background: linear-gradient(135deg, ${pc}, ${sc}) !important; color: white !important; }
        .raghost-message.bot .raghost-message-bubble { background: rgba(${r},${g},${b},0.08) !important; color: ${tc} !important; }
        .raghost-send-btn { background: linear-gradient(135deg, ${pc}, ${sc}) !important; color: white !important; }
        .raghost-input { color: ${tc} !important; background: ${bg} !important; border: 2px solid rgba(${r},${g},${b},0.3) !important; }
        .raghost-input:focus { border-color: ${pc} !important; }
        .raghost-messages { background: ${bg} !important; }
        .raghost-input-area { background: ${bg} !important; border-top: 1px solid rgba(${r},${g},${b},0.15) !important; }
        .raghost-watermark { background: ${bg} !important; }
        .raghost-watermark a { color: ${pc} !important; }
        .raghost-header-btn { background: rgba(255,255,255,0.2) !important; color: white !important; }
        .raghost-header-btn:hover { background: rgba(255,255,255,0.35) !important; }
      `;
      document.head.appendChild(colorStyle);
    }
  }

  // Apply template-specific styles
  function applyTemplateStyles() {
    const templates = {
      'modern-gradient': getModernGradientStyles(),
      'glass-morphism': getGlassMorphismStyles(),
      'minimal-dark': getMinimalDarkStyles(),
      'neon-glow': getNeonGlowStyles(),
      'soft-light': getSoftLightStyles(),
      'corporate': getCorporateStyles(),
    };

    const templateStyle = templates[config.template] || templates['modern-gradient'];
    const style = document.createElement('style');
    style.textContent = templateStyle;
    document.head.appendChild(style);
  }

  // Template 1: Modern Gradient
  function getModernGradientStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      }

      .raghost-chat-window {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .raghost-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        color: white;
      }

      .raghost-avatar {
        background: rgba(255, 255, 255, 0.2);
      }

      .raghost-messages {
        background: rgba(255, 255, 255, 0.05);
      }

      .raghost-message.bot .raghost-message-avatar {
        background: rgba(255, 255, 255, 0.2);
      }

      .raghost-message.user .raghost-message-avatar {
        background: white;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        backdrop-filter: blur(10px);
      }

      .raghost-message.user .raghost-message-bubble {
        background: white;
        color: #667eea;
      }

      .raghost-input-area {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }

      .raghost-input {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        backdrop-filter: blur(10px);
      }

      .raghost-input::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      .raghost-send-btn {
        background: white;
        color: #667eea;
      }

      .raghost-send-btn:disabled {
        background: rgba(255, 255, 255, 0.3);
        color: white;
      }

      .raghost-header-btn {
        color: white;
        background: rgba(255, 255, 255, 0.25);
        border: 2px solid rgba(255, 255, 255, 0.4);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.6);
        transform: rotate(90deg) scale(1.1);
      }

      .raghost-watermark {
        color: rgba(255, 255, 255, 0.6);
        background: rgba(255, 255, 255, 0.05);
      }

      .raghost-watermark a {
        color: rgba(255, 255, 255, 0.8);
      }
    `;
  }

  // Template 2: Glass Morphism
  function getGlassMorphismStyles() {
    return `
      .raghost-chat-button {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
      }

      .raghost-chat-window {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      }

      .raghost-header {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .raghost-avatar {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .raghost-messages {
        background: transparent;
      }

      .raghost-message.bot .raghost-message-avatar {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .raghost-message.user .raghost-message-avatar {
        background: white;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .raghost-message.user .raghost-message-bubble {
        background: white;
        color: #1a1a1a;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .raghost-input-area {
        background: rgba(255, 255, 255, 0.1);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .raghost-input {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .raghost-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .raghost-send-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .raghost-header-btn {
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.35);
        border-color: rgba(255, 255, 255, 0.6);
        transform: rotate(90deg) scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .raghost-watermark {
        color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.05);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .raghost-watermark a {
        color: rgba(255, 255, 255, 0.7);
      }
    `;
  }

  // Template 3: Minimal Dark
  function getMinimalDarkStyles() {
    return `
      .raghost-chat-button {
        background: #1a1a1a;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        border: 1px solid #333;
      }

      .raghost-chat-window {
        background: #1a1a1a;
        border: 1px solid #333;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }

      .raghost-header {
        background: #222;
        color: white;
        border-bottom: 1px solid #333;
      }

      .raghost-avatar {
        background: #333;
      }

      .raghost-messages {
        background: #1a1a1a;
      }

      .raghost-message.bot .raghost-message-avatar {
        background: #333;
      }

      .raghost-message.user .raghost-message-avatar {
        background: #0ea5e9;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: #2a2a2a;
        color: #e5e5e5;
        border: 1px solid #333;
      }

      .raghost-message.user .raghost-message-bubble {
        background: #0ea5e9;
        color: white;
      }

      .raghost-input-area {
        background: #222;
        border-top: 1px solid #333;
      }

      .raghost-input {
        background: #2a2a2a;
        color: white;
        border: 1px solid #333;
      }

      .raghost-input::placeholder {
        color: #666;
      }

      .raghost-send-btn {
        background: #0ea5e9;
        color: white;
      }

      .raghost-send-btn:disabled {
        background: #2a2a2a;
        color: #666;
      }

      .raghost-header-btn {
        color: #ffffff;
        background: #333;
        border: 2px solid #555;
      }

      .raghost-header-btn:hover {
        background: #444;
        border-color: #777;
        transform: rotate(90deg) scale(1.1);
      }

      .raghost-watermark {
        color: #666;
        background: #222;
        border-top: 1px solid #333;
      }

      .raghost-watermark a {
        color: #0ea5e9;
      }
    `;
  }

  // Template 4: Neon Glow
  function getNeonGlowStyles() {
    return `
      .raghost-chat-button {
        background: #000;
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3);
        border: 2px solid #0ff;
        animation: neonPulse 2s infinite alternate;
      }

      @keyframes neonPulse {
        from {
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3);
        }
        to {
          box-shadow: 0 0 40px rgba(0, 255, 255, 0.8), 0 0 80px rgba(255, 0, 255, 0.5);
        }
      }

      .raghost-chat-window {
        background: #000;
        border: 2px solid #0ff;
        box-shadow: 0 0 40px rgba(0, 255, 255, 0.4), inset 0 0 60px rgba(0, 255, 255, 0.1);
      }

      .raghost-header {
        background: linear-gradient(135deg, #0ff 0%, #f0f 100%);
        color: #000;
        font-weight: 600;
      }

      .raghost-avatar {
        background: #000;
        border: 2px solid #0ff;
      }

      .raghost-messages {
        background: #000;
      }

      .raghost-message.bot .raghost-message-avatar {
        background: #000;
        border: 2px solid #0ff;
      }

      .raghost-message.user .raghost-message-avatar {
        background: #000;
        border: 2px solid #f0f;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: #000;
        color: #0ff;
        border: 1px solid #0ff;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
      }

      .raghost-message.user .raghost-message-bubble {
        background: #000;
        color: #f0f;
        border: 1px solid #f0f;
        box-shadow: 0 0 20px rgba(255, 0, 255, 0.2);
      }

      .raghost-input-area {
        background: #000;
        border-top: 2px solid #0ff;
      }

      .raghost-input {
        background: #000;
        color: #0ff;
        border: 1px solid #0ff;
        box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
      }

      .raghost-input::placeholder {
        color: rgba(0, 255, 255, 0.4);
      }

      .raghost-send-btn {
        background: #000;
        color: #f0f;
        border: 2px solid #f0f;
        box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
      }

      .raghost-send-btn:disabled {
        border-color: #333;
        color: #333;
        box-shadow: none;
      }

      .raghost-header-btn {
        color: #0ff;
        background: #000;
        border: 2px solid #0ff;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      }

      .raghost-header-btn:hover {
        background: #0ff;
        color: #000;
        border-color: #0ff;
        transform: rotate(90deg) scale(1.1);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
      }

      .raghost-watermark {
        color: rgba(0, 255, 255, 0.6);
        background: #000;
        border-top: 2px solid #0ff;
      }

      .raghost-watermark a {
        color: #f0f;
      }
    `;
  }

  // Template 5: Soft Light
  function getSoftLightStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        color: #667eea;
      }

      .raghost-chat-button svg {
        fill: #667eea;
      }

      .raghost-chat-window {
        background: #ffffff;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(0, 0, 0, 0.05);
      }

      .raghost-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .raghost-avatar {
        background: rgba(255, 255, 255, 0.2);
      }

      .raghost-messages {
        background: #f8f9fa;
      }

      .raghost-message.bot .raghost-message-avatar {
        background: #e8e8e8;
      }

      .raghost-message.user .raghost-message-avatar {
        background: #667eea;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: white;
        color: #333;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .raghost-message.user .raghost-message-bubble {
        background: #667eea;
        color: white;
      }

      .raghost-message-time {
        color: #999;
      }

      .raghost-input-area {
        background: white;
        border-top: 1px solid #e8e8e8;
      }

      .raghost-input {
        background: #f8f9fa;
        color: #333;
        border: 1px solid #e8e8e8;
      }

      .raghost-input::placeholder {
        color: #999;
      }

      .raghost-send-btn {
        background: #667eea;
        color: white;
      }

      .raghost-send-btn:disabled {
        background: #e8e8e8;
        color: #999;
      }

      .raghost-header-btn {
        color: white;
        background: rgba(255, 255, 255, 0.25);
        border: 2px solid rgba(255, 255, 255, 0.4);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.6);
        transform: rotate(90deg) scale(1.1);
      }

      .raghost-typing span {
        background: #667eea;
      }

      .raghost-watermark {
        color: #999;
        background: #f8f9fa;
        border-top: 1px solid #e8e8e8;
      }

      .raghost-watermark a {
        color: #667eea;
      }
    `;
  }

  // Template 6: Corporate
  function getCorporateStyles() {
    return `
      .raghost-chat-button {
        background: #2563eb;
        box-shadow: 0 4px 24px rgba(37, 99, 235, 0.3);
      }

      .raghost-chat-window {
        background: #ffffff;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        border: 1px solid #e5e7eb;
      }

      .raghost-header {
        background: #2563eb;
        color: white;
      }

      .raghost-avatar {
        background: white;
        color: #2563eb;
      }

      .raghost-messages {
        background: #f9fafb;
      }

      .raghost-message.bot .raghost-message-avatar {
        background: #dbeafe;
        color: #2563eb;
      }

      .raghost-message.user .raghost-message-avatar {
        background: #2563eb;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: white;
        color: #1f2937;
        border: 1px solid #e5e7eb;
      }

      .raghost-message.user .raghost-message-bubble {
        background: #2563eb;
        color: white;
      }

      .raghost-message-time {
        color: #6b7280;
      }

      .raghost-input-area {
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      .raghost-input {
        background: #f9fafb;
        color: #1f2937;
        border: 1px solid #e5e7eb;
      }

      .raghost-input::placeholder {
        color: #9ca3af;
      }

      .raghost-send-btn {
        background: #2563eb;
        color: white;
      }

      .raghost-send-btn:disabled {
        background: #e5e7eb;
        color: #9ca3af;
      }

      .raghost-header-btn {
        color: white;
        background: rgba(255, 255, 255, 0.25);
        border: 2px solid rgba(255, 255, 255, 0.4);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.6);
        transform: rotate(90deg) scale(1.1);
      }

      .raghost-typing span {
        background: #2563eb;
      }

      .raghost-watermark {
        color: #6b7280;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }

      .raghost-watermark a {
        color: #2563eb;
      }
    `;
  }

  // Attach event listeners
  function attachEventListeners() {
    chatButton.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', handleSendMessage);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    });
  }

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    chatButton.classList.toggle('open', isOpen);
    if (isOpen) {
      input.focus();
    }
  }

  // Close chat window
  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
    chatButton.classList.remove('open');
  }

  // Handle send message
  async function handleSendMessage() {
    const message = input.value.trim();
    if (!message || isTyping) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';
    input.style.height = 'auto';

    // Disable input
    isTyping = true;
    sendBtn.disabled = true;
    input.disabled = true;

    // Show typing indicator
    const typingId = showTyping();

    try {
      const response = await sendMessageToAPI(message);
      
      // Remove typing indicator
      removeTyping(typingId);

      if (response.success && response.data?.response) {
        addMessage(response.data.response, 'bot');
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
      }
    } catch (error) {
      console.error('Chat error:', error);
      removeTyping(typingId);
      addMessage('Sorry, I could not connect to the server. Please try again later.', 'bot');
    } finally {
      isTyping = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  // Send message to API
  async function sendMessageToAPI(message) {
    const response = await fetch(`${config.apiUrl}/api/chat/${config.botId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Add message to chat
  function addMessage(text, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `raghost-message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'raghost-message-avatar';
    avatar.textContent = type === 'user' ? '👤' : '🤖';

    const content = document.createElement('div');
    content.className = 'raghost-message-content';

    const bubble = document.createElement('div');
    bubble.className = 'raghost-message-bubble';
    bubble.innerHTML = formatMarkdown(text);

    const time = document.createElement('div');
    time.className = 'raghost-message-time';
    time.textContent = formatTime(new Date());

    content.appendChild(bubble);
    content.appendChild(time);

    messageEl.appendChild(avatar);
    messageEl.appendChild(content);

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
  }

  // Format markdown (simple implementation)
  function formatMarkdown(text) {
    // Escape HTML
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Lists (simple)
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return formatted;
  }

  // Show typing indicator
  function showTyping() {
    const id = Date.now();
    const messageEl = document.createElement('div');
    messageEl.className = 'raghost-message bot';
    messageEl.dataset.typingId = id;

    const avatar = document.createElement('div');
    avatar.className = 'raghost-message-avatar';
    avatar.textContent = '🤖';

    const content = document.createElement('div');
    content.className = 'raghost-message-content';

    const bubble = document.createElement('div');
    bubble.className = 'raghost-message-bubble';

    const typing = document.createElement('div');
    typing.className = 'raghost-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    bubble.appendChild(typing);
    content.appendChild(bubble);
    messageEl.appendChild(avatar);
    messageEl.appendChild(content);

    messagesContainer.appendChild(messageEl);
    scrollToBottom();

    return id;
  }

  // Remove typing indicator
  function removeTyping(id) {
    const typingEl = messagesContainer.querySelector(`[data-typing-id="${id}"]`);
    if (typingEl) {
      typingEl.remove();
    }
  }

  // Scroll to bottom
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Format time
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.RAGhostWidget = {
    open: () => {
      if (!isOpen) toggleChat();
    },
    close: closeChat,
    toggle: toggleChat,
    send: (text) => {
      input.value = text;
      handleSendMessage();
    },
    getSessionId: () => sessionId,
    resetSession: () => {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('raghost-session-id', sessionId);
      messagesContainer.innerHTML = '';
      setTimeout(() => addMessage(config.welcomeMessage, 'bot'), 300);
    }
  };
})();
