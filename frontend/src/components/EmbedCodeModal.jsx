import React, { useState, useEffect } from 'react';
import { X, Code, Copy, Check, Sparkles } from 'lucide-react';
import WidgetTemplates from './WidgetTemplates';
import WidgetCustomizerV2 from './WidgetCustomizerV2';

const EmbedCodeModal = ({ bot, setShowModal }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [iframeCode, setIframeCode] = useState('');
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'custom', or 'customizer'
  const [showCustomizer, setShowCustomizer] = useState(false);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [setShowModal]);

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

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
    <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-nb-bg border-2 border-black shadow-nb-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black bg-nb-blue/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center"><Code size={20} /></div>
            <div>
              <h2 className="text-xl font-bold text-nb-text">Embed Your Bot</h2>
              <p className="text-sm text-nb-muted">Add {bot?.name} to your website</p>
            </div>
          </div>
          <button onClick={() => setShowModal(false)} className="nb-btn bg-white p-2"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black bg-white">
          {[
            { id: 'templates', label: 'Widget Templates' },
            { id: 'customizer', label: '✨ Live Customizer', icon: Sparkles },
            { id: 'custom', label: 'Custom Embed' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-5 py-3 font-bold text-sm border-r-2 border-black transition-colors ${activeTab === id ? 'bg-nb-yellow text-black' : 'text-nb-muted hover:bg-gray-50 hover:text-black'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Templates Tab */}
          {activeTab === 'templates' && <WidgetTemplates bot={bot} />}

          {/* Live Customizer Tab */}
          {activeTab === 'customizer' && (
            <div className="bg-white border-2 border-black shadow-nb p-8 text-center">
              <div className="w-16 h-16 border-2 border-black bg-nb-yellow mx-auto mb-4 flex items-center justify-center">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Widget Customizer v2</h3>
              <p className="text-nb-muted text-sm mb-2 max-w-md mx-auto">8 theme presets, 20+ color controls, typography, animations, suggested replies, undo history and live viewport switching.</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs font-bold">
                {['8 Presets','Color Picker','Undo/Redo','Mobile Preview','Embed Code','Config Export'].map(f => (
                  <span key={f} className="px-2 py-1 border-2 border-black bg-nb-bg">{f}</span>
                ))}
              </div>
              <button onClick={() => setShowCustomizer(true)} className="nb-btn bg-black text-white border-black px-6 py-3 font-black">
                Open Customizer v2 →
              </button>
            </div>
          )}

          {/* Custom Embed Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-5">
              {/* Method 1 */}
              <div className="bg-white border-2 border-black shadow-nb-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold">Method 1: Script Tag (Recommended)</h3>
                    <p className="text-xs text-nb-muted mt-0.5">Add before the closing &lt;/body&gt; tag</p>
                  </div>
                  <button onClick={() => copyToClipboard(embedCode, 'script')}
                    className={`nb-btn px-3 py-1.5 text-xs ${copied === 'script' ? 'bg-green-200 border-green-600' : 'bg-nb-yellow border-black'}`}>
                    {copied === 'script' ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
                  </button>
                </div>
                <pre className="border-2 border-black bg-gray-900 text-green-400 font-mono text-xs p-4 overflow-x-auto"><code>{embedCode}</code></pre>
              </div>

              {/* Method 2 */}
              <div className="bg-white border-2 border-black shadow-nb-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold">Method 2: iFrame</h3>
                    <p className="text-xs text-nb-muted mt-0.5">Simple iframe embed</p>
                  </div>
                  <button onClick={() => copyToClipboard(iframeCode, 'iframe')}
                    className={`nb-btn px-3 py-1.5 text-xs ${copied === 'iframe' ? 'bg-green-200 border-green-600' : 'bg-nb-pink border-black'}`}>
                    {copied === 'iframe' ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
                  </button>
                </div>
                <pre className="border-2 border-black bg-gray-900 text-blue-400 font-mono text-xs p-4 overflow-x-auto"><code>{iframeCode}</code></pre>
              </div>

              {/* Instructions */}
              <div className="bg-white border-2 border-black shadow-nb-sm p-5">
                <h3 className="font-bold mb-3">Setup Instructions</h3>
                <ol className="space-y-2 text-sm text-nb-text">
                  {['Copy the embed code above', "Paste it into your website's HTML, before </body>", 'Save and publish your changes', 'The chat widget will appear on your site!'].map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-6 h-6 border-2 border-black bg-nb-yellow flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</div>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCustomizer && <WidgetCustomizerV2 bot={bot} onClose={() => setShowCustomizer(false)} />}
    </div>
  );
};

export default EmbedCodeModal;
