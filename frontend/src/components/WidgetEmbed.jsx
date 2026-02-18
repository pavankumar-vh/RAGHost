import { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

const WidgetEmbed = ({ botId }) => {
  const [template, setTemplate] = useState('default');
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const templates = [
    { id: 'default', name: 'Default', desc: 'Full-featured gradient theme' },
    { id: 'minimal', name: 'Minimal', desc: 'Clean black & white' },
    { id: 'modern-dark', name: 'Modern Dark', desc: 'Dark theme with blue accents' },
    { id: 'glass', name: 'Glass', desc: 'Frosted glass effect' }
  ];

  const generateEmbed = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/widget/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          botId,
          template,
          customization: {
            botName: 'AI Assistant',
            primaryColor: '#3b82f6',
            position: 'bottom-right',
            avatar: '🤖'
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setEmbedCode(data.embedCode);
      }
    } catch (error) {
      console.error('Failed to generate embed code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-2 border-black shadow-nb p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 border-2 border-black bg-nb-blue flex items-center justify-center">
          <Code className="w-5 h-5 text-black" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-nb-text">Widget Templates</h3>
          <p className="text-sm text-nb-muted">Choose a beautiful template for your chatbot</p>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-nb-text mb-3">Choose Template</label>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`p-4 border-2 text-left transition-all ${
                template === t.id
                  ? 'border-black bg-nb-yellow shadow-nb-sm'
                  : 'border-black bg-nb-bg hover:bg-nb-yellow/30'
              }`}
            >
              <div className="font-bold text-nb-text">{t.name}</div>
              <div className="text-xs text-nb-muted mt-1">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateEmbed}
        disabled={loading}
        className="nb-btn w-full bg-black text-white border-black py-3 justify-center mb-4 disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
      >
        {loading ? 'Generating...' : 'Generate Embed Code'}
      </button>

      {/* Embed Code Display */}
      {embedCode && (
        <div className="space-y-3">
          <div className="relative">
            <pre className="border-2 border-black bg-gray-900 text-green-400 p-4 overflow-x-auto text-xs leading-relaxed font-mono">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 nb-btn bg-white border-black p-2"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-nb-muted" />
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-nb-blue/30 border-2 border-black p-4">
            <h4 className="font-bold text-nb-text mb-2">Installation Instructions:</h4>
            <ol className="text-sm text-nb-text space-y-1 list-decimal list-inside">
              <li>Copy the embed code above</li>
              <li>Paste it before the closing &lt;/body&gt; tag</li>
              <li>The chat widget will appear on your website</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetEmbed;
