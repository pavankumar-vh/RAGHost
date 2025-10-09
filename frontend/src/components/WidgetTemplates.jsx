import React, { useState } from 'react';
import { Copy, Check, Sparkles, Zap, Moon, Palette, Sun, Building2 } from 'lucide-react';

const WidgetTemplates = ({ bot }) => {
  const [copied, setCopied] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'https://raghost-pcgw.onrender.com';
  const widgetUrl = 'https://rag-host.vercel.app';

  const templates = {
    // Template 1: Modern Gradient
    'modern-gradient': {
      name: 'Modern Gradient',
      icon: <Palette size={24} />,
      description: 'Sleek design with beautiful gradient backgrounds and glass effects',
      preview: 'Gradient with glass morphism',
      gradient: 'from-purple-500 via-blue-500 to-purple-600',
      code: `<!-- RAGhost Chat Widget - Modern Gradient -->
<script>
  window.RAGhostConfig = {
    botId: '${bot?.id}',
    apiUrl: '${apiUrl}',
    botName: '${bot?.name || 'AI Assistant'}',
    template: 'modern-gradient',
    welcomeMessage: 'Hi! How can I help you today? 👋'
  };
</script>
<script src="${widgetUrl}/widget/widget-new.js" async></script>`,
    },

    // Template 2: Glass Morphism
    'glass-morphism': {
      name: 'Glass Morphism',
      icon: <Sparkles size={24} />,
      description: 'Stunning frosted glass effect with backdrop blur',
      preview: 'Frosted glass premium look',
      gradient: 'from-blue-400 via-cyan-400 to-teal-400',
      code: `<!-- RAGhost Chat Widget - Glass Morphism -->
<script>
  window.RAGhostConfig = {
    botId: '${bot?.id}',
    apiUrl: '${apiUrl}',
    botName: '${bot?.name || 'AI Assistant'}',
    template: 'glass-morphism',
    welcomeMessage: 'Hi! How can I help you today? 👋'
  };
</script>
<script src="${widgetUrl}/widget/widget-new.js" async></script>`,
    },

    // Template 3: Minimal Dark
    'minimal-dark': {
      name: 'Minimal Dark',
      icon: <Moon size={24} />,
      description: 'Clean, minimal dark theme with sharp borders',
      preview: 'Dark mode minimalist',
      gradient: 'from-gray-800 via-gray-900 to-black',
      code: `<!-- RAGhost Chat Widget - Minimal Dark -->
<script>
  window.RAGhostConfig = {
    botId: '${bot?.id}',
    apiUrl: '${apiUrl}',
    botName: '${bot?.name || 'AI Assistant'}',
    template: 'minimal-dark',
    welcomeMessage: 'Hi! How can I help you today? 👋'
  };
</script>
<script src="${widgetUrl}/widget/widget-new.js" async></script>`,
    },

    // Template 4: Neon Glow
    'neon-glow': {
      name: 'Neon Glow',
      icon: <Zap size={24} />,
      description: 'Cyberpunk-inspired with neon cyan and magenta glows',
      preview: 'Neon cyberpunk style',
      gradient: 'from-cyan-500 via-purple-500 to-pink-500',
      code: `<!-- RAGhost Chat Widget - Neon Glow -->
<script>
  window.RAGhostConfig = {
    botId: '${bot?.id}',
    apiUrl: '${apiUrl}',
    botName: '${bot?.name || 'AI Assistant'}',
    template: 'neon-glow',
    welcomeMessage: 'Hi! How can I help you today? 👋'
  };
</script>
<script src="${widgetUrl}/widget/widget-new.js" async></script>`,
    },

    // Template 5: Soft Light
    'soft-light': {
      name: 'Soft Light',
      icon: <Sun size={24} />,
      description: 'Light theme with soft shadows and gentle gradients',
      preview: 'Clean professional light mode',
      gradient: 'from-gray-100 via-white to-gray-50',
      code: `<!-- RAGhost Chat Widget - Soft Light -->
<script>
  window.RAGhostConfig = {
    botId: '${bot?.id}',
    apiUrl: '${apiUrl}',
    botName: '${bot?.name || 'AI Assistant'}',
    template: 'soft-light',
    welcomeMessage: 'Hi! How can I help you today? 👋'
  };
</script>
<script src="${widgetUrl}/widget/widget-new.js" async></script>`,
    },

    // Template 6: Corporate
    'corporate': {
      name: 'Corporate',
      icon: <Building2 size={24} />,
      description: 'Professional business design with classic blue',
      preview: 'Corporate professional',
      gradient: 'from-blue-600 via-blue-500 to-blue-700',
      code: `<!-- RAGhost Chat Widget - Corporate -->
<script>
  window.RAGhostConfig = {
    botId: '${bot?.id}',
    apiUrl: '${apiUrl}',
    botName: '${bot?.name || 'AI Assistant'}',
    template: 'corporate',
    welcomeMessage: 'Hi! How can I help you today? 👋'
  };
</script>
<script src="${widgetUrl}/widget/widget-new.js" async></script>`,
    },
  };

  const copyToClipboard = async (code, templateName) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(templateName);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-accent-blue/10 to-accent-pink/10 border border-accent-blue/30 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-lg mb-2">Choose Your Widget Style</h3>
        <p className="text-sm text-gray-400">
          Select a template below and copy the code to your website. All templates feature a beautiful floating bubble design with markdown support for formatted AI responses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(templates).map(([key, template]) => (
          <div 
            key={key}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-accent-blue/50 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${template.gradient}`}>
                  <div className="text-white">
                    {template.icon}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.preview}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4">
              {template.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-black border border-gray-800 rounded-full text-xs">
                Floating Bubble
              </span>
              <span className="px-3 py-1 bg-black border border-gray-800 rounded-full text-xs">
                Markdown Support
              </span>
              <span className="px-3 py-1 bg-black border border-gray-800 rounded-full text-xs">
                Responsive
              </span>
            </div>

            {/* Code Preview */}
            <div className="bg-black border border-gray-800 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
              <pre className="text-xs text-green-400">
                <code>{template.code.substring(0, 150)}...</code>
              </pre>
            </div>

            {/* Copy Button */}
            <button
              onClick={() => copyToClipboard(template.code, key)}
              className={`w-full flex items-center justify-center gap-2 font-semibold px-4 py-3 rounded-lg transition-all ${
                copied === key
                  ? 'bg-green-500 text-white'
                  : bot?.color === 'pink'
                  ? 'bg-[#FF95DD] text-black hover:opacity-90'
                  : bot?.color === 'yellow'
                  ? 'bg-[#F6FF7F] text-black hover:opacity-90'
                  : 'bg-[#B7BEFE] text-black hover:opacity-90'
              }`}
            >
              {copied === key ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Code
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Additional Instructions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-accent-blue" />
          How to Use
        </h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue text-black flex items-center justify-center font-bold text-xs">1</span>
            <span>Choose a template that matches your website design</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue text-black flex items-center justify-center font-bold text-xs">2</span>
            <span>Click "Copy Code" to copy the embed code</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue text-black flex items-center justify-center font-bold text-xs">3</span>
            <span>Paste the code into your website before the closing <code className="px-2 py-1 bg-black rounded">&lt;/body&gt;</code> tag</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue text-black flex items-center justify-center font-bold text-xs">4</span>
            <span>Save and deploy your website - the widget will appear as a floating bubble!</span>
          </li>
        </ol>
      </div>

      {/* Features Highlight */}
      <div className="bg-gradient-to-r from-accent-pink/10 to-accent-yellow/10 border border-accent-pink/30 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Zap size={20} className="text-accent-yellow" />
          Widget Features
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span><strong>Markdown Formatting:</strong> Bold, italic, code blocks, links, and lists are automatically formatted</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span><strong>Smooth Animations:</strong> Beautiful open/close transitions and message slide-ins</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span><strong>Session Persistence:</strong> Conversations are saved and restored across page reloads</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span><strong>Mobile Responsive:</strong> Automatically adapts to mobile devices for the best experience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span><strong>Typing Indicator:</strong> Shows when the AI is thinking with animated dots</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span><strong>Zero Dependencies:</strong> Pure JavaScript - no frameworks required, ultra-lightweight</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WidgetTemplates;
