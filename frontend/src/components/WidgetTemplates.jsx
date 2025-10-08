import React, { useState } from 'react';
import { Copy, Check, Monitor, MessageCircle, Sparkles, Zap } from 'lucide-react';

const WidgetTemplates = ({ bot }) => {
  const [copied, setCopied] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const widgetUrl = window.location.origin;

  const templates = {
    // Template 1: Classic Bubble (Default)
    classic: {
      name: 'Classic Bubble',
      icon: <MessageCircle size={24} />,
      description: 'Traditional chat bubble in bottom-right corner',
      preview: 'Bottom-right floating bubble',
      code: `<!-- RAGhost Chat Widget - Classic Bubble -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?theme=classic"
  style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 9999;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'bottom-right',
        size: 'medium',
        shape: 'circle'
      }
    },

    // Template 2: Fullscreen Sidebar
    sidebar: {
      name: 'Fullscreen Sidebar',
      icon: <Monitor size={24} />,
      description: 'Slide-in sidebar from right edge',
      preview: 'Full-height sidebar panel',
      code: `<!-- RAGhost Chat Widget - Sidebar -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?theme=sidebar"
  style="position: fixed; top: 0; right: 0; width: 400px; height: 100vh; border: none; box-shadow: -4px 0 20px rgba(0,0,0,0.3); z-index: 9999;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'right',
        size: 'large',
        shape: 'rectangle'
      }
    },

    // Template 3: Minimal Popup
    minimal: {
      name: 'Minimal Popup',
      icon: <Sparkles size={24} />,
      description: 'Small, elegant popup window',
      preview: 'Compact chat window',
      code: `<!-- RAGhost Chat Widget - Minimal -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?theme=minimal"
  style="position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; border: none; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.25); z-index: 9999;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'bottom-right',
        size: 'small',
        shape: 'rounded'
      }
    },

    // Template 4: Inline Embed
    inline: {
      name: 'Inline Embed',
      icon: <Zap size={24} />,
      description: 'Embedded directly in page content',
      preview: 'Inline chat interface',
      code: `<!-- RAGhost Chat Widget - Inline -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?theme=inline"
  style="width: 100%; max-width: 800px; height: 600px; border: 1px solid #e5e7eb; border-radius: 12px; margin: 20px auto; display: block;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'inline',
        size: 'flexible',
        shape: 'container'
      }
    },

    // Template 5: Bottom Bar
    bottomBar: {
      name: 'Bottom Bar',
      icon: <MessageCircle size={24} />,
      description: 'Full-width bar at bottom of page',
      preview: 'Fixed bottom bar',
      code: `<!-- RAGhost Chat Widget - Bottom Bar -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?theme=bottombar"
  style="position: fixed; bottom: 0; left: 0; width: 100%; height: 80px; border: none; border-top: 1px solid #e5e7eb; box-shadow: 0 -4px 20px rgba(0,0,0,0.1); z-index: 9999;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'bottom',
        size: 'full-width',
        shape: 'bar'
      }
    },

    // Template 6: Custom Styled
    custom: {
      name: 'Custom Styled',
      icon: <Sparkles size={24} />,
      description: 'Fully customizable with CSS variables',
      preview: 'Your brand colors',
      code: `<!-- RAGhost Chat Widget - Custom Styled -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?color=${bot?.color}"
  style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 9999;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'bottom-right',
        size: 'medium',
        shape: 'custom'
      }
    },

    // Template 7: Mobile Optimized
    mobile: {
      name: 'Mobile Optimized',
      icon: <Monitor size={24} />,
      description: 'Responsive design for mobile devices',
      preview: 'Mobile-first layout',
      code: `<!-- RAGhost Chat Widget - Mobile Optimized -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?mobile=true"
  style="position: fixed; bottom: 20px; right: 20px; width: min(400px, calc(100vw - 40px)); height: min(600px, calc(100vh - 100px)); border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 9999;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'adaptive',
        size: 'responsive',
        shape: 'adaptive'
      }
    },

    // Template 8: FAB Style (Floating Action Button)
    fab: {
      name: 'FAB Style',
      icon: <Zap size={24} />,
      description: 'Material Design floating action button',
      preview: 'Round FAB with ripple',
      code: `<!-- RAGhost Chat Widget - FAB Style -->
<iframe 
  id="raghost-widget-${bot?.id}"
  src="${widgetUrl}/embed/${bot?.id}?theme=fab"
  style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 9999;"
  allow="clipboard-write"
></iframe>`,
      style: {
        position: 'bottom-right',
        size: 'large',
        shape: 'circle'
      }
    }
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
          Select a template below and copy the code to your website. Each template is fully functional and customizable.
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
                <div className={`p-3 rounded-lg ${
                  bot?.color === 'pink' ? 'bg-[#FF95DD]/20 text-[#FF95DD]' :
                  bot?.color === 'yellow' ? 'bg-[#F6FF7F]/20 text-[#F6FF7F]' :
                  'bg-[#B7BEFE]/20 text-[#B7BEFE]'
                }`}>
                  {template.icon}
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

            {/* Style Info */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-black border border-gray-800 rounded-full text-xs">
                {template.style.position}
              </span>
              <span className="px-3 py-1 bg-black border border-gray-800 rounded-full text-xs">
                {template.style.size}
              </span>
              <span className="px-3 py-1 bg-black border border-gray-800 rounded-full text-xs">
                {template.style.shape}
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
            <span>Save and deploy your website - the widget will appear automatically!</span>
          </li>
        </ol>
      </div>

      {/* Customization Tips */}
      <div className="bg-gradient-to-r from-accent-pink/10 to-accent-yellow/10 border border-accent-pink/30 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Zap size={20} className="text-accent-yellow" />
          Customization Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span>Modify <code className="px-2 py-1 bg-black rounded">width</code> and <code className="px-2 py-1 bg-black rounded">height</code> values to resize the widget</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span>Change <code className="px-2 py-1 bg-black rounded">position</code> to place the widget in different corners</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span>Use CSS variables in the Custom Styled template to match your brand colors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-yellow mt-1">•</span>
            <span>The Mobile Optimized template automatically adjusts for different screen sizes</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WidgetTemplates;
