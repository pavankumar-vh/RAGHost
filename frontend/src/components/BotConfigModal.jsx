import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, Database, Zap } from 'lucide-react';

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
      await onSave(formData);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-8 w-full max-w-3xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Bot</h2>
          <button 
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bot Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              🤖 Bot Details
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2">Bot Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Customer Support Bot"
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bot Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                >
                  <option value="Support">Support</option>
                  <option value="Sales">Sales</option>
                  <option value="Docs">Documentation</option>
                  <option value="General">General</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color Theme</label>
                <div className="flex gap-3">
                  {['pink', 'yellow', 'blue'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-12 h-12 rounded-xl bg-accent-${color} ${
                        formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this bot does..."
                rows={3}
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors resize-none"
              />
            </div>
          </div>

          {/* Pinecone Configuration */}
          <div className="space-y-4 border-t border-gray-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <Database size={20} className="text-accent-blue" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pinecone Configuration *</h3>
                <p className="text-xs text-gray-500">Each bot needs its own Pinecone index for its knowledge base</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">API Key *</label>
              <div className="relative">
                <input
                  type={showKeys.pinecone ? "text" : "password"}
                  value={formData.pineconeKey}
                  onChange={(e) => setFormData({ ...formData, pineconeKey: e.target.value })}
                  placeholder="pcsk_xxxxx..."
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-accent-blue transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, pinecone: !showKeys.pinecone })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showKeys.pinecone ? <EyeOff size={20} /> : <Eye size={20} />}
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
            className="w-full bg-accent-blue text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating Bot...
              </>
            ) : (
              'Create Bot'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BotConfigModal;
