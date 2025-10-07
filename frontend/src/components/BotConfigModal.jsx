import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, Database, Zap, XCircle } from 'lucide-react';

const BotConfigModal = ({ setShowModal, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Support',
    description: '',
    color: 'pink',
    pineconeKey: '',
    pineconeEnvironment: '',
    pineconeIndexName: '',
    geminiKey: '',
  });
  const [showKeys, setShowKeys] = useState({
    pinecone: false,
    gemini: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('📝 Form submitted with data:', formData);
    
    // Validation
    if (!formData.name.trim()) {
      setError('Bot name is required');
      return;
    }

    if (!formData.pineconeKey || !formData.pineconeEnvironment || !formData.pineconeIndexName) {
      setError('Pinecone configuration is required for each bot');
      return;
    }

    if (!formData.geminiKey) {
      setError('Gemini API key is required for each bot');
      return;
    }

    setLoading(true);
    try {
      console.log('⏳ Calling onSave...');
      await onSave(formData);
      console.log('✨ Bot created, closing modal');
      setShowModal(false);
    } catch (err) {
      console.error('❌ Error in modal:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create bot. Please try again.';
      console.log('Error message to display:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-3xl p-8 w-full max-w-3xl my-8 shadow-2xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-pink/5 rounded-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Create New Bot
              </h2>
              <p className="text-gray-400 text-sm mt-1">Configure your AI assistant</p>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-fadeIn">
              <XCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bot Details */}
            <div className="space-y-4 p-6 bg-black/20 rounded-2xl border border-gray-800/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 flex items-center justify-center">
                  🤖
                </div>
                Bot Details
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Bot Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Customer Support Bot"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Bot Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all cursor-pointer"
                  >
                    <option value="Support">Support</option>
                    <option value="Sales">Sales</option>
                    <option value="Docs">Documentation</option>
                    <option value="General">General</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Color Theme</label>
                  <div className="flex gap-3">
                    {['pink', 'yellow', 'blue'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`relative w-12 h-12 rounded-xl bg-accent-${color} transition-all duration-300 hover:scale-110 ${
                          formData.color === color ? 'ring-4 ring-white/30 scale-110 shadow-lg shadow-accent-${color}/50' : 'opacity-70'
                        }`}
                      >
                        {formData.color === color && (
                          <div className="absolute inset-0 rounded-xl bg-white/20"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this bot does..."
                  rows={3}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Pinecone Configuration */}
            <div className="space-y-4 p-6 bg-black/20 rounded-2xl border border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 flex items-center justify-center shadow-lg shadow-accent-blue/10">
                  <Database size={24} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Pinecone Configuration *</h3>
                  <p className="text-xs text-gray-400">Each bot needs its own Pinecone index for its knowledge base</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">API Key *</label>
                <div className="relative">
                  <input
                    type={showKeys.pinecone ? "text" : "password"}
                    value={formData.pineconeKey}
                    onChange={(e) => setFormData({ ...formData, pineconeKey: e.target.value })}
                    placeholder="pcsk_xxxxx..."
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all font-mono text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, pinecone: !showKeys.pinecone })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-accent-blue p-1 rounded transition-colors"
                  >
                    {showKeys.pinecone ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Environment *</label>
                <input
                  type="text"
                  value={formData.pineconeEnvironment}
                  onChange={(e) => setFormData({ ...formData, pineconeEnvironment: e.target.value })}
                  placeholder="us-west-2-aws"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Index Name *</label>
                <input
                  type="text"
                  value={formData.pineconeIndexName}
                  onChange={(e) => setFormData({ ...formData, pineconeIndexName: e.target.value })}
                  placeholder="my-bot-index"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Gemini Configuration */}
          <div className="space-y-4 border-t border-gray-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-pink/20 flex items-center justify-center">
                <Zap size={20} className="text-accent-pink" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Gemini AI Configuration *</h3>
                <p className="text-xs text-gray-500">Each bot needs its own Gemini API key</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gemini API Key *</label>
              <div className="relative">
                <input
                  type={showKeys.gemini ? "text" : "password"}
                  value={formData.geminiKey}
                  onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-accent-pink transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showKeys.gemini ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 text-black font-bold py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin relative z-10" />
                  <span className="relative z-10">Creating Bot...</span>
                </>
              ) : (
                <span className="relative z-10">Create Bot 🚀</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BotConfigModal;
