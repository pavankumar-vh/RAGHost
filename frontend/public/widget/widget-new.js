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
            <button class="raghost-header-btn raghost-close-btn" aria-label="Close">
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
      @keyframes rh-gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes rh-pulse-ring {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.5); opacity: 0; }
      }

      .raghost-chat-button {
        background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
        background-size: 200% 200%;
        animation: rh-gradientShift 4s ease infinite;
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.5), 0 0 0 0 rgba(99,102,241,0.4);
        border: none;
      }

      .raghost-chat-window {
        background: #0f0e17;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.3);
        border: none;
        overflow: hidden;
      }
      .raghost-chat-window::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(236,72,153,0.08), transparent 60%);
        pointer-events: none;
        z-index: 0;
      }

      .raghost-header {
        background: linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85));
        backdrop-filter: blur(20px);
        color: white;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        position: relative;
        z-index: 1;
      }

      .raghost-avatar {
        background: rgba(255,255,255,0.15);
        border: 2px solid rgba(255,255,255,0.3);
        box-shadow: 0 0 16px rgba(99,102,241,0.5);
      }

      .raghost-messages {
        background: transparent;
        position: relative;
        z-index: 1;
      }

      .raghost-message.bot .raghost-message-avatar {
        background: rgba(99,102,241,0.3);
        border: 1px solid rgba(99,102,241,0.5);
      }
      .raghost-message.user .raghost-message-avatar {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
      }

      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255,255,255,0.06);
        color: #e8e4ff;
        border: 1px solid rgba(99,102,241,0.25);
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        box-shadow: 0 4px 20px rgba(99,102,241,0.4);
      }

      .raghost-input-area {
        background: rgba(15,14,23,0.95);
        border-top: 1px solid rgba(99,102,241,0.25);
        backdrop-filter: blur(20px);
        position: relative;
        z-index: 1;
      }
      .raghost-input {
        background: rgba(99,102,241,0.1);
        color: #e8e4ff;
        border: 1px solid rgba(99,102,241,0.3);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
      }
      .raghost-input::placeholder { color: rgba(232,228,255,0.4); }

      .raghost-send-btn {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        box-shadow: 0 4px 16px rgba(99,102,241,0.4);
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .raghost-send-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(99,102,241,0.6); }
      .raghost-send-btn:disabled { background: rgba(99,102,241,0.2); box-shadow: none; }

      .raghost-header-btn {
        color: white;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        transition: background 0.2s;
      }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.22); }

      .raghost-typing span { background: #8b5cf6; }

      .raghost-watermark {
        color: rgba(232,228,255,0.4);
        background: rgba(15,14,23,0.9);
        border-top: 1px solid rgba(99,102,241,0.15);
        position: relative;
        z-index: 1;
      }
      .raghost-watermark a { color: #8b5cf6; }
    `;
  }

  // Template 2: Glass Morphism
  function getGlassMorphismStyles() {
    return `
      @keyframes rh-aurora {
        0%, 100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(20px,-15px) scale(1.05); }
        66% { transform: translate(-10px,20px) scale(0.97); }
      }

      .raghost-chat-button {
        background: rgba(255,255,255,0.18);
        backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.35);
        box-shadow: 0 8px 32px rgba(31,38,135,0.28), inset 0 1px 0 rgba(255,255,255,0.4);
      }

      .raghost-chat-window {
        background: rgba(15,12,40,0.55);
        backdrop-filter: blur(40px) saturate(200%);
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
        overflow: hidden;
      }
      .raghost-chat-window::before {
        content: '';
        position: absolute;
        width: 320px; height: 320px;
        background: radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%);
        top: -80px; right: -80px;
        border-radius: 50%;
        animation: rh-aurora 8s ease-in-out infinite;
        pointer-events: none;
        z-index: 0;
      }
      .raghost-chat-window::after {
        content: '';
        position: absolute;
        width: 260px; height: 260px;
        background: radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%);
        bottom: 60px; left: -60px;
        border-radius: 50%;
        animation: rh-aurora 10s ease-in-out infinite reverse;
        pointer-events: none;
        z-index: 0;
      }

      .raghost-header {
        background: rgba(255,255,255,0.07);
        backdrop-filter: blur(20px);
        color: white;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        position: relative; z-index: 1;
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.3);
        box-shadow: 0 4px 16px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
      }
      .raghost-messages { background: transparent; position: relative; z-index: 1; }

      .raghost-message.bot .raghost-message-avatar {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .raghost-message.user .raghost-message-avatar {
        background: rgba(139,92,246,0.5);
        border: 1px solid rgba(255,255,255,0.3);
      }
      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.92);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(255,255,255,0.92);
        color: #1a1030;
        border: 1px solid rgba(255,255,255,0.4);
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }

      .raghost-input-area {
        background: rgba(255,255,255,0.04);
        border-top: 1px solid rgba(255,255,255,0.08);
        backdrop-filter: blur(20px);
        position: relative; z-index: 1;
      }
      .raghost-input {
        background: rgba(255,255,255,0.08);
        color: white;
        border: 1px solid rgba(255,255,255,0.16);
        backdrop-filter: blur(10px);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus {
        border-color: rgba(139,92,246,0.6);
        box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
      }
      .raghost-input::placeholder { color: rgba(255,255,255,0.35); }

      .raghost-send-btn {
        background: rgba(255,255,255,0.15);
        color: white;
        border: 1px solid rgba(255,255,255,0.25);
        backdrop-filter: blur(10px);
        transition: background 0.2s, border-color 0.2s;
      }
      .raghost-send-btn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.45); }

      .raghost-header-btn {
        color: white;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.18);
        transition: background 0.2s;
      }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.35); }

      .raghost-watermark {
        color: rgba(255,255,255,0.38);
        background: rgba(255,255,255,0.03);
        border-top: 1px solid rgba(255,255,255,0.07);
        position: relative; z-index: 1;
      }
      .raghost-watermark a { color: rgba(139,92,246,0.8); }
    `;
  }

  // Template 3: Minimal Dark
  function getMinimalDarkStyles() {
    return `
      .raghost-chat-button {
        background: #09090b;
        box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.1);
        transition: box-shadow 0.2s;
      }
      .raghost-chat-button:hover {
        box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.15);
      }

      .raghost-chat-window {
        background: #09090b;
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
      }

      .raghost-header {
        background: #111113;
        color: #fafafa;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .raghost-avatar {
        background: #27272a;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .raghost-messages { background: #09090b; }
      .raghost-message-time { color: #52525b; }

      .raghost-message.bot .raghost-message-avatar {
        background: #18181b;
        border: 1px solid rgba(255,255,255,0.08);
      }
      .raghost-message.user .raghost-message-avatar {
        background: #3f3f46;
      }
      .raghost-message.bot .raghost-message-bubble {
        background: #18181b;
        color: #d4d4d8;
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .raghost-message.user .raghost-message-bubble {
        background: #27272a;
        color: #fafafa;
        border: 1px solid rgba(255,255,255,0.1);
      }

      .raghost-input-area {
        background: #111113;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .raghost-input {
        background: #18181b;
        color: #fafafa;
        border: 1px solid rgba(255,255,255,0.1);
        transition: border-color 0.2s;
      }
      .raghost-input:focus { border-color: rgba(255,255,255,0.3); }
      .raghost-input::placeholder { color: #52525b; }

      .raghost-send-btn {
        background: #fafafa;
        color: #09090b;
        transition: background 0.2s;
      }
      .raghost-send-btn:hover { background: #e4e4e7; }
      .raghost-send-btn:disabled { background: #27272a; color: #52525b; }

      .raghost-header-btn {
        color: #a1a1aa;
        background: transparent;
        border: 1px solid rgba(255,255,255,0.1);
        transition: color 0.2s, background 0.2s;
      }
      .raghost-header-btn:hover { color: #fafafa; background: rgba(255,255,255,0.08); }

      .raghost-typing span { background: #71717a; }

      .raghost-watermark {
        color: #3f3f46;
        background: #111113;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .raghost-watermark a { color: #71717a; }
    `;
  }

  // Template 4: Neon Glow
  function getNeonGlowStyles() {
    return `
      @keyframes rh-neonFlicker {
        0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
          box-shadow: 0 0 20px #0ff, 0 0 40px #0ff, 0 0 80px #0ff;
        }
        20%, 24%, 55% { box-shadow: none; }
      }
      @keyframes rh-scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }

      .raghost-chat-button {
        background: #000014;
        box-shadow: 0 0 20px rgba(0,255,255,0.6), 0 0 60px rgba(0,255,255,0.2), inset 0 0 20px rgba(0,255,255,0.05);
        border: 2px solid #0ff;
        animation: rh-neonFlicker 6s infinite;
      }

      .raghost-chat-window {
        background: #000014;
        border: 1px solid #0ff;
        box-shadow: 0 0 40px rgba(0,255,255,0.2), 0 0 80px rgba(0,255,255,0.1), inset 0 0 40px rgba(0,255,255,0.03);
        overflow: hidden;
      }
      .raghost-chat-window::before {
        content: '';
        position: absolute;
        left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(0,255,255,0.6), transparent);
        animation: rh-scanline 4s linear infinite;
        pointer-events: none;
        z-index: 10;
        opacity: 0.4;
      }

      .raghost-header {
        background: linear-gradient(180deg, rgba(0,255,255,0.15) 0%, rgba(0,255,255,0.05) 100%);
        color: #0ff;
        border-bottom: 1px solid rgba(0,255,255,0.4);
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        text-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
      }
      .raghost-avatar {
        background: #000814;
        border: 2px solid #0ff;
        box-shadow: 0 0 12px rgba(0,255,255,0.5);
      }
      .raghost-messages { background: #000014; }
      .raghost-message-time { color: rgba(0,255,255,0.35); }

      .raghost-message.bot .raghost-message-avatar {
        background: #000814;
        border: 1px solid rgba(0,255,255,0.5);
        box-shadow: 0 0 8px rgba(0,255,255,0.3);
      }
      .raghost-message.user .raghost-message-avatar {
        background: #000814;
        border: 1px solid rgba(255,0,255,0.6);
        box-shadow: 0 0 8px rgba(255,0,255,0.3);
      }
      .raghost-message.bot .raghost-message-bubble {
        background: rgba(0,255,255,0.04);
        color: #0ff;
        border: 1px solid rgba(0,255,255,0.3);
        box-shadow: 0 0 16px rgba(0,255,255,0.12), inset 0 0 16px rgba(0,255,255,0.04);
        text-shadow: 0 0 6px rgba(0,255,255,0.3);
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(255,0,255,0.06);
        color: #f0f;
        border: 1px solid rgba(255,0,255,0.35);
        box-shadow: 0 0 16px rgba(255,0,255,0.12);
        text-shadow: 0 0 6px rgba(255,0,255,0.3);
      }

      .raghost-input-area {
        background: rgba(0,0,20,0.9);
        border-top: 1px solid rgba(0,255,255,0.3);
      }
      .raghost-input {
        background: rgba(0,255,255,0.04);
        color: #0ff;
        border: 1px solid rgba(0,255,255,0.3);
        box-shadow: inset 0 0 12px rgba(0,255,255,0.05);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus {
        border-color: #0ff;
        box-shadow: 0 0 0 2px rgba(0,255,255,0.2), inset 0 0 12px rgba(0,255,255,0.08);
      }
      .raghost-input::placeholder { color: rgba(0,255,255,0.3); }

      .raghost-send-btn {
        background: rgba(255,0,255,0.08);
        color: #f0f;
        border: 1px solid rgba(255,0,255,0.5);
        box-shadow: 0 0 12px rgba(255,0,255,0.2);
        transition: box-shadow 0.2s;
      }
      .raghost-send-btn:hover { box-shadow: 0 0 20px rgba(255,0,255,0.5), 0 0 40px rgba(255,0,255,0.2); }
      .raghost-send-btn:disabled { border-color: #1a1a2e; color: #1a1a2e; box-shadow: none; }

      .raghost-header-btn {
        color: #0ff;
        background: rgba(0,255,255,0.06);
        border: 1px solid rgba(0,255,255,0.3);
        transition: box-shadow 0.2s;
      }
      .raghost-header-btn:hover { background: rgba(0,255,255,0.12); box-shadow: 0 0 12px rgba(0,255,255,0.4); }

      .raghost-typing span { background: #0ff; box-shadow: 0 0 6px #0ff; }

      .raghost-watermark {
        color: rgba(0,255,255,0.3);
        background: rgba(0,0,20,0.9);
        border-top: 1px solid rgba(0,255,255,0.15);
      }
      .raghost-watermark a { color: rgba(255,0,255,0.7); }
    `;
  }

  // Template 5: Soft Light
  function getSoftLightStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(135deg, #e879f9, #a855f7, #6366f1);
        box-shadow: 0 8px 28px rgba(168,85,247,0.45);
        border: none;
        transition: box-shadow 0.3s;
      }
      .raghost-chat-button:hover {
        box-shadow: 0 12px 36px rgba(168,85,247,0.6);
      }

      .raghost-chat-window {
        background: #ffffff;
        box-shadow: 0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
        border: none;
      }

      .raghost-header {
        background: linear-gradient(135deg, #e879f9 0%, #a855f7 50%, #6366f1 100%);
        color: white;
        border-bottom: none;
        box-shadow: 0 4px 20px rgba(168,85,247,0.3);
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.4);
        box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      }
      .raghost-messages { background: #f9f7ff; }
      .raghost-message-time { color: #a78bfa; }

      .raghost-message.bot .raghost-message-avatar {
        background: #ede9fe;
        border: 1px solid #ddd6fe;
      }
      .raghost-message.user .raghost-message-avatar {
        background: linear-gradient(135deg, #a855f7, #6366f1);
      }
      .raghost-message.bot .raghost-message-bubble {
        background: white;
        color: #1e1b4b;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #ede9fe;
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(135deg, #a855f7, #6366f1);
        color: white;
        box-shadow: 0 4px 16px rgba(168,85,247,0.35);
      }

      .raghost-input-area {
        background: white;
        border-top: 1px solid #ede9fe;
      }
      .raghost-input {
        background: #f5f3ff;
        color: #1e1b4b;
        border: 1px solid #ddd6fe;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus {
        border-color: #a855f7;
        box-shadow: 0 0 0 3px rgba(168,85,247,0.15);
      }
      .raghost-input::placeholder { color: #c4b5fd; }

      .raghost-send-btn {
        background: linear-gradient(135deg, #a855f7, #6366f1);
        color: white;
        box-shadow: 0 4px 14px rgba(168,85,247,0.4);
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .raghost-send-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(168,85,247,0.55); }
      .raghost-send-btn:disabled { background: #ede9fe; color: #c4b5fd; box-shadow: none; }

      .raghost-header-btn {
        color: white;
        background: rgba(255,255,255,0.18);
        border: 1px solid rgba(255,255,255,0.3);
        transition: background 0.2s;
      }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.32); }

      .raghost-typing span { background: #a855f7; }

      .raghost-watermark {
        color: #c4b5fd;
        background: #f9f7ff;
        border-top: 1px solid #ede9fe;
      }
      .raghost-watermark a { color: #a855f7; }
    `;
  }

  // Template 6: Corporate
  function getCorporateStyles() {
    return `
      .raghost-chat-button {
        background: #0f172a;
        box-shadow: 0 4px 20px rgba(15,23,42,0.4);
        border: 1px solid rgba(255,255,255,0.08);
        transition: box-shadow 0.2s;
      }
      .raghost-chat-button:hover { box-shadow: 0 8px 28px rgba(15,23,42,0.5); }

      .raghost-chat-window {
        background: #ffffff;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
        border: none;
      }

      .raghost-header {
        background: #0f172a;
        color: white;
        border-bottom: none;
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.2);
      }
      .raghost-messages { background: #f8fafc; }
      .raghost-message-time { color: #94a3b8; }

      .raghost-message.bot .raghost-message-avatar {
        background: #e2e8f0;
        border: 1px solid #cbd5e1;
      }
      .raghost-message.user .raghost-message-avatar {
        background: #0f172a;
      }
      .raghost-message.bot .raghost-message-bubble {
        background: white;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      }
      .raghost-message.user .raghost-message-bubble {
        background: #0f172a;
        color: white;
      }

      .raghost-input-area {
        background: white;
        border-top: 1px solid #e2e8f0;
      }
      .raghost-input {
        background: #f8fafc;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus {
        border-color: #0f172a;
        box-shadow: 0 0 0 3px rgba(15,23,42,0.1);
      }
      .raghost-input::placeholder { color: #94a3b8; }

      .raghost-send-btn {
        background: #0f172a;
        color: white;
        transition: background 0.2s;
      }
      .raghost-send-btn:hover { background: #1e293b; }
      .raghost-send-btn:disabled { background: #e2e8f0; color: #94a3b8; }

      .raghost-header-btn {
        color: white;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.15);
        transition: background 0.2s;
      }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.2); }

      .raghost-typing span { background: #64748b; }

      .raghost-watermark {
        color: #94a3b8;
        background: white;
        border-top: 1px solid #e2e8f0;
      }
      .raghost-watermark a { color: #0f172a; }
    `;
  }

  // Template 7: Minimal
  function getMinimalStyles() {
    return `
      .raghost-chat-button {
        background: white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08);
        border: none;
        transition: box-shadow 0.2s, transform 0.15s;
      }
      .raghost-chat-button:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.18); transform: translateY(-1px); }
      .raghost-chat-button svg { stroke: #111; fill: none; }

      .raghost-chat-window {
        background: #fff;
        border: 1px solid rgba(0,0,0,0.1);
        box-shadow: 0 8px 40px rgba(0,0,0,0.1);
      }
      .raghost-header {
        background: #fff;
        color: #111;
        border-bottom: 1px solid rgba(0,0,0,0.08);
      }
      .raghost-avatar {
        background: #f4f4f5;
        border: 1px solid rgba(0,0,0,0.08);
      }
      .raghost-messages { background: #fafafa; }
      .raghost-message-time { color: #a1a1aa; }

      .raghost-message.bot .raghost-message-avatar { background: #f4f4f5; }
      .raghost-message.user .raghost-message-avatar { background: #18181b; }

      .raghost-message.bot .raghost-message-bubble {
        background: white;
        color: #18181b;
        border: 1px solid rgba(0,0,0,0.08);
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      }
      .raghost-message.user .raghost-message-bubble {
        background: #18181b;
        color: white;
      }

      .raghost-input-area { background: white; border-top: 1px solid rgba(0,0,0,0.07); }
      .raghost-input {
        background: #f4f4f5;
        color: #111;
        border: 1px solid rgba(0,0,0,0.1);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus { border-color: #71717a; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
      .raghost-input::placeholder { color: #a1a1aa; }

      .raghost-send-btn {
        background: #18181b;
        color: white;
        transition: background 0.2s;
      }
      .raghost-send-btn:hover { background: #27272a; }
      .raghost-send-btn:disabled { background: #e4e4e7; color: #a1a1aa; }

      .raghost-header-btn { color: #71717a; background: transparent; border: 1px solid rgba(0,0,0,0.1); transition: color 0.2s, background 0.2s; }
      .raghost-header-btn:hover { color: #111; background: #f4f4f5; }

      .raghost-typing span { background: #a1a1aa; }

      .raghost-watermark { background: white; color: #d4d4d8; border-top: 1px solid rgba(0,0,0,0.06); }
      .raghost-watermark a { color: #71717a; }
    `;
  }

  // Template 8: Neumorphism
  function getNeumorphismStyles() {
    return `
      .raghost-chat-button {
        background: #dde1e7;
        box-shadow: 8px 8px 20px #b8bec7, -8px -8px 20px #ffffff;
        border: none;
        transition: box-shadow 0.2s;
      }
      .raghost-chat-button:hover {
        box-shadow: 4px 4px 12px #b8bec7, -4px -4px 12px #ffffff, inset 2px 2px 6px #b8bec7, inset -2px -2px 6px #fff;
      }

      .raghost-chat-window {
        background: #dde1e7;
        box-shadow: 16px 16px 40px #b2b8c1, -16px -16px 40px #ffffff;
        border: none;
      }
      .raghost-header {
        background: #dde1e7;
        color: #4a5568;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        font-weight: 600;
        letter-spacing: 0.03em;
      }
      .raghost-avatar {
        background: #dde1e7;
        box-shadow: 4px 4px 10px #b8bec7, -4px -4px 10px #fff;
        border: none;
      }
      .raghost-messages { background: #e4e8ed; }
      .raghost-message-time { color: #94a3b8; }

      .raghost-message.bot .raghost-message-avatar {
        background: #dde1e7;
        box-shadow: 3px 3px 8px #b8bec7, -3px -3px 8px #fff;
      }
      .raghost-message.user .raghost-message-avatar {
        background: #dde1e7;
        box-shadow: inset 3px 3px 8px #b8bec7, inset -3px -3px 8px #fff;
      }
      .raghost-message.bot .raghost-message-bubble {
        background: #e8ecf1;
        color: #374151;
        box-shadow: 4px 4px 10px #b8bec7, -4px -4px 10px #fff;
        border: none;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #dde1e7;
        color: #374151;
        box-shadow: inset 4px 4px 10px #b8bec7, inset -4px -4px 10px #fff;
        border: none;
      }

      .raghost-input-area { background: #dde1e7; border-top: 1px solid rgba(0,0,0,0.06); }
      .raghost-input {
        background: #dde1e7;
        color: #374151;
        border: none;
        box-shadow: inset 5px 5px 12px #b8bec7, inset -5px -5px 12px #fff;
        transition: box-shadow 0.2s;
      }
      .raghost-input:focus { box-shadow: inset 6px 6px 14px #b0b6bf, inset -6px -6px 14px #fff; }
      .raghost-input::placeholder { color: #94a3b8; }

      .raghost-send-btn {
        background: #dde1e7;
        color: #4a5568;
        box-shadow: 4px 4px 10px #b8bec7, -4px -4px 10px #fff;
        border: none;
        transition: box-shadow 0.15s;
      }
      .raghost-send-btn:hover { box-shadow: inset 4px 4px 10px #b8bec7, inset -4px -4px 10px #fff; }
      .raghost-send-btn:disabled { color: #94a3b8; }

      .raghost-header-btn {
        background: #dde1e7;
        color: #4a5568;
        border: none;
        box-shadow: 3px 3px 7px #b8bec7, -3px -3px 7px #fff;
        transition: box-shadow 0.15s;
      }
      .raghost-header-btn:hover { box-shadow: inset 3px 3px 7px #b8bec7, inset -3px -3px 7px #fff; }

      .raghost-typing span { background: #94a3b8; }
      .raghost-watermark { background: #dde1e7; color: #94a3b8; border-top: 1px solid rgba(0,0,0,0.05); }
      .raghost-watermark a { color: #64748b; }
    `;
  }

  // Template 9: Neo-Brutalism
  function getNeoBrutalismStyles() {
    return `
      .raghost-chat-button {
        background: #FF3D00;
        border: 3px solid #000;
        box-shadow: 5px 5px 0 #000;
        border-radius: 0 !important;
        transition: transform 0.1s, box-shadow 0.1s;
      }
      .raghost-chat-button:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #000; }
      .raghost-chat-button:active { transform: translate(2px,2px); box-shadow: 3px 3px 0 #000; }

      .raghost-chat-window {
        background: #FFFBF0;
        border: 3px solid #000;
        box-shadow: 8px 8px 0 #000;
        border-radius: 0 !important;
      }

      .raghost-header {
        background: #FF3D00;
        color: #000;
        border-bottom: 3px solid #000;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .raghost-avatar {
        background: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
      }
      .raghost-messages { background: #FFFBF0; }
      .raghost-message-time { color: #888; font-weight: 700; }

      .raghost-message.bot .raghost-message-avatar {
        background: #000;
        border-radius: 0 !important;
      }
      .raghost-message.user .raghost-message-avatar {
        background: #FF3D00;
        border: 2px solid #000;
        border-radius: 0 !important;
      }
      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 3px 3px 0 #000;
        font-weight: 500;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #FFEB3B;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 3px 3px 0 #000;
        font-weight: 700;
      }

      .raghost-input-area { background: #FFFBF0; border-top: 3px solid #000; }
      .raghost-input {
        background: #fff;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        font-weight: 600;
        transition: box-shadow 0.1s;
      }
      .raghost-input:focus { box-shadow: 3px 3px 0 #000; }
      .raghost-input::placeholder { color: #999; font-weight: 400; }

      .raghost-send-btn {
        background: #FF3D00;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 3px 3px 0 #000;
        font-weight: 900;
        transition: transform 0.1s, box-shadow 0.1s;
      }
      .raghost-send-btn:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #000; }
      .raghost-send-btn:active { transform: translate(1px,1px); box-shadow: 2px 2px 0 #000; }
      .raghost-send-btn:disabled { background: #ddd; box-shadow: 2px 2px 0 #999; }

      .raghost-header-btn { background: #000; color: #FF3D00; border: 2px solid #000; border-radius: 0 !important; font-weight: 900; }
      .raghost-header-btn:hover { background: #222; }

      .raghost-typing span { background: #000; }

      .raghost-watermark { background: #fff8e7; border-top: 2px solid #000; color: #555; font-weight: 700; }
      .raghost-watermark a { color: #FF3D00; }
    `;
  }

  // Template 10: Material Design
  function getMaterialStyles() {
    return `
      @keyframes rh-ripple {
        0% { transform: scale(0); opacity: 0.4; }
        100% { transform: scale(4); opacity: 0; }
      }

      .raghost-chat-button {
        background: #6200ea;
        box-shadow: 0 6px 20px rgba(98,0,234,0.4), 0 3px 8px rgba(0,0,0,0.12);
        border: none;
        transition: box-shadow 0.28s;
      }
      .raghost-chat-button:hover {
        box-shadow: 0 8px 28px rgba(98,0,234,0.5), 0 4px 12px rgba(0,0,0,0.15);
      }

      .raghost-chat-window {
        background: #fff;
        box-shadow: 0 24px 48px rgba(0,0,0,0.16), 0 6px 16px rgba(0,0,0,0.08);
        border: none;
      }

      .raghost-header {
        background: #6200ea;
        color: #fff;
        box-shadow: 0 4px 12px rgba(98,0,234,0.3);
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.18);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .raghost-messages { background: #f3e5f5; }
      .raghost-message-time { color: #9e9e9e; font-size: 11px !important; }

      .raghost-message.bot .raghost-message-avatar {
        background: #ede7f6;
        border: 1px solid #d1c4e9;
      }
      .raghost-message.user .raghost-message-avatar { background: #6200ea; }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #212121;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
        border: none;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #6200ea;
        color: #fff;
        box-shadow: 0 4px 12px rgba(98,0,234,0.35);
      }

      .raghost-input-area { background: #fff; border-top: 1px solid #e0e0e0; }
      .raghost-input {
        background: #fff;
        color: #212121;
        border: none;
        border-bottom: 2px solid #9e9e9e;
        border-radius: 4px 4px 0 0 !important;
        transition: border-bottom-color 0.2s;
      }
      .raghost-input:focus { border-bottom-color: #6200ea; }
      .raghost-input::placeholder { color: #bdbdbd; }

      .raghost-send-btn {
        background: #6200ea;
        color: #fff;
        box-shadow: 0 4px 12px rgba(98,0,234,0.35);
        transition: box-shadow 0.2s, background 0.2s;
      }
      .raghost-send-btn:hover { background: #7c4dff; box-shadow: 0 6px 16px rgba(124,77,255,0.45); }
      .raghost-send-btn:disabled { background: #e0e0e0; color: #9e9e9e; box-shadow: none; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.12); border: none; transition: background 0.2s; }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.22); }

      .raghost-typing span { background: #6200ea; }

      .raghost-watermark { background: #fce4ec; color: #bdbdbd; border-top: 1px solid #e0e0e0; }
      .raghost-watermark a { color: #6200ea; }
    `;
  }

  // Template 11: Fluent (Windows 11)
  function getFluentStyles() {
    return `
      .raghost-chat-button {
        background: rgba(0,120,212,0.92);
        backdrop-filter: blur(20px) saturate(1.5);
        box-shadow: 0 4px 20px rgba(0,120,212,0.35), 0 0 0 1px rgba(255,255,255,0.15);
        border: none;
        transition: box-shadow 0.2s;
      }
      .raghost-chat-button:hover {
        box-shadow: 0 8px 28px rgba(0,120,212,0.5), 0 0 0 1px rgba(255,255,255,0.2);
      }

      .raghost-chat-window {
        background: rgba(240,240,240,0.78);
        backdrop-filter: blur(60px) saturate(1.6) brightness(1.05);
        border: 1px solid rgba(255,255,255,0.55);
        box-shadow: 0 20px 52px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
      }

      .raghost-header {
        background: rgba(0,120,212,0.85);
        backdrop-filter: blur(20px);
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.15);
        border-radius: inherit;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.22);
        border: 1px solid rgba(255,255,255,0.3);
      }
      .raghost-messages { background: rgba(255,255,255,0.3); }
      .raghost-message-time { color: rgba(0,0,0,0.45); }

      .raghost-message.bot .raghost-message-avatar {
        background: rgba(0,120,212,0.1);
        border: 1px solid rgba(0,120,212,0.2);
      }
      .raghost-message.user .raghost-message-avatar {
        background: rgba(0,120,212,0.85);
      }
      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255,255,255,0.7);
        color: #1b1b1b;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.6);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(0,120,212,0.85);
        color: #fff;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0,120,212,0.3);
      }

      .raghost-input-area {
        background: rgba(255,255,255,0.55);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(0,0,0,0.06);
      }
      .raghost-input {
        background: rgba(255,255,255,0.65);
        color: #1b1b1b;
        border: 1px solid rgba(0,0,0,0.1);
        backdrop-filter: blur(8px);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus {
        border-color: rgba(0,120,212,0.6);
        box-shadow: 0 0 0 3px rgba(0,120,212,0.15);
      }
      .raghost-input::placeholder { color: rgba(0,0,0,0.38); }

      .raghost-send-btn {
        background: rgba(0,120,212,0.88);
        color: #fff;
        box-shadow: 0 2px 8px rgba(0,120,212,0.3);
        transition: background 0.2s;
      }
      .raghost-send-btn:hover { background: rgba(0,100,180,0.95); }
      .raghost-send-btn:disabled { background: rgba(0,0,0,0.1); color: rgba(0,0,0,0.3); }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); transition: background 0.2s; }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.24); }

      .raghost-typing span { background: rgba(0,120,212,0.7); }

      .raghost-watermark { background: rgba(255,255,255,0.45); color: rgba(0,0,0,0.4); border-top: 1px solid rgba(0,0,0,0.05); backdrop-filter: blur(10px); }
      .raghost-watermark a { color: rgba(0,120,212,0.9); }
    `;
  }

  // Template 12: Retro Y2K
  function getRetroY2kStyles() {
    return `
      @keyframes rh-y2kSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes rh-y2kGlow {
        0%, 100% { text-shadow: 0 0 8px #ff00cc, 0 0 16px #ff00cc; }
        50% { text-shadow: 0 0 16px #00ffff, 0 0 32px #00ffff; }
      }
      @keyframes rh-marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }

      .raghost-chat-button {
        background: linear-gradient(135deg, #ff00cc 0%, #3333ff 50%, #00ffff 100%);
        border: 3px solid #fff;
        box-shadow: 0 0 20px #ff00cc, 0 0 40px #3333ff, 0 0 60px #00ffff;
        animation: rh-y2kSpin 8s linear infinite;
      }
      .raghost-chat-button:hover { animation-play-state: paused; }

      .raghost-chat-window {
        background: #050014;
        border: 2px solid #ff00cc;
        box-shadow: 0 0 30px rgba(255,0,204,0.4), 0 0 60px rgba(0,255,255,0.2), inset 0 0 30px rgba(51,51,255,0.1);
        overflow: hidden;
      }
      .raghost-chat-window::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, #ff00cc, #3333ff, #00ffff, #ff00cc);
        background-size: 200% 100%;
        animation: rh-gradientShift 2s linear infinite;
        z-index: 10;
      }

      .raghost-header {
        background: linear-gradient(135deg, rgba(255,0,204,0.3), rgba(51,51,255,0.3));
        color: #fff;
        border-bottom: 2px solid #ff00cc;
        font-weight: 900;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-shadow: 0 0 10px #ff00cc, 0 0 20px #3333ff;
        animation: rh-y2kGlow 3s ease-in-out infinite;
      }
      .raghost-avatar {
        background: linear-gradient(135deg, #ff00cc, #3333ff);
        border: 2px solid #fff;
        box-shadow: 0 0 12px #ff00cc;
      }
      .raghost-messages { background: #050014; }
      .raghost-message-time { color: rgba(0,255,255,0.5); font-family: monospace; }

      .raghost-message.bot .raghost-message-avatar {
        background: #050014;
        border: 2px solid #00ffff;
        box-shadow: 0 0 8px rgba(0,255,255,0.5);
      }
      .raghost-message.user .raghost-message-avatar {
        background: #050014;
        border: 2px solid #ff00cc;
        box-shadow: 0 0 8px rgba(255,0,204,0.5);
      }
      .raghost-message.bot .raghost-message-bubble {
        background: rgba(0,255,255,0.06);
        color: #00ffff;
        border: 1px solid rgba(0,255,255,0.4);
        box-shadow: 0 0 16px rgba(0,255,255,0.15), inset 0 0 10px rgba(0,255,255,0.04);
        font-family: monospace;
        letter-spacing: 0.03em;
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(255,0,204,0.1);
        color: #ff79d1;
        border: 1px solid rgba(255,0,204,0.4);
        box-shadow: 0 0 16px rgba(255,0,204,0.15);
        font-family: monospace;
      }

      .raghost-input-area { background: #0a0024; border-top: 2px solid rgba(51,51,255,0.6); }
      .raghost-input {
        background: rgba(51,51,255,0.08);
        color: #00ffff;
        border: 1px solid rgba(0,255,255,0.35);
        font-family: monospace;
        letter-spacing: 0.04em;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus { border-color: #00ffff; box-shadow: 0 0 0 2px rgba(0,255,255,0.2); }
      .raghost-input::placeholder { color: rgba(0,255,255,0.3); }

      .raghost-send-btn {
        background: linear-gradient(135deg, #ff00cc, #3333ff);
        color: #fff;
        font-weight: 900;
        box-shadow: 0 0 12px rgba(255,0,204,0.5);
        border: 1px solid rgba(255,255,255,0.2);
        transition: box-shadow 0.2s;
      }
      .raghost-send-btn:hover { box-shadow: 0 0 20px rgba(255,0,204,0.7), 0 0 40px rgba(51,51,255,0.4); }
      .raghost-send-btn:disabled { background: #1a1a2e; color: #333; box-shadow: none; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.16); }

      .raghost-typing span { background: #00ffff; box-shadow: 0 0 6px #00ffff; }

      .raghost-watermark { background: #0a0024; color: rgba(0,255,255,0.4); border-top: 1px solid rgba(51,51,255,0.4); font-family: monospace; }
      .raghost-watermark a { color: #ff00cc; }
    `;
  }

  // Template 13: Skeuomorphic
  function getSkeuomorphicStyles() {
    return `
      .raghost-chat-button {
        background: radial-gradient(ellipse at 30% 30%, #5ba8f0, #2c6fad 60%, #1a4a7a);
        box-shadow: 0 6px 0 #0e3358, 0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2);
        border: 1px solid #1a4a7a;
        transition: transform 0.1s, box-shadow 0.1s;
      }
      .raghost-chat-button:hover { transform: translateY(-1px); box-shadow: 0 8px 0 #0e3358, 0 12px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.4); }
      .raghost-chat-button:active { transform: translateY(2px); box-shadow: 0 2px 0 #0e3358, 0 4px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2); }

      .raghost-chat-window {
        background: linear-gradient(180deg, #f2ede0 0%, #e8e0ce 50%, #ded6c2 100%);
        border: 1px solid #b8a888;
        box-shadow: 0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(0,0,0,0.12);
      }

      .raghost-header {
        background: linear-gradient(180deg, #729fd8 0%, #4a7fb5 40%, #3668a0 100%);
        color: #fff;
        border-bottom: 2px solid #2c5f8a;
        text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        box-shadow: 0 3px 8px rgba(0,0,0,0.18);
      }
      .raghost-avatar {
        background: radial-gradient(circle at 35% 30%, #e0e0e0, #b0b0b0);
        border: 1px solid #888;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.25), inset 0 -1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.2);
      }
      .raghost-messages { background: linear-gradient(180deg, #f2ede0, #ede5d0); }
      .raghost-message-time { color: #9a8a70; }

      .raghost-message.bot .raghost-message-avatar {
        background: radial-gradient(circle at 35% 30%, #e8e8e8, #c8c8c8);
        border: 1px solid #aaa;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
      }
      .raghost-message.user .raghost-message-avatar {
        background: radial-gradient(circle at 35% 30%, #6bb0e8, #3d7ab5);
        border: 1px solid #2c5f8a;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
      }
      .raghost-message.bot .raghost-message-bubble {
        background: linear-gradient(180deg, #fffdf8 0%, #f5ede0 100%);
        color: #3a2f1e;
        border: 1px solid #c8b090;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(180deg, #6ab2ec 0%, #4088cc 100%);
        color: #fff;
        border: 1px solid #2c6fa0;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
        text-shadow: 0 1px 1px rgba(0,0,0,0.2);
      }

      .raghost-input-area {
        background: linear-gradient(180deg, #ddd5c0, #cfc7b0);
        border-top: 2px solid #b8a080;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      }
      .raghost-input {
        background: linear-gradient(180deg, #fffff8, #f8f3e8);
        color: #3a2f1e;
        border: 1px solid #b0906a;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.14), inset 0 1px 2px rgba(0,0,0,0.08);
        transition: border-color 0.2s;
      }
      .raghost-input:focus { border-color: #4a7fb5; box-shadow: inset 0 2px 5px rgba(0,0,0,0.14), 0 0 0 2px rgba(74,127,181,0.3); }
      .raghost-input::placeholder { color: #b0956a; }

      .raghost-send-btn {
        background: radial-gradient(ellipse at 30% 30%, #6bb8f0, #3d88c8 60%, #2a6aaa);
        color: #fff;
        border: 1px solid #2060a0;
        box-shadow: 0 3px 0 #174878, 0 4px 10px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.3);
        transition: transform 0.1s, box-shadow 0.1s;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .raghost-send-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 0 #174878, 0 6px 14px rgba(0,0,0,0.28); }
      .raghost-send-btn:active { transform: translateY(1px); box-shadow: 0 1px 0 #174878, 0 2px 5px rgba(0,0,0,0.2); }
      .raghost-send-btn:disabled { background: linear-gradient(180deg, #ccc, #b8b8b8); color: #888; box-shadow: 0 1px 0 #999; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.22); }

      .raghost-typing span { background: #7a9060; }

      .raghost-watermark { background: #e8e0cc; color: #9a8870; border-top: 1px solid #c8b888; }
      .raghost-watermark a { color: #4a7fb5; }
    `;
  }

  // Template 14: Enterprise Dense
  function getEnterpriseDenseStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(135deg, #1d4ed8, #1e40af);
        box-shadow: 0 4px 16px rgba(30,64,175,0.4);
        border-radius: 8px !important;
        border: none;
        transition: box-shadow 0.2s, transform 0.15s;
      }
      .raghost-chat-button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,64,175,0.5); }

      .raghost-chat-window {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
        border-radius: 8px !important;
      }

      .raghost-header {
        background: linear-gradient(135deg, #1d4ed8, #1e40af);
        color: #fff;
        padding: 10px 14px !important;
        border-radius: 8px 8px 0 0 !important;
        border-bottom: none;
      }
      .raghost-header-name { font-size: 13px !important; font-weight: 700 !important; letter-spacing: 0.02em; }
      .raghost-header-status { font-size: 11px !important; color: rgba(255,255,255,0.75) !important; }

      .raghost-avatar {
        background: rgba(255,255,255,0.18);
        width: 32px !important; height: 32px !important;
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 6px !important;
      }
      .raghost-messages { background: #f9fafb; }
      .raghost-message-time { color: #9ca3af; font-size: 10px !important; }

      .raghost-message.bot .raghost-message-avatar {
        background: #dbeafe;
        border: 1px solid #bfdbfe;
        border-radius: 6px !important;
        width: 28px !important; height: 28px !important;
      }
      .raghost-message.user .raghost-message-avatar {
        background: #1d4ed8;
        border-radius: 6px !important;
        width: 28px !important; height: 28px !important;
      }
      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #111827;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        font-size: 13px !important;
        line-height: 1.5 !important;
        border-radius: 2px 8px 8px 8px !important;
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(135deg, #1d4ed8, #1e40af);
        color: #fff;
        font-size: 13px !important;
        line-height: 1.5 !important;
        border-radius: 8px 2px 8px 8px !important;
        box-shadow: 0 2px 8px rgba(30,64,175,0.3);
      }

      .raghost-input-area {
        background: #fff;
        border-top: 1px solid #e5e7eb;
        padding: 10px 12px !important;
      }
      .raghost-input {
        background: #f9fafb;
        color: #111827;
        border: 1px solid #d1d5db;
        border-radius: 6px !important;
        font-size: 13px !important;
        padding: 7px 12px !important;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .raghost-input:focus {
        border-color: #1d4ed8;
        box-shadow: 0 0 0 3px rgba(29,78,216,0.15);
        background: #fff;
      }
      .raghost-input::placeholder { color: #9ca3af; }

      .raghost-send-btn {
        background: linear-gradient(135deg, #1d4ed8, #1e40af);
        color: #fff;
        border-radius: 6px !important;
        box-shadow: 0 2px 6px rgba(30,64,175,0.3);
        transition: box-shadow 0.2s, transform 0.15s;
      }
      .raghost-send-btn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(30,64,175,0.4); }
      .raghost-send-btn:disabled { background: #e5e7eb; color: #9ca3af; box-shadow: none; }

      .raghost-header-btn { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 5px !important; transition: background 0.2s; }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.2); }

      .raghost-typing span { background: #1d4ed8; }

      .raghost-watermark { background: #f9fafb; color: #9ca3af; border-top: 1px solid #e5e7eb; font-size: 10px !important; }
      .raghost-watermark a { color: #1d4ed8; font-weight: 500; }
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
