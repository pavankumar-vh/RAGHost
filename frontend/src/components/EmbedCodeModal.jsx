import React, { useState } from 'react';
import { X, Code, Copy, Check } from 'lucide-react';
import WidgetEmbed from './WidgetEmbed';

const EmbedCodeModal = ({ bot, setShowModal }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [iframeCode, setIframeCode] = useState('');
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'custom'

  // Generate embed code
  React.useEffect(() => {
    if (bot) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const widgetUrl = window.location.origin;
      
      const scriptCode = `<!-- RAGhost Chat Widget -->
<script>
  (function() {
    window.raghostConfig = {
      botId: '${bot.id}',
      apiUrl: '${apiUrl}',
      botName: '${bot.name}',
      botType: '${bot.type}',
      color: '${bot.color}',
    };
    var script = document.createElement('script');
    script.src = '${widgetUrl}/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

      const iframe = `<!-- RAGhost Chat Widget (iframe) -->
<iframe 
  src="${widgetUrl}/chat/${bot.id}" 
  width="400" 
  height="600" 
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999;"
></iframe>`;

      setEmbedCode(scriptCode);
      setIframeCode(iframe);
    }
  }, [bot]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-8 w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Code size={28} />
              Embed Your Bot
            </h2>
            <p className="text-gray-500 mt-1">Add {bot?.name} to your website</p>
          </div>
          <button 
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'templates'
                ? 'text-accent-blue border-b-2 border-accent-blue'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Widget Templates
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'custom'
                ? 'text-accent-blue border-b-2 border-accent-blue'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Custom Embed
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <WidgetEmbed botId={bot?.id} />
          </div>
        )}

        {/* Custom Embed Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            {/* Method 1: Script Tag */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Method 1: Script Tag (Recommended)</h3>
                  <p className="text-sm text-gray-500 mt-1">Add this code before the closing &lt;/body&gt; tag</p>
                </div>
                <button
                  onClick={() => copyToClipboard(embedCode, 'script')}
                  className="flex items-center gap-2 bg-accent-blue text-black font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {copied === 'script' ? (
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
              <pre className="bg-black border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-green-400">{embedCode}</code>
              </pre>
            </div>

            {/* Method 2: iFrame */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Method 2: iFrame</h3>
                  <p className="text-sm text-gray-500 mt-1">Simple iframe embed (less customizable)</p>
                </div>
                <button
                  onClick={() => copyToClipboard(iframeCode, 'iframe')}
                  className="flex items-center gap-2 bg-accent-pink text-black font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {copied === 'iframe' ? (
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
              <pre className="bg-black border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-blue-400">{iframeCode}</code>
              </pre>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-accent-blue/10 via-accent-pink/10 to-accent-yellow/10 border border-accent-blue/30 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3">📱 Preview</h3>
              <p className="text-sm text-gray-400 mb-4">
                The chat widget will appear in the bottom-right corner of your website
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-accent-${bot?.color} flex items-center justify-center text-3xl shadow-lg`}>
                  💬
                </div>
                <div>
                  <p className="font-semibold">{bot?.name}</p>
                  <p className="text-xs text-gray-500">{bot?.type} Bot</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3">📋 Setup Instructions</h3>
              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2">
                  <span className="font-bold text-white">1.</span>
                  <span>Copy the embed code above (Method 1 or 2)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-white">2.</span>
                  <span>Paste it into your website's HTML, before the closing &lt;/body&gt; tag</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-white">3.</span>
                  <span>Save and publish your changes</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-white">4.</span>
                  <span>The chat widget will automatically appear on your site!</span>
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbedCodeModal;
