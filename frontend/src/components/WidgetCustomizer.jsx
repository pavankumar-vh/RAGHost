import React, { useState, useEffect, useRef } from 'react';
import { X, Code, Copy, Check, Palette, Layout, Type, Sparkles } from 'lucide-react';

const WidgetCustomizer = ({ bot, onClose }) => {
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .customizer-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .customizer-scrollbar::-webkit-scrollbar-track {
        background: #1a1a1a;
      }
      .customizer-scrollbar::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 4px;
      }
      .customizer-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #5a5a5a;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Customization state
  const [config, setConfig] = useState({
    // Colors
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    
    // Size
    width: 400,
    height: 600,
    
    // Position
    position: 'bottom-right', // bottom-right, bottom-left, bottom-center
    
    // Style
    borderRadius: 16,
    buttonSize: 60,
    buttonStyle: 'circle', // circle, rounded-square, square
    
    // Typography
    fontFamily: 'Inter, sans-serif',
    
    // Features
    showWatermark: true,
    welcomeMessage: bot?.welcomeMessage || 'Hi! How can I help you today? 👋',
    
    // Animation
    animationSpeed: 'normal', // slow, normal, fast
  });

  // Generate preview HTML
  const generatePreviewHTML = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    // Convert animation speed to milliseconds
    const animationMs = {
      slow: 400,
      normal: 300,
      fast: 200
    }[config.animationSpeed];

    // Position styles
    const positionStyles = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
    }[config.position];

    // Button border radius based on style
    const buttonRadius = {
      circle: '50%',
      'rounded-square': '16px',
      square: '8px'
    }[config.buttonStyle];

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${config.fontFamily};
      background: #f5f5f5;
      padding: 20px;
    }
    
    .raghost-container {
      position: fixed;
      ${positionStyles}
      z-index: 9999;
    }
    
    .raghost-chat-button {
      width: ${config.buttonSize}px;
      height: ${config.buttonSize}px;
      background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
      border: none;
      border-radius: ${buttonRadius};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      transition: all ${animationMs}ms ease;
      color: white;
    }
    
    .raghost-chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    
    .raghost-chat-button svg {
      width: ${config.buttonSize * 0.5}px;
      height: ${config.buttonSize * 0.5}px;
    }
    
    .raghost-chat-window {
      position: absolute;
      bottom: ${config.buttonSize + 20}px;
      right: 0;
      width: ${config.width}px;
      height: ${config.height}px;
      background: ${config.backgroundColor};
      border-radius: ${config.borderRadius}px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      transition: all ${animationMs}ms ease;
      transform: scale(0.8);
      opacity: 0;
    }
    
    .raghost-chat-window.open {
      display: flex;
      transform: scale(1);
      opacity: 1;
    }
    
    .raghost-header {
      background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
    }
    
    .raghost-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .raghost-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .raghost-bot-name {
      font-weight: 600;
      font-size: 16px;
    }
    
    .raghost-bot-status {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .raghost-close-btn {
      width: 36px;
      height: 36px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all ${animationMs}ms ease;
    }
    
    .raghost-close-btn:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: rotate(90deg) scale(1.1);
    }
    
    .raghost-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .raghost-message {
      display: flex;
      gap: 8px;
      animation: messageSlide ${animationMs}ms ease;
    }
    
    @keyframes messageSlide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .raghost-message.bot {
      align-self: flex-start;
    }
    
    .raghost-message.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    
    .raghost-message-bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 16px;
      color: ${config.textColor};
    }
    
    .raghost-message.bot .raghost-message-bubble {
      background: rgba(${parseInt(config.primaryColor.slice(1, 3), 16)}, ${parseInt(config.primaryColor.slice(3, 5), 16)}, ${parseInt(config.primaryColor.slice(5, 7), 16)}, 0.1);
      border-bottom-left-radius: 4px;
    }
    
    .raghost-message.user .raghost-message-bubble {
      background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .raghost-input-area {
      padding: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 12px;
    }
    
    .raghost-input {
      flex: 1;
      padding: 12px;
      border: 2px solid rgba(${parseInt(config.primaryColor.slice(1, 3), 16)}, ${parseInt(config.primaryColor.slice(3, 5), 16)}, ${parseInt(config.primaryColor.slice(5, 7), 16)}, 0.3);
      border-radius: 12px;
      font-family: inherit;
      font-size: 14px;
      resize: none;
      outline: none;
      transition: all ${animationMs}ms ease;
    }
    
    .raghost-input:focus {
      border-color: ${config.primaryColor};
    }
    
    .raghost-send-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all ${animationMs}ms ease;
    }
    
    .raghost-send-btn:hover {
      transform: scale(1.05);
    }
    
    ${config.showWatermark ? `
    .raghost-watermark {
      padding: 8px 16px;
      text-align: center;
      font-size: 11px;
      color: #999;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .raghost-watermark a {
      color: ${config.primaryColor};
      text-decoration: none;
    }
    ` : ''}
  </style>
</head>
<body>
  <div class="raghost-container">
    <button class="raghost-chat-button" onclick="toggleChat()">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.29-3.86-.82l-.28-.15-2.9.49.49-2.9-.15-.28C4.29 14.68 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        <circle cx="9" cy="12" r="1"/>
        <circle cx="12" cy="12" r="1"/>
        <circle cx="15" cy="12" r="1"/>
      </svg>
    </button>
    
    <div class="raghost-chat-window" id="chatWindow">
      <div class="raghost-header">
        <div class="raghost-header-info">
          <div class="raghost-avatar">🤖</div>
          <div>
            <div class="raghost-bot-name">${bot?.name || 'AI Assistant'}</div>
            <div class="raghost-bot-status">Online • Ready to help</div>
          </div>
        </div>
        <button class="raghost-close-btn" onclick="toggleChat()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="raghost-messages">
        <div class="raghost-message bot">
          <div class="raghost-message-bubble">
            ${config.welcomeMessage}
          </div>
        </div>
      </div>
      
      <div class="raghost-input-area">
        <textarea class="raghost-input" rows="1" placeholder="Type your message..."></textarea>
        <button class="raghost-send-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
      
      ${config.showWatermark ? `
      <div class="raghost-watermark">
        Powered by <a href="https://raghost.com" target="_blank">RAGhost</a>
      </div>
      ` : ''}
    </div>
  </div>
  
  <script>
    function toggleChat() {
      document.getElementById('chatWindow').classList.toggle('open');
    }
  </script>
</body>
</html>`;
  };

  // Update iframe when config changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(generatePreviewHTML());
      doc.close();
    }
  }, [config, bot]);

  // Copy embed code
  const handleCopyCode = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const widgetUrl = window.location.origin;
    
    const embedCode = `<!-- RAGhost Custom Chat Widget -->
<script>
  (function() {
    window.RAGhostConfig = {
      botId: '${bot?.id}',
      apiUrl: '${apiUrl}',
      botName: '${bot?.name}',
      botType: '${bot?.type}',
      welcomeMessage: '${config.welcomeMessage}',
      // Custom styles
      primaryColor: '${config.primaryColor}',
      secondaryColor: '${config.secondaryColor}',
      width: ${config.width},
      height: ${config.height},
      position: '${config.position}',
      borderRadius: ${config.borderRadius},
      buttonSize: ${config.buttonSize},
      buttonStyle: '${config.buttonStyle}',
      fontFamily: '${config.fontFamily}',
      showWatermark: ${config.showWatermark},
      animationSpeed: '${config.animationSpeed}'
    };
    var script = document.createElement('script');
    script.src = '${widgetUrl}/widget-custom.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Widget Customizer
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Customize your chat widget with live preview
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Controls */}
          <div className="w-[400px] border-r border-gray-800 overflow-y-auto p-6 space-y-6 bg-[#0F0F0F] customizer-scrollbar">
            {/* Colors */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                Colors
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                    className="w-full h-10 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                    className="w-full h-10 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({...config, backgroundColor: e.target.value})}
                    className="w-full h-10 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-400" />
                Size
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Width: {config.width}px
                  </label>
                  <input
                    type="range"
                    min="300"
                    max="500"
                    value={config.width}
                    onChange={(e) => setConfig({...config, width: parseInt(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Height: {config.height}px
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="700"
                    value={config.height}
                    onChange={(e) => setConfig({...config, height: parseInt(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Button Size: {config.buttonSize}px
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="80"
                    value={config.buttonSize}
                    onChange={(e) => setConfig({...config, buttonSize: parseInt(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Position</h3>
              <div className="grid grid-cols-3 gap-2">
                {['bottom-left', 'bottom-center', 'bottom-right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setConfig({...config, position: pos})}
                    className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                      config.position === pos
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    {pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Style */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Button Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {['circle', 'rounded-square', 'square'].map(style => (
                  <button
                    key={style}
                    onClick={() => setConfig({...config, buttonStyle: style})}
                    className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                      config.buttonStyle === style
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    {style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3">
                Border Radius: {config.borderRadius}px
              </h3>
              <input
                type="range"
                min="8"
                max="32"
                value={config.borderRadius}
                onChange={(e) => setConfig({...config, borderRadius: parseInt(e.target.value)})}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Font Family */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-400" />
                Font Family
              </h3>
              <select
                value={config.fontFamily}
                onChange={(e) => setConfig({...config, fontFamily: e.target.value})}
                className="w-full p-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="Inter, sans-serif">Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Lato', sans-serif">Lato</option>
                <option value="system-ui, sans-serif">System Default</option>
              </select>
            </div>

            {/* Animation Speed */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Animation Speed</h3>
              <div className="grid grid-cols-3 gap-2">
                {['slow', 'normal', 'fast'].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setConfig({...config, animationSpeed: speed})}
                    className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                      config.animationSpeed === speed
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Welcome Message */}
            <div>
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Welcome Message</h3>
              <textarea
                value={config.welcomeMessage}
                onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm resize-none focus:border-purple-500 focus:outline-none placeholder-gray-500"
                placeholder="Enter welcome message..."
              />
            </div>

            {/* Show Watermark */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-200">Show Watermark</span>
              <button
                onClick={() => setConfig({...config, showWatermark: !config.showWatermark})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.showWatermark ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.showWatermark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-black p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Live Preview</h3>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium shadow-lg shadow-purple-500/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-2 border-gray-700">
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                title="Widget Preview"
              />
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              💡 Tip: Changes are reflected instantly in the preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCustomizer;
