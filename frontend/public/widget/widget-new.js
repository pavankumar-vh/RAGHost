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
    primaryColor:   _rc.primaryColor   || null,
    secondaryColor: _rc.secondaryColor || null,
    backgroundColor:_rc.backgroundColor|| null,
    textColor:      _rc.textColor      || null,
    width:          _rc.width          || 400,
    height:         _rc.height         || 600,
    position:       _rc.position       || 'bottom-right',
    borderRadius:   _rc.borderRadius   != null ? _rc.borderRadius : 16,
    buttonSize:     _rc.buttonSize     || 64,
    buttonStyle:    _rc.buttonStyle    || 'circle',
    fontFamily:     _rc.fontFamily     || null,
    animationSpeed: _rc.animationSpeed || 'normal',
    // Extended theme overrides (v2 Widget Customizer)
    gradientAngle:     _rc.gradientAngle     != null ? _rc.gradientAngle : 135,
    userBubbleColor:   _rc.userBubbleColor   || null,
    botBubbleColor:    _rc.botBubbleColor    || null,
    botBubbleTextColor:_rc.botBubbleTextColor|| null,
    shadowIntensity:   _rc.shadowIntensity   != null ? _rc.shadowIntensity : 2,
    edgePadding:       _rc.edgePadding       || 24,
    bubbleRadius:      _rc.bubbleRadius      != null ? _rc.bubbleRadius : 16,
    messageSpacing:    _rc.messageSpacing    || 12,
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
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.05);
      }

      .raghost-header-btn:active {
        transform: scale(0.95);
      }

      .raghost-header-btn svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
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
            <<button class="raghost-header-btn raghost-close-btn" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
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

    // --- Position ---
    const _ep = `${config.edgePadding || 24}px`;
    const posMap = {
      'bottom-right': { bottom: _ep, right: _ep, top: '', left: '' },
      'bottom-left':  { bottom: _ep, left:  _ep, top: '', right: '' },
      'top-right':    { top:    _ep, right: _ep, bottom: '', left: '' },
      'top-left':     { top:    _ep, left:  _ep, bottom: '', right: '' },
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

      // --- Dimensions ---
      chatWindow.style.width     = `${config.width}px`;
      chatWindow.style.maxWidth  = 'calc(100vw - 48px)';
      chatWindow.style.height    = `${config.height}px`;
      chatWindow.style.maxHeight = 'calc(100vh - 140px)';

      // --- Border radius ---
      chatWindow.style.borderRadius = `${config.borderRadius}px`;
    }

    // --- Button ---
    if (chatButton) {
      chatButton.style.width  = `${config.buttonSize}px`;
      chatButton.style.height = `${config.buttonSize}px`;
      if (config.buttonStyle === 'rounded') chatButton.style.borderRadius = '12px';
      else if (config.buttonStyle === 'square') chatButton.style.borderRadius = '0px';
      else chatButton.style.borderRadius = '50%';
    }

    // --- Font family ---
    if (config.fontFamily && config.fontFamily !== 'Inter') {
      container.style.fontFamily = `'${config.fontFamily}', sans-serif`;
    }

    // --- Animation speed ---
    const animMs = config.animationSpeed === 'fast' ? 150 : config.animationSpeed === 'slow' ? 600 : 300;
    const animStyle = document.createElement('style');
    animStyle.textContent = `.raghost-chat-window { transition: all ${animMs}ms cubic-bezier(0.4,0,0.2,1) !important; }`;
    document.head.appendChild(animStyle);

    // --- Custom color + theme overrides ---
    if (config.primaryColor || config.secondaryColor || config.backgroundColor || config.textColor ||
        config.userBubbleColor || config.botBubbleColor || config.botBubbleTextColor) {
      const pc   = config.primaryColor      || '#667eea';
      const sc   = config.secondaryColor    || '#764ba2';
      const bg   = config.backgroundColor  || '#ffffff';
      const tc   = config.textColor        || '#1a1a2e';
      const ubc  = config.userBubbleColor  || null;   // user bubble bg (null = use gradient)
      const bbc  = config.botBubbleColor   || null;   // bot bubble bg
      const bbtc = config.botBubbleTextColor || tc;   // bot bubble text
      const ang  = config.gradientAngle    != null ? config.gradientAngle : 135;
      const br   = config.bubbleRadius     != null ? config.bubbleRadius : 16;
      const grad = `linear-gradient(${ang}deg, ${pc}, ${sc})`;
      const r  = parseInt(pc.slice(1,3), 16) || 102;
      const g  = parseInt(pc.slice(3,5), 16) || 126;
      const b  = parseInt(pc.slice(5,7), 16) || 234;

      // Shadow lookup
      const shadowMap = {
        0: 'none',
        1: '0 4px 16px rgba(0,0,0,0.10)',
        2: `0 8px 32px rgba(${r},${g},${b},0.35)`,
        3: `0 20px 60px rgba(${r},${g},${b},0.50)`,
      };
      const shadow = shadowMap[config.shadowIntensity != null ? config.shadowIntensity : 2] || shadowMap[2];

      // User bubble: use custom color if set, else gradient
      const userBubbleBg  = ubc ? ubc  : grad;
      const userBubbleTxt = ubc ? tc   : 'white';

      // Bot bubble: use custom color if set, else subtle tint
      const botBubbleBg  = bbc ? bbc : `rgba(${r},${g},${b},0.08)`;

      const colorStyle = document.createElement('style');
      colorStyle.textContent = `
        .raghost-chat-button {
          background: ${grad} !important;
          box-shadow: ${shadow} !important;
        }
        .raghost-chat-window {
          background: ${bg} !important;
          box-shadow: ${shadow} !important;
        }
        .raghost-header {
          background: ${grad} !important;
          color: white !important;
        }
        .raghost-avatar {
          background: rgba(255,255,255,0.2) !important;
        }
        .raghost-message.user .raghost-message-bubble {
          background: ${userBubbleBg} !important;
          color: ${userBubbleTxt} !important;
          border-radius: ${br}px ${br}px 4px ${br}px !important;
        }
        .raghost-message.bot .raghost-message-bubble {
          background: ${botBubbleBg} !important;
          color: ${bbtc} !important;
          border-radius: ${br}px ${br}px ${br}px 4px !important;
        }
        .raghost-send-btn {
          background: ${grad} !important;
          color: white !important;
        }
        .raghost-input {
          color: ${tc} !important;
          background: ${bg} !important;
          border: 2px solid rgba(${r},${g},${b},0.3) !important;
        }
        .raghost-input:focus {
          border-color: ${pc} !important;
        }
        .raghost-messages {
          background: ${bg} !important;
        }
        .raghost-input-area {
          background: ${bg} !important;
          border-top: 1px solid rgba(${r},${g},${b},0.15) !important;
        }
        .raghost-watermark {
          background: ${bg} !important;
        }
        .raghost-watermark a {
          color: ${pc} !important;
        }
        .raghost-header-btn {
          background: rgba(255,255,255,0.2) !important;
          color: white !important;
        }
        .raghost-header-btn:hover {
          background: rgba(255,255,255,0.35) !important;
        }
      `;
      document.head.appendChild(colorStyle);
    }
  }

  // Apply template-specific styles
  function applyTemplateStyles() {
    const templates = {
      // Original templates
      'modern-gradient':  getModernGradientStyles(),
      'glass-morphism':   getGlassMorphismStyles(),
      'minimal-dark':     getMinimalDarkStyles(),
      'neon-glow':        getNeonGlowStyles(),
      'soft-light':       getSoftLightStyles(),
      'corporate':        getCorporateStyles(),
      // WidgetTemplates aliases & new templates
      'glassmorphism':    getGlassMorphismStyles(),   // alias
      'dark-saas':        getMinimalDarkStyles(),     // alias
      'minimal':          getMinimalStyles(),
      'neumorphism':      getNeumorphismStyles(),
      'neo-brutalism':    getNeoBrutalismStyles(),
      'material':         getMaterialStyles(),
      'fluent':           getFluentStyles(),
      'retro-y2k':        getRetroY2kStyles(),
      'skeuomorphic':     getSkeuomorphicStyles(),
      'enterprise-dense': getEnterpriseDenseStyles(),
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
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
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
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.15);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.5);
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
        color: white;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
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
        color: #000;
        background: rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(0, 255, 255, 0.5);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.5);
        border-color: #0ff;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
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
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
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
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .raghost-header-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
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

  // Template 7: Minimal
  function getMinimalStyles() {
    return `
      .raghost-chat-button {
        background: #111;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        border: none;
      }
      .raghost-chat-window {
        background: #fff;
        border: 1px solid #e5e5e5;
        box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      }
      .raghost-header {
        background: #fff;
        color: #111;
        border-bottom: 1px solid #e5e5e5;
      }
      .raghost-avatar { background: #f0f0f0; }
      .raghost-messages { background: #fff; }
      .raghost-message.bot .raghost-message-bubble {
        background: #f5f5f5;
        color: #111;
        border: 1px solid #e5e5e5;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #111;
        color: #fff;
      }
      .raghost-input-area { background: #fff; border-top: 1px solid #e5e5e5; }
      .raghost-input { background: #f5f5f5; color: #111; border: 1px solid #ddd; }
      .raghost-input::placeholder { color: #999; }
      .raghost-send-btn { background: #111; color: #fff; }
      .raghost-header-btn { color: #111; background: #f5f5f5; border: 1px solid #ddd; }
      .raghost-header-btn:hover { background: #e5e5e5; }
      .raghost-watermark { background: #fff; color: #999; border-top: 1px solid #e5e5e5; }
      .raghost-watermark a { color: #555; }
    `;
  }

  // Template 8: Neumorphism
  function getNeumorphismStyles() {
    return `
      .raghost-chat-button {
        background: #e0e5ec;
        box-shadow: 6px 6px 14px #b8bec7, -6px -6px 14px #ffffff;
        border: none;
      }
      .raghost-chat-window {
        background: #e0e5ec;
        box-shadow: 10px 10px 30px #b8bec7, -10px -10px 30px #ffffff;
        border: none;
      }
      .raghost-header {
        background: #e0e5ec;
        color: #444;
        border-bottom: 1px solid #ccd1d9;
        box-shadow: 0 2px 8px #b8bec7;
      }
      .raghost-avatar {
        background: #e0e5ec;
        box-shadow: 3px 3px 8px #b8bec7, -3px -3px 8px #fff;
      }
      .raghost-messages { background: #e0e5ec; }
      .raghost-message.bot .raghost-message-bubble {
        background: #e0e5ec;
        color: #444;
        box-shadow: inset 3px 3px 8px #b8bec7, inset -3px -3px 8px #fff;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #e0e5ec;
        color: #333;
        box-shadow: 3px 3px 8px #b8bec7, -3px -3px 8px #fff;
      }
      .raghost-input-area { background: #e0e5ec; border-top: 1px solid #ccd1d9; }
      .raghost-input {
        background: #e0e5ec;
        color: #333;
        border: none;
        box-shadow: inset 4px 4px 10px #b8bec7, inset -4px -4px 10px #fff;
      }
      .raghost-input::placeholder { color: #999; }
      .raghost-send-btn {
        background: #e0e5ec;
        color: #555;
        box-shadow: 3px 3px 8px #b8bec7, -3px -3px 8px #fff;
      }
      .raghost-send-btn:hover { box-shadow: inset 3px 3px 8px #b8bec7, inset -3px -3px 8px #fff; }
      .raghost-header-btn { background: #e0e5ec; color: #555; border: none; box-shadow: 2px 2px 6px #b8bec7, -2px -2px 6px #fff; }
      .raghost-watermark { background: #e0e5ec; color: #888; }
    `;
  }

  // Template 9: Neo-Brutalism
  function getNeoBrutalismStyles() {
    return `
      .raghost-chat-button {
        background: #FFDD00;
        border: 3px solid #000;
        box-shadow: 4px 4px 0 #000;
        border-radius: 0 !important;
      }
      .raghost-chat-window {
        background: #fff;
        border: 3px solid #000;
        box-shadow: 6px 6px 0 #000;
        border-radius: 0 !important;
      }
      .raghost-header {
        background: #FFDD00;
        color: #000;
        border-bottom: 3px solid #000;
        font-weight: 900;
      }
      .raghost-avatar { background: #000; border-radius: 0 !important; }
      .raghost-messages { background: #fff; }
      .raghost-message.bot .raghost-message-bubble {
        background: #f0f0f0;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 2px 2px 0 #000;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #FFDD00;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 2px 2px 0 #000;
      }
      .raghost-input-area { background: #fff; border-top: 3px solid #000; }
      .raghost-input {
        background: #fff;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
      }
      .raghost-input::placeholder { color: #888; }
      .raghost-send-btn {
        background: #FFDD00;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 2px 2px 0 #000;
        font-weight: 900;
      }
      .raghost-header-btn { background: #fff; color: #000; border: 2px solid #000; border-radius: 0 !important; }
      .raghost-watermark { background: #f5f5f5; border-top: 2px solid #000; color: #000; }
    `;
  }

  // Template 10: Material Design
  function getMaterialStyles() {
    return `
      .raghost-chat-button {
        background: #1976d2;
        box-shadow: 0 6px 20px rgba(25,118,210,0.35);
      }
      .raghost-chat-window {
        background: #fff;
        box-shadow: 0 8px 30px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.1);
      }
      .raghost-header {
        background: #1976d2;
        color: #fff;
      }
      .raghost-avatar { background: rgba(255,255,255,0.2); }
      .raghost-messages { background: #fafafa; }
      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #212121;
        box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        border: none;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #1976d2;
        color: #fff;
      }
      .raghost-input-area { background: #fff; border-top: 1px solid #e0e0e0; }
      .raghost-input {
        background: #f5f5f5;
        color: #212121;
        border: none;
        border-bottom: 2px solid #1976d2;
        border-radius: 4px 4px 0 0 !important;
      }
      .raghost-input:focus { border-bottom-color: #1565c0; }
      .raghost-input::placeholder { color: #9e9e9e; }
      .raghost-send-btn { background: #1976d2; color: #fff; }
      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.15); border: none; }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.25); }
      .raghost-watermark { background: #fff; color: #9e9e9e; border-top: 1px solid #e0e0e0; }
      .raghost-watermark a { color: #1976d2; }
    `;
  }

  // Template 11: Fluent (Windows 11)
  function getFluentStyles() {
    return `
      .raghost-chat-button {
        background: rgba(0,103,184,0.9);
        backdrop-filter: blur(20px);
        box-shadow: 0 4px 16px rgba(0,103,184,0.3);
      }
      .raghost-chat-window {
        background: rgba(243,243,243,0.85);
        backdrop-filter: blur(30px);
        border: 1px solid rgba(255,255,255,0.6);
        box-shadow: 0 16px 48px rgba(0,0,0,0.14);
      }
      .raghost-header {
        background: rgba(0,103,184,0.88);
        backdrop-filter: blur(20px);
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      .raghost-avatar { background: rgba(255,255,255,0.25); }
      .raghost-messages { background: transparent; }
      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255,255,255,0.72);
        color: #1b1b1b;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.5);
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(0,103,184,0.82);
        color: #fff;
        backdrop-filter: blur(10px);
      }
      .raghost-input-area {
        background: rgba(255,255,255,0.6);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(0,0,0,0.08);
      }
      .raghost-input {
        background: rgba(255,255,255,0.7);
        color: #1b1b1b;
        border: 1px solid rgba(0,0,0,0.12);
        backdrop-filter: blur(10px);
      }
      .raghost-input::placeholder { color: rgba(0,0,0,0.4); }
      .raghost-send-btn { background: rgba(0,103,184,0.9); color: #fff; }
      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.28); }
      .raghost-watermark { background: rgba(255,255,255,0.5); color: #666; }
      .raghost-watermark a { color: #0067b8; }
    `;
  }

  // Template 12: Retro Y2K
  function getRetroY2kStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(135deg, #ff00cc, #00ffff);
        border: 2px solid #fff;
        box-shadow: 0 0 20px #ff00cc, 0 0 40px #00ffff;
      }
      .raghost-chat-window {
        background: #0a0a1a;
        border: 2px solid #00ffff;
        box-shadow: 0 0 30px rgba(0,255,255,0.3);
      }
      .raghost-header {
        background: linear-gradient(90deg, #ff00cc, #00ffff);
        color: #000;
        font-weight: 900;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .raghost-avatar { background: #ff00cc; border: 2px solid #00ffff; }
      .raghost-messages { background: #0a0a1a; }
      .raghost-message.bot .raghost-message-bubble {
        background: #111136;
        color: #00ffff;
        border: 1px solid #00ffff;
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(135deg, #ff00cc, #9900ff);
        color: #fff;
      }
      .raghost-input-area { background: #111136; border-top: 2px solid #ff00cc; }
      .raghost-input {
        background: #0a0a1a;
        color: #00ffff;
        border: 1px solid #00ffff;
      }
      .raghost-input::placeholder { color: rgba(0,255,255,0.4); }
      .raghost-send-btn {
        background: linear-gradient(135deg, #ff00cc, #00ffff);
        color: #000;
        font-weight: 900;
      }
      .raghost-header-btn { color: #000; background: rgba(255,255,255,0.2); border: 1px solid #fff; }
      .raghost-watermark { background: #111136; color: #00ffff; border-top: 1px solid #ff00cc; }
      .raghost-watermark a { color: #ff00cc; }
    `;
  }

  // Template 13: Skeuomorphic
  function getSkeuomorphicStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(145deg, #4a90d9, #2c6fad);
        box-shadow: 0 6px 0 #1a4a7a, 0 8px 16px rgba(0,0,0,0.3);
        border: 1px solid #1a4a7a;
      }
      .raghost-chat-window {
        background: linear-gradient(180deg, #f5f0e8 0%, #ede8dc 100%);
        border: 1px solid #c8b89a;
        box-shadow: 0 10px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
      }
      .raghost-header {
        background: linear-gradient(180deg, #6b9fd4 0%, #4a7fb5 100%);
        color: #fff;
        border-bottom: 2px solid #2c5f8a;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .raghost-avatar {
        background: linear-gradient(135deg, #e8e8e8, #d0d0d0);
        border: 1px solid #aaa;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
      }
      .raghost-messages { background: linear-gradient(180deg, #f5f0e8, #ede8dc); }
      .raghost-message.bot .raghost-message-bubble {
        background: linear-gradient(180deg, #fff, #f0ebe0);
        color: #333;
        border: 1px solid #c8b89a;
        box-shadow: 0 2px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(180deg, #5a9fd4, #3d7ab5);
        color: #fff;
        border: 1px solid #2c5f8a;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
      }
      .raghost-input-area {
        background: linear-gradient(180deg, #e8e2d6, #ddd5c5);
        border-top: 2px solid #c8b89a;
      }
      .raghost-input {
        background: linear-gradient(180deg, #fff, #f8f5ee);
        color: #333;
        border: 1px solid #b8a888;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.12);
      }
      .raghost-input::placeholder { color: #998877; }
      .raghost-send-btn {
        background: linear-gradient(180deg, #6bb0e8, #4a90c8);
        color: #fff;
        border: 1px solid #2c6fa0;
        box-shadow: 0 3px 0 #1a4a78, 0 4px 8px rgba(0,0,0,0.2);
      }
      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); }
      .raghost-watermark { background: #ede8dc; color: #8a7a66; border-top: 1px solid #c8b89a; }
      .raghost-watermark a { color: #4a7fb5; }
    `;
  }

  // Template 14: Enterprise Dense
  function getEnterpriseDenseStyles() {
    return `
      .raghost-chat-button {
        background: #1e3a5f;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        border-radius: 4px !important;
      }
      .raghost-chat-window {
        background: #fff;
        border: 1px solid #d0d7de;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        border-radius: 4px !important;
      }
      .raghost-header {
        background: #1e3a5f;
        color: #fff;
        padding: 8px 12px !important;
        border-radius: 4px 4px 0 0 !important;
      }
      .raghost-avatar { background: rgba(255,255,255,0.2); width: 28px !important; height: 28px !important; }
      .raghost-messages { background: #f6f8fa; }
      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #24292f;
        border: 1px solid #d0d7de;
        font-size: 13px !important;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #1e3a5f;
        color: #fff;
        font-size: 13px !important;
      }
      .raghost-input-area { background: #fff; border-top: 1px solid #d0d7de; padding: 8px !important; }
      .raghost-input {
        background: #fff;
        color: #24292f;
        border: 1px solid #d0d7de;
        border-radius: 4px !important;
        font-size: 13px !important;
      }
      .raghost-input:focus { border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.15); }
      .raghost-input::placeholder { color: #6e7781; }
      .raghost-send-btn { background: #1e3a5f; color: #fff; border-radius: 4px !important; }
      .raghost-send-btn:hover { background: #253f65; }
      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); }
      .raghost-watermark { background: #f6f8fa; color: #6e7781; border-top: 1px solid #d0d7de; }
      .raghost-watermark a { color: #1e3a5f; }
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
