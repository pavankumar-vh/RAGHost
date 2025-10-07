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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Code className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Widget Embed</h3>
          <p className="text-sm text-gray-500">Add this chatbot to your website</p>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Template
        </label>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                template === t.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{t.name}</div>
              <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateEmbed}
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 font-medium"
      >
        {loading ? 'Generating...' : 'Generate Embed Code'}
      </button>

      {/* Embed Code Display */}
      {embedCode && (
        <div className="space-y-3">
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Installation Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
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
