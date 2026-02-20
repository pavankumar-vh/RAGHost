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
        justify-content: center;
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

      @keyframes rh-buttonPulse {
        0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
        70% { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
      }

      .raghost-chat-button .rh-icon-chat,
      .raghost-chat-button .rh-icon-close {
        position: absolute;
        width: 28px;
        height: 28px;
        transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .raghost-chat-button .rh-icon-chat {
        opacity: 1;
        transform: rotate(0deg) scale(1);
        fill: white;
      }

      .raghost-chat-button .rh-icon-close {
        opacity: 0;
        transform: rotate(-90deg) scale(0.6);
        fill: none;
        stroke: white;
        stroke-width: 2.5;
        stroke-linecap: round;
      }

      .raghost-chat-button.open .rh-icon-chat {
        opacity: 0;
        transform: rotate(90deg) scale(0.6);
      }

      .raghost-chat-button.open .rh-icon-close {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      .raghost-chat-button.rh-pulse {
        animation: rh-buttonPulse 0.6s ease-out;
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
        fill: currentColor;
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
        <!-- Chat bubble icon (shown when closed) -->
        <svg class="rh-icon-chat" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          <circle cx="8.5" cy="11" r="1.1" fill="white"/>
          <circle cx="12" cy="11" r="1.1" fill="white"/>
          <circle cx="15.5" cy="11" r="1.1" fill="white"/>
        </svg>
        <!-- X icon (shown when open) -->
        <svg class="rh-icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <line x1="6" y1="6" x2="18" y2="18"/>
          <line x1="18" y1="6" x2="6" y2="18"/>
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
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
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
        }
        .raghost-header-btn:hover {
          background: rgba(255,255,255,0.3) !important;
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


  // ═══════════════════════════════════════════════════════════════════════
  //  TEMPLATE STYLE FUNCTIONS
  //  Each template is self-contained with its own @keyframes.
  //  ● Dark-header templates: .raghost-header-btn inherits white from base
  //  ● Light-header templates: MUST set .raghost-header-btn { color: <dark> }
  //  ● Light-button templates: MUST override .rh-icon-chat fill + .rh-icon-close stroke
  //  ● Every template sets color on .raghost-send-btn for SVG arrow visibility
  // ═══════════════════════════════════════════════════════════════════════

  // ── Template 1: Modern Gradient ──────────────────────────────────────
  function getModernGradientStyles() {
    return `
      @keyframes rh-mg-shift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .raghost-chat-button {
        background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
        background-size: 200% 200%;
        animation: rh-mg-shift 6s ease infinite;
        box-shadow: 0 8px 30px rgba(99,102,241,0.5);
      }

      .raghost-chat-window {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        box-shadow: 0 25px 65px rgba(0,0,0,0.18);
      }

      .raghost-header {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        color: #fff;
      }

      .raghost-avatar {
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.35);
      }

      .raghost-messages { background: #f8f7ff; }

      .raghost-message.bot .raghost-message-avatar {
        background: #ede9fe;
        color: #6366f1;
      }
      .raghost-message.user .raghost-message-avatar {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: #fff;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #1e1b4b;
        border: 1px solid #e9e5ff;
        box-shadow: 0 2px 8px rgba(99,102,241,0.08);
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: #fff;
        box-shadow: 0 4px 14px rgba(99,102,241,0.35);
      }

      .raghost-input-area { background: #fff; border-top: 1px solid #ede9fe; }
      .raghost-input {
        background: #f5f3ff;
        color: #1e1b4b;
        border: 1.5px solid #ddd6fe;
      }
      .raghost-input:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
      }
      .raghost-input::placeholder { color: #a5b4fc; }

      .raghost-send-btn {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: #fff;
        box-shadow: 0 4px 12px rgba(99,102,241,0.4);
      }
      .raghost-send-btn:disabled { background: #e9e5ff; color: #a5b4fc; box-shadow: none; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.18); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.32); }

      .raghost-typing span { background: #8b5cf6; }

      .raghost-watermark { background: #f8f7ff; color: #a5b4fc; border-top: 1px solid #ede9fe; }
      .raghost-watermark a { color: #6366f1; }
    `;
  }

  // ── Template 2: Glass Morphism ───────────────────────────────────────
  function getGlassMorphismStyles() {
    return `
      @keyframes rh-gm-float {
        0%, 100% { transform: translateY(0) scale(1); }
        50%      { transform: translateY(-6px) scale(1.03); }
      }

      .raghost-chat-button {
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.3);
        box-shadow: 0 8px 32px rgba(31,38,135,0.25);
        animation: rh-gm-float 4s ease-in-out infinite;
      }

      .raghost-chat-window {
        background: rgba(17,17,27,0.65);
        backdrop-filter: blur(40px) saturate(200%);
        -webkit-backdrop-filter: blur(40px) saturate(200%);
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 30px 80px rgba(0,0,0,0.45);
      }

      .raghost-header {
        background: rgba(255,255,255,0.07);
        backdrop-filter: blur(12px);
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
      }

      .raghost-messages { background: transparent; }

      .raghost-message.bot .raghost-message-avatar {
        background: rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.8);
      }
      .raghost-message.user .raghost-message-avatar {
        background: rgba(139,92,246,0.4);
        color: #fff;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.92);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(255,255,255,0.85);
        color: #1a1a2e;
      }

      .raghost-input-area {
        background: rgba(255,255,255,0.04);
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .raghost-input {
        background: rgba(255,255,255,0.08);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.12);
      }
      .raghost-input:focus {
        border-color: rgba(139,92,246,0.5);
        box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
      }
      .raghost-input::placeholder { color: rgba(255,255,255,0.3); }

      .raghost-send-btn {
        background: rgba(255,255,255,0.12);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
      }
      .raghost-send-btn:hover { background: rgba(255,255,255,0.22); }
      .raghost-send-btn:disabled { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.2); }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.18); }

      .raghost-typing span { background: rgba(255,255,255,0.5); }

      .raghost-watermark { background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.3); border-top: 1px solid rgba(255,255,255,0.05); }
      .raghost-watermark a { color: rgba(139,92,246,0.7); }
    `;
  }

  // ── Template 3: Minimal Dark ─────────────────────────────────────────
  function getMinimalDarkStyles() {
    return `
      .raghost-chat-button {
        background: #111;
        border: 1px solid #333;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      }

      .raghost-chat-window {
        background: #111;
        border: 1px solid #222;
        box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      }

      .raghost-header {
        background: #161616;
        color: #f5f5f5;
        border-bottom: 1px solid #222;
      }
      .raghost-avatar { background: #222; border: 1px solid #333; }

      .raghost-messages { background: #111; }

      .raghost-message.bot .raghost-message-avatar { background: #1e1e1e; color: #888; }
      .raghost-message.user .raghost-message-avatar { background: #3b82f6; color: #fff; }

      .raghost-message.bot .raghost-message-bubble {
        background: #1e1e1e;
        color: #d4d4d8;
        border: 1px solid #2a2a2a;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #3b82f6;
        color: #fff;
      }

      .raghost-input-area { background: #161616; border-top: 1px solid #222; }
      .raghost-input {
        background: #1e1e1e;
        color: #f5f5f5;
        border: 1px solid #333;
      }
      .raghost-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
      .raghost-input::placeholder { color: #555; }

      .raghost-send-btn { background: #3b82f6; color: #fff; }
      .raghost-send-btn:disabled { background: #222; color: #555; }

      .raghost-header-btn { color: #999; background: rgba(255,255,255,0.05); border: 1px solid #333; }
      .raghost-header-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }

      .raghost-typing span { background: #555; }

      .raghost-watermark { background: #161616; color: #444; border-top: 1px solid #222; }
      .raghost-watermark a { color: #3b82f6; }
    `;
  }

  // ── Template 4: Neon Glow ────────────────────────────────────────────
  function getNeonGlowStyles() {
    return `
      @keyframes rh-neon-pulse {
        0%, 100% { box-shadow: 0 0 15px rgba(0,255,255,0.5), 0 0 45px rgba(0,255,255,0.15); }
        50%      { box-shadow: 0 0 25px rgba(0,255,255,0.8), 0 0 65px rgba(0,255,255,0.25); }
      }

      .raghost-chat-button {
        background: #050515;
        border: 2px solid #0ff;
        animation: rh-neon-pulse 3s ease-in-out infinite;
      }
      .raghost-chat-button .rh-icon-chat { fill: #0ff; }
      .raghost-chat-button .rh-icon-close { stroke: #0ff; }

      .raghost-chat-window {
        background: #050515;
        border: 1px solid rgba(0,255,255,0.25);
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,255,255,0.08);
      }

      .raghost-header {
        background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.06));
        color: #0ff;
        border-bottom: 1px solid rgba(0,255,255,0.15);
        text-shadow: 0 0 8px rgba(0,255,255,0.5);
      }
      .raghost-avatar {
        background: #050515;
        border: 2px solid #0ff;
        box-shadow: 0 0 10px rgba(0,255,255,0.3);
      }

      .raghost-messages { background: #050515; }

      .raghost-message.bot .raghost-message-avatar {
        background: transparent;
        border: 1px solid rgba(0,255,255,0.4);
        color: #0ff;
      }
      .raghost-message.user .raghost-message-avatar {
        background: transparent;
        border: 1px solid rgba(255,0,255,0.4);
        color: #f0f;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: rgba(0,255,255,0.05);
        color: #b0ffff;
        border: 1px solid rgba(0,255,255,0.2);
        box-shadow: 0 0 12px rgba(0,255,255,0.06);
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(255,0,255,0.08);
        color: #ffb0ff;
        border: 1px solid rgba(255,0,255,0.25);
        box-shadow: 0 0 12px rgba(255,0,255,0.06);
      }

      .raghost-input-area { background: #0a0a20; border-top: 1px solid rgba(0,255,255,0.12); }
      .raghost-input {
        background: rgba(0,255,255,0.04);
        color: #b0ffff;
        border: 1px solid rgba(0,255,255,0.2);
      }
      .raghost-input:focus {
        border-color: #0ff;
        box-shadow: 0 0 0 2px rgba(0,255,255,0.12);
      }
      .raghost-input::placeholder { color: rgba(0,255,255,0.25); }

      .raghost-send-btn {
        background: rgba(255,0,255,0.1);
        color: #f0f;
        border: 1px solid rgba(255,0,255,0.35);
        box-shadow: 0 0 10px rgba(255,0,255,0.12);
      }
      .raghost-send-btn:hover { box-shadow: 0 0 18px rgba(255,0,255,0.3); }
      .raghost-send-btn:disabled { border-color: #1a1a2e; color: #1a1a2e; box-shadow: none; }

      .raghost-header-btn { color: #0ff; background: rgba(0,255,255,0.06); border: 1px solid rgba(0,255,255,0.2); }
      .raghost-header-btn:hover { background: rgba(0,255,255,0.14); }

      .raghost-typing span { background: #0ff; box-shadow: 0 0 6px #0ff; }

      .raghost-watermark { background: #0a0a20; color: rgba(0,255,255,0.25); border-top: 1px solid rgba(0,255,255,0.08); }
      .raghost-watermark a { color: rgba(255,0,255,0.5); }
    `;
  }

  // ── Template 5: Soft Light ───────────────────────────────────────────
  function getSoftLightStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(135deg, #e879f9, #a855f7, #6366f1);
        box-shadow: 0 8px 28px rgba(168,85,247,0.45);
      }

      .raghost-chat-window {
        background: #fff;
        border: 1px solid #f0ebff;
        box-shadow: 0 24px 60px rgba(0,0,0,0.1);
      }

      .raghost-header {
        background: linear-gradient(135deg, #e879f9, #a855f7, #6366f1);
        color: #fff;
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.35);
      }

      .raghost-messages { background: #faf7ff; }

      .raghost-message.bot .raghost-message-avatar { background: #f3e8ff; color: #a855f7; }
      .raghost-message.user .raghost-message-avatar { background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #1e1b4b;
        border: 1px solid #ede9fe;
        box-shadow: 0 2px 8px rgba(168,85,247,0.06);
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(135deg, #a855f7, #6366f1);
        color: #fff;
        box-shadow: 0 4px 14px rgba(168,85,247,0.3);
      }

      .raghost-input-area { background: #fff; border-top: 1px solid #ede9fe; }
      .raghost-input { background: #f5f3ff; color: #1e1b4b; border: 1.5px solid #ddd6fe; }
      .raghost-input:focus { border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168,85,247,0.12); }
      .raghost-input::placeholder { color: #c4b5fd; }

      .raghost-send-btn { background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; box-shadow: 0 4px 12px rgba(168,85,247,0.35); }
      .raghost-send-btn:disabled { background: #ede9fe; color: #c4b5fd; box-shadow: none; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.18); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.3); }

      .raghost-typing span { background: #a855f7; }

      .raghost-watermark { background: #faf7ff; color: #c4b5fd; border-top: 1px solid #ede9fe; }
      .raghost-watermark a { color: #a855f7; }
    `;
  }

  // ── Template 6: Corporate ────────────────────────────────────────────
  function getCorporateStyles() {
    return `
      .raghost-chat-button {
        background: #1d4ed8;
        box-shadow: 0 4px 18px rgba(29,78,216,0.4);
      }

      .raghost-chat-window {
        background: #fff;
        border: 1px solid #e5e7eb;
        box-shadow: 0 20px 50px rgba(0,0,0,0.12);
      }

      .raghost-header { background: #1d4ed8; color: #fff; }
      .raghost-avatar { background: rgba(255,255,255,0.2); }

      .raghost-messages { background: #f9fafb; }

      .raghost-message.bot .raghost-message-avatar { background: #dbeafe; color: #1d4ed8; }
      .raghost-message.user .raghost-message-avatar { background: #1d4ed8; color: #fff; }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #111827;
        border: 1px solid #e5e7eb;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #1d4ed8;
        color: #fff;
      }

      .raghost-input-area { background: #fff; border-top: 1px solid #e5e7eb; }
      .raghost-input { background: #f9fafb; color: #111827; border: 1px solid #d1d5db; }
      .raghost-input:focus { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,0.1); }
      .raghost-input::placeholder { color: #9ca3af; }

      .raghost-send-btn { background: #1d4ed8; color: #fff; }
      .raghost-send-btn:disabled { background: #e5e7eb; color: #9ca3af; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.15); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.25); }

      .raghost-typing span { background: #1d4ed8; }

      .raghost-watermark { background: #f9fafb; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      .raghost-watermark a { color: #1d4ed8; }
    `;
  }

  // ── Template 7: Minimal (LIGHT header — needs dark header-btn color) ─
  function getMinimalStyles() {
    return `
      .raghost-chat-button {
        background: #18181b;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      }

      .raghost-chat-window {
        background: #fff;
        border: 1px solid #e4e4e7;
        box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      }

      .raghost-header {
        background: #fff;
        color: #18181b;
        border-bottom: 1px solid #e4e4e7;
      }
      .raghost-avatar { background: #f4f4f5; border: 1px solid #e4e4e7; }

      .raghost-messages { background: #fafafa; }

      .raghost-message.bot .raghost-message-avatar { background: #f4f4f5; color: #71717a; }
      .raghost-message.user .raghost-message-avatar { background: #18181b; color: #fff; }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #18181b;
        border: 1px solid #e4e4e7;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #18181b;
        color: #fff;
      }

      .raghost-input-area { background: #fff; border-top: 1px solid #e4e4e7; }
      .raghost-input { background: #f4f4f5; color: #18181b; border: 1px solid #e4e4e7; }
      .raghost-input:focus { border-color: #71717a; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
      .raghost-input::placeholder { color: #a1a1aa; }

      .raghost-send-btn { background: #18181b; color: #fff; }
      .raghost-send-btn:disabled { background: #e4e4e7; color: #a1a1aa; }

      /* ★ Light header — dark close button */
      .raghost-header-btn { color: #52525b; background: #f4f4f5; border: 1px solid #e4e4e7; }
      .raghost-header-btn:hover { color: #18181b; background: #e4e4e7; }

      .raghost-typing span { background: #a1a1aa; }

      .raghost-watermark { background: #fff; color: #d4d4d8; border-top: 1px solid #e4e4e7; }
      .raghost-watermark a { color: #71717a; }
    `;
  }

  // ── Template 8: Neumorphism (LIGHT bg — needs dark icon overrides) ──
  function getNeumorphismStyles() {
    return `
      .raghost-chat-button {
        background: #e0e5ec;
        box-shadow: 8px 8px 20px #b8bec7, -8px -8px 20px #fff;
      }
      /* ★ Light button — dark icons */
      .raghost-chat-button .rh-icon-chat { fill: #4a5568; }
      .raghost-chat-button .rh-icon-close { stroke: #4a5568; }

      .raghost-chat-window {
        background: #e0e5ec;
        box-shadow: 14px 14px 35px #b8bec7, -14px -14px 35px #fff;
        border: none;
      }

      .raghost-header {
        background: #e0e5ec;
        color: #374151;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        box-shadow: 0 3px 8px rgba(0,0,0,0.05);
      }
      .raghost-avatar {
        background: #e0e5ec;
        box-shadow: 3px 3px 8px #b8bec7, -3px -3px 8px #fff;
      }

      .raghost-messages { background: #e3e7ee; }

      .raghost-message.bot .raghost-message-avatar {
        background: #e0e5ec;
        box-shadow: 2px 2px 6px #b8bec7, -2px -2px 6px #fff;
        color: #6b7280;
      }
      .raghost-message.user .raghost-message-avatar {
        background: #e0e5ec;
        box-shadow: inset 2px 2px 6px #b8bec7, inset -2px -2px 6px #fff;
        color: #374151;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: #e6eaf0;
        color: #374151;
        box-shadow: 4px 4px 10px #b8bec7, -4px -4px 10px #fff;
        border: none;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #e0e5ec;
        color: #374151;
        box-shadow: inset 4px 4px 10px #b8bec7, inset -4px -4px 10px #fff;
        border: none;
      }

      .raghost-input-area { background: #e0e5ec; border-top: 1px solid rgba(0,0,0,0.04); }
      .raghost-input {
        background: #e0e5ec;
        color: #374151;
        border: none;
        box-shadow: inset 4px 4px 10px #b8bec7, inset -4px -4px 10px #fff;
      }
      .raghost-input:focus {
        box-shadow: inset 5px 5px 12px #b0b6bf, inset -5px -5px 12px #fff;
      }
      .raghost-input::placeholder { color: #94a3b8; }

      .raghost-send-btn {
        background: #e0e5ec;
        color: #4a5568;
        box-shadow: 3px 3px 8px #b8bec7, -3px -3px 8px #fff;
        border: none;
      }
      .raghost-send-btn:hover {
        box-shadow: inset 3px 3px 8px #b8bec7, inset -3px -3px 8px #fff;
      }
      .raghost-send-btn:disabled { color: #b0b6c0; }

      /* ★ Light header — dark close button */
      .raghost-header-btn {
        background: #e0e5ec;
        color: #4a5568;
        border: none;
        box-shadow: 2px 2px 6px #b8bec7, -2px -2px 6px #fff;
      }
      .raghost-header-btn:hover {
        box-shadow: inset 2px 2px 6px #b8bec7, inset -2px -2px 6px #fff;
      }

      .raghost-typing span { background: #94a3b8; }

      .raghost-watermark { background: #e0e5ec; color: #94a3b8; border-top: 1px solid rgba(0,0,0,0.04); }
      .raghost-watermark a { color: #64748b; }
    `;
  }

  // ── Template 9: Neo-Brutalism (LIGHT yellow — needs dark icon overrides) ─
  function getNeoBrutalismStyles() {
    return `
      .raghost-chat-button {
        background: #facc15;
        border: 3px solid #000;
        box-shadow: 5px 5px 0 #000;
        border-radius: 0 !important;
      }
      .raghost-chat-button:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 #000; }
      .raghost-chat-button:active { transform: translate(2px,2px); box-shadow: 3px 3px 0 #000; }
      /* ★ Light button — dark icons */
      .raghost-chat-button .rh-icon-chat { fill: #000; }
      .raghost-chat-button .rh-icon-close { stroke: #000; }

      .raghost-chat-window {
        background: #fffbeb;
        border: 3px solid #000;
        box-shadow: 8px 8px 0 #000;
        border-radius: 0 !important;
      }

      .raghost-header {
        background: #facc15;
        color: #000;
        border-bottom: 3px solid #000;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .raghost-avatar {
        background: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        color: #facc15;
      }

      .raghost-messages { background: #fffbeb; }

      .raghost-message.bot .raghost-message-avatar { background: #000; color: #fff; border-radius: 0 !important; }
      .raghost-message.user .raghost-message-avatar { background: #facc15; color: #000; border: 2px solid #000; border-radius: 0 !important; }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 3px 3px 0 #000;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #facc15;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 3px 3px 0 #000;
        font-weight: 600;
      }

      .raghost-input-area { background: #fffbeb; border-top: 3px solid #000; }
      .raghost-input {
        background: #fff;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        font-weight: 500;
      }
      .raghost-input:focus { box-shadow: 3px 3px 0 #000; }
      .raghost-input::placeholder { color: #888; }

      .raghost-send-btn {
        background: #facc15;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
        box-shadow: 3px 3px 0 #000;
        font-weight: 900;
      }
      .raghost-send-btn:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #000; }
      .raghost-send-btn:active { transform: translate(1px,1px); box-shadow: 2px 2px 0 #000; }
      .raghost-send-btn:disabled { background: #ddd; color: #888; box-shadow: 2px 2px 0 #999; }

      /* ★ Light header — dark close button */
      .raghost-header-btn {
        background: #fff;
        color: #000;
        border: 2px solid #000;
        border-radius: 0 !important;
      }
      .raghost-header-btn:hover { background: #f0f0f0; }

      .raghost-typing span { background: #000; }

      .raghost-watermark { background: #fff8e1; border-top: 2px solid #000; color: #555; font-weight: 700; }
      .raghost-watermark a { color: #000; }
    `;
  }

  // ── Template 10: Material Design ─────────────────────────────────────
  function getMaterialStyles() {
    return `
      .raghost-chat-button {
        background: #6200ea;
        box-shadow: 0 6px 20px rgba(98,0,234,0.4);
      }

      .raghost-chat-window {
        background: #fff;
        box-shadow: 0 24px 48px rgba(0,0,0,0.15);
        border: none;
      }

      .raghost-header {
        background: #6200ea;
        color: #fff;
        box-shadow: 0 3px 10px rgba(98,0,234,0.25);
      }
      .raghost-avatar { background: rgba(255,255,255,0.18); }

      .raghost-messages { background: #fafafa; }

      .raghost-message.bot .raghost-message-avatar { background: #ede7f6; color: #6200ea; }
      .raghost-message.user .raghost-message-avatar { background: #6200ea; color: #fff; }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #212121;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        border: none;
      }
      .raghost-message.user .raghost-message-bubble {
        background: #6200ea;
        color: #fff;
        box-shadow: 0 3px 10px rgba(98,0,234,0.3);
      }

      .raghost-input-area { background: #fff; border-top: 1px solid #e0e0e0; }
      .raghost-input {
        background: #f5f5f5;
        color: #212121;
        border: none;
        border-bottom: 2px solid #bdbdbd;
        border-radius: 4px 4px 0 0 !important;
      }
      .raghost-input:focus { border-bottom-color: #6200ea; }
      .raghost-input::placeholder { color: #9e9e9e; }

      .raghost-send-btn { background: #6200ea; color: #fff; box-shadow: 0 3px 10px rgba(98,0,234,0.3); }
      .raghost-send-btn:hover { background: #7c4dff; }
      .raghost-send-btn:disabled { background: #e0e0e0; color: #9e9e9e; box-shadow: none; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.12); border: none; }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.22); }

      .raghost-typing span { background: #6200ea; }

      .raghost-watermark { background: #fff; color: #bdbdbd; border-top: 1px solid #e0e0e0; }
      .raghost-watermark a { color: #6200ea; }
    `;
  }

  // ── Template 11: Fluent (Windows 11 Acrylic) ─────────────────────────
  function getFluentStyles() {
    return `
      .raghost-chat-button {
        background: rgba(0,120,212,0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 4px 18px rgba(0,120,212,0.35);
      }

      .raghost-chat-window {
        background: rgba(243,243,243,0.82);
        backdrop-filter: blur(50px) saturate(1.6);
        -webkit-backdrop-filter: blur(50px) saturate(1.6);
        border: 1px solid rgba(255,255,255,0.5);
        box-shadow: 0 16px 48px rgba(0,0,0,0.14);
      }

      .raghost-header {
        background: rgba(0,120,212,0.88);
        backdrop-filter: blur(14px);
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.12);
      }
      .raghost-avatar { background: rgba(255,255,255,0.2); }

      .raghost-messages { background: rgba(255,255,255,0.25); }

      .raghost-message.bot .raghost-message-avatar { background: rgba(0,120,212,0.1); color: #0078d4; }
      .raghost-message.user .raghost-message-avatar { background: rgba(0,120,212,0.85); color: #fff; }

      .raghost-message.bot .raghost-message-bubble {
        background: rgba(255,255,255,0.7);
        color: #1b1b1b;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.5);
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(0,120,212,0.85);
        color: #fff;
        box-shadow: 0 2px 6px rgba(0,120,212,0.22);
      }

      .raghost-input-area {
        background: rgba(255,255,255,0.5);
        backdrop-filter: blur(14px);
        border-top: 1px solid rgba(0,0,0,0.05);
      }
      .raghost-input {
        background: rgba(255,255,255,0.6);
        color: #1b1b1b;
        border: 1px solid rgba(0,0,0,0.08);
      }
      .raghost-input:focus { border-color: rgba(0,120,212,0.5); box-shadow: 0 0 0 2px rgba(0,120,212,0.1); }
      .raghost-input::placeholder { color: rgba(0,0,0,0.35); }

      .raghost-send-btn { background: rgba(0,120,212,0.9); color: #fff; }
      .raghost-send-btn:disabled { background: rgba(0,0,0,0.08); color: rgba(0,0,0,0.25); }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.22); }

      .raghost-typing span { background: rgba(0,120,212,0.65); }

      .raghost-watermark { background: rgba(255,255,255,0.4); color: rgba(0,0,0,0.35); border-top: 1px solid rgba(0,0,0,0.04); }
      .raghost-watermark a { color: rgba(0,120,212,0.85); }
    `;
  }

  // ── Template 12: Retro Y2K ───────────────────────────────────────────
  function getRetroY2kStyles() {
    return `
      @keyframes rh-y2k-glow {
        0%, 100% { text-shadow: 0 0 6px #ff00cc, 0 0 14px #ff00cc; }
        50%      { text-shadow: 0 0 10px #00ffff, 0 0 24px #00ffff; }
      }

      .raghost-chat-button {
        background: linear-gradient(135deg, #ff00cc, #3333ff, #00ffff);
        border: 2px solid #fff;
        box-shadow: 0 0 20px rgba(255,0,204,0.5), 0 0 40px rgba(0,255,255,0.2);
      }

      .raghost-chat-window {
        background: #0a0a20;
        border: 2px solid #ff00cc;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(255,0,204,0.15);
      }

      .raghost-header {
        background: linear-gradient(90deg, #ff00cc, #3333ff, #00ffff);
        color: #000;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        border-bottom: 2px solid #000;
      }
      .raghost-avatar { background: #000; border: 2px solid #fff; color: #0ff; }

      .raghost-messages { background: #0a0a20; }

      .raghost-message.bot .raghost-message-avatar { background: transparent; border: 1.5px solid #00ffff; color: #0ff; }
      .raghost-message.user .raghost-message-avatar { background: transparent; border: 1.5px solid #ff00cc; color: #f0f; }

      .raghost-message.bot .raghost-message-bubble {
        background: rgba(0,255,255,0.06);
        color: #00ffff;
        border: 1px solid rgba(0,255,255,0.3);
        font-family: 'Courier New', monospace;
      }
      .raghost-message.user .raghost-message-bubble {
        background: rgba(255,0,204,0.08);
        color: #ff88dd;
        border: 1px solid rgba(255,0,204,0.3);
        font-family: 'Courier New', monospace;
      }

      .raghost-input-area { background: #0d0d28; border-top: 2px solid rgba(51,51,255,0.4); }
      .raghost-input {
        background: rgba(0,0,0,0.3);
        color: #00ffff;
        border: 1px solid rgba(0,255,255,0.25);
        font-family: 'Courier New', monospace;
      }
      .raghost-input:focus { border-color: #00ffff; box-shadow: 0 0 0 2px rgba(0,255,255,0.12); }
      .raghost-input::placeholder { color: rgba(0,255,255,0.25); }

      .raghost-send-btn {
        background: linear-gradient(135deg, #ff00cc, #3333ff);
        color: #fff;
        box-shadow: 0 0 10px rgba(255,0,204,0.35);
      }
      .raghost-send-btn:disabled { background: #1a1a30; color: #333; box-shadow: none; }

      /* Y2K gradient header = dark text — needs dark close button */
      .raghost-header-btn { color: #000; background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.35); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.4); }

      .raghost-typing span { background: #00ffff; box-shadow: 0 0 4px #00ffff; }

      .raghost-watermark { background: #0d0d28; color: rgba(0,255,255,0.3); border-top: 1px solid rgba(51,51,255,0.25); font-family: 'Courier New', monospace; }
      .raghost-watermark a { color: #ff00cc; }
    `;
  }

  // ── Template 13: Skeuomorphic ────────────────────────────────────────
  function getSkeuomorphicStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(180deg, #5aa0d8, #3a7cb8 50%, #2a6098);
        box-shadow: 0 5px 0 #1a4878, 0 7px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
        border: 1px solid #1a4878;
      }
      .raghost-chat-button:hover { transform: translateY(-1px); box-shadow: 0 7px 0 #1a4878, 0 10px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3); }
      .raghost-chat-button:active { transform: translateY(2px); box-shadow: 0 2px 0 #1a4878, 0 3px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.15); }

      .raghost-chat-window {
        background: linear-gradient(180deg, #f0ebe0, #e5ddd0);
        border: 1px solid #c0ae90;
        box-shadow: 0 14px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6);
      }

      .raghost-header {
        background: linear-gradient(180deg, #6a9dd0, #4a80b5 50%, #3668a0);
        color: #fff;
        border-bottom: 2px solid #2c5f8a;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .raghost-avatar {
        background: linear-gradient(135deg, #e0e0e0, #c0c0c0);
        border: 1px solid #999;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
      }

      .raghost-messages { background: linear-gradient(180deg, #f0ebe0, #e8e0d0); }

      .raghost-message.bot .raghost-message-avatar {
        background: linear-gradient(135deg, #e0e0e0, #c8c8c8);
        border: 1px solid #aaa;
        color: #555;
      }
      .raghost-message.user .raghost-message-avatar {
        background: linear-gradient(135deg, #6aade8, #3a80b8);
        border: 1px solid #2a6098;
        color: #fff;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: linear-gradient(180deg, #fffdf5, #f0e8d8);
        color: #3a3020;
        border: 1px solid #c8b090;
        box-shadow: 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(180deg, #6aade8, #4090c8);
        color: #fff;
        border: 1px solid #2a6898;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25);
        text-shadow: 0 1px 1px rgba(0,0,0,0.15);
      }

      .raghost-input-area {
        background: linear-gradient(180deg, #ddd0c0, #d0c5b0);
        border-top: 2px solid #b8a080;
      }
      .raghost-input {
        background: linear-gradient(180deg, #fff, #f5f0e8);
        color: #3a3020;
        border: 1px solid #b0906a;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      }
      .raghost-input:focus { border-color: #4a80b5; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 2px rgba(74,128,181,0.25); }
      .raghost-input::placeholder { color: #a89070; }

      .raghost-send-btn {
        background: linear-gradient(180deg, #6ab0e8, #3d88c8 50%, #2a70a8);
        color: #fff;
        border: 1px solid #206090;
        box-shadow: 0 3px 0 #184870, 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25);
      }
      .raghost-send-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 0 #184870, 0 6px 12px rgba(0,0,0,0.25); }
      .raghost-send-btn:disabled { background: linear-gradient(180deg, #ccc, #b8b8b8); color: #888; box-shadow: 0 1px 0 #999; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.22); }

      .raghost-typing span { background: #4a80b5; }

      .raghost-watermark { background: #e5ddd0; color: #9a8870; border-top: 1px solid #c8b888; }
      .raghost-watermark a { color: #4a80b5; }
    `;
  }

  // ── Template 14: Enterprise Dense ────────────────────────────────────
  function getEnterpriseDenseStyles() {
    return `
      .raghost-chat-button {
        background: linear-gradient(135deg, #1e3a5f, #1d4ed8);
        box-shadow: 0 4px 16px rgba(30,58,95,0.4);
        border-radius: 8px !important;
      }

      .raghost-chat-window {
        background: #fff;
        border: 1px solid #d0d7de;
        box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        border-radius: 8px !important;
      }

      .raghost-header {
        background: linear-gradient(135deg, #1e3a5f, #1d4ed8);
        color: #fff;
        padding: 10px 14px !important;
        border-radius: 8px 8px 0 0 !important;
      }
      .raghost-avatar {
        background: rgba(255,255,255,0.18);
        width: 30px !important; height: 30px !important;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px !important;
      }

      .raghost-messages { background: #f6f8fa; }

      .raghost-message.bot .raghost-message-avatar {
        background: #dbeafe;
        border: 1px solid #bfdbfe;
        border-radius: 6px !important;
        width: 26px !important; height: 26px !important;
        color: #1d4ed8;
      }
      .raghost-message.user .raghost-message-avatar {
        background: #1e3a5f;
        border-radius: 6px !important;
        width: 26px !important; height: 26px !important;
        color: #fff;
      }

      .raghost-message.bot .raghost-message-bubble {
        background: #fff;
        color: #24292f;
        border: 1px solid #d0d7de;
        font-size: 13px !important;
        line-height: 1.5 !important;
      }
      .raghost-message.user .raghost-message-bubble {
        background: linear-gradient(135deg, #1e3a5f, #1d4ed8);
        color: #fff;
        font-size: 13px !important;
        line-height: 1.5 !important;
      }

      .raghost-input-area { background: #fff; border-top: 1px solid #d0d7de; padding: 8px 12px !important; }
      .raghost-input {
        background: #f6f8fa;
        color: #24292f;
        border: 1px solid #d0d7de;
        border-radius: 6px !important;
        font-size: 13px !important;
      }
      .raghost-input:focus { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,0.12); }
      .raghost-input::placeholder { color: #6e7781; }

      .raghost-send-btn {
        background: linear-gradient(135deg, #1e3a5f, #1d4ed8);
        color: #fff;
        border-radius: 6px !important;
      }
      .raghost-send-btn:disabled { background: #d0d7de; color: #6e7781; }

      .raghost-header-btn { color: #fff; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 5px !important; }
      .raghost-header-btn:hover { background: rgba(255,255,255,0.2); }

      .raghost-typing span { background: #1d4ed8; }

      .raghost-watermark { background: #f6f8fa; color: #6e7781; border-top: 1px solid #d0d7de; font-size: 10px !important; }
      .raghost-watermark a { color: #1d4ed8; }
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
    chatButton.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
    if (isOpen) {
      // Brief pulse on open for tactile feedback
      chatButton.classList.remove('rh-pulse');
      void chatButton.offsetWidth; // force reflow
      chatButton.classList.add('rh-pulse');
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
