import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Loader2, Database, Zap, XCircle, CheckCircle2 } from 'lucide-react';

const EditBotModal = ({ bot, setShowModal, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Support',
    description: '',
    color: 'pink',
    pineconeKey: '',
    pineconeEnvironment: '',
    pineconeIndexName: '',
    geminiKey: '',
    systemPrompt: '',
  });
  const [showKeys, setShowKeys] = useState({
    pinecone: false,
    gemini: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data from bot prop
  useEffect(() => {
    if (bot) {
      setFormData({
        name: bot.name || '',
        type: bot.type || 'Support',
        description: bot.description || '',
        color: bot.color || 'pink',
        pineconeKey: '', // Don't pre-fill for security
        pineconeEnvironment: bot.pineconeEnvironment || '',
        pineconeIndexName: bot.pineconeIndexName || '',
        geminiKey: '', // Don't pre-fill for security
        systemPrompt: bot.systemPrompt || '',
      });
    }
  }, [bot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('📝 Form submitted with data:', formData);
    
    // Validation
    if (!formData.name.trim()) {
      setError('Bot name is required');
      return;
    }

    // Create update payload - only include changed fields
    const updateData = {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      color: formData.color,
      systemPrompt: formData.systemPrompt,
    };

    // Only include API keys if they were changed (non-empty)
    if (formData.pineconeKey) {
      updateData.pineconeKey = formData.pineconeKey;
    }
    if (formData.pineconeEnvironment && formData.pineconeEnvironment !== bot.pineconeEnvironment) {
      updateData.pineconeEnvironment = formData.pineconeEnvironment;
    }
    if (formData.pineconeIndexName && formData.pineconeIndexName !== bot.pineconeIndexName) {
      updateData.pineconeIndexName = formData.pineconeIndexName;
    }
    if (formData.geminiKey) {
      updateData.geminiKey = formData.geminiKey;
    }

    setLoading(true);
    try {
      console.log('⏳ Calling onSave with bot ID:', bot.id);
      await onSave(bot.id, updateData);
      console.log('✨ Bot updated, closing modal');
      setShowModal(false);
    } catch (err) {
      console.error('❌ Error in modal:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update bot. Please try again.';
      console.log('Error message to display:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget) {
          setShowModal(false);
        }
      }}
    >
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-3xl p-8 w-full max-w-3xl my-8 shadow-2xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-pink/5 rounded-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Edit Bot
              </h2>
              <p className="text-gray-400 text-sm mt-1">Update your AI assistant configuration</p>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(false);
              }}
              className="text-gray-500 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-all z-50"
              aria-label="Close modal"
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

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  System Prompt (Optional) 🎯
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="Define how your bot should behave and respond. Example: You are a friendly customer support agent who helps users with technical issues. Always be polite and provide step-by-step solutions."
                  rows={4}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 This controls how your bot responds. Leave empty to use default behavior based on bot type.
                </p>
              </div>
            </div>

            {/* Pinecone Configuration */}
            <div className="space-y-4 p-6 bg-black/20 rounded-2xl border border-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 flex items-center justify-center shadow-lg shadow-accent-blue/10">
                    <Database size={24} className="text-accent-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Pinecone Configuration</h3>
                    <p className="text-xs text-gray-400">Leave API key blank to keep current key</p>
                  </div>
                </div>
                {bot?.pineconeVerified ? (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 size={14} />
                    <span>Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <XCircle size={14} />
                    <span>Not Verified</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  API Key {formData.pineconeKey && <span className="text-accent-blue">(Will be updated)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showKeys.pinecone ? "text" : "password"}
                    value={formData.pineconeKey}
                    onChange={(e) => setFormData({ ...formData, pineconeKey: e.target.value })}
                    placeholder="pcsk_xxxxx... (leave blank to keep current)"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all font-mono text-sm"
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

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Pinecone Host URL *</label>
                  <input
                    type="text"
                    value={formData.pineconeEnvironment}
                    onChange={(e) => setFormData({ ...formData, pineconeEnvironment: e.target.value })}
                    placeholder="https://test-le0abl6.svc.aped-4627-b74a.pinecone.io"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Copy the full host URL from your Pinecone dashboard</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Index Name *</label>
                  <input
                    type="text"
                    value={formData.pineconeIndexName}
                    onChange={(e) => setFormData({ ...formData, pineconeIndexName: e.target.value })}
                    placeholder="test"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">The name of your Pinecone index</p>
                </div>
              </div>
            </div>

            {/* Gemini Configuration */}
            <div className="space-y-4 p-6 bg-black/20 rounded-2xl border border-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-pink/20 to-accent-pink/10 flex items-center justify-center shadow-lg shadow-accent-pink/10">
                    <Zap size={24} className="text-accent-pink" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Gemini AI Configuration</h3>
                    <p className="text-xs text-gray-400">Leave API key blank to keep current key</p>
                  </div>
                </div>
                {bot?.geminiVerified ? (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 size={14} />
                    <span>Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <XCircle size={14} />
                    <span>Not Verified</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Gemini API Key {formData.geminiKey && <span className="text-accent-pink">(Will be updated)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showKeys.gemini ? "text" : "password"}
                    value={formData.geminiKey}
                    onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                    placeholder="AIzaSy... (leave blank to keep current)"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-accent-pink p-1 rounded transition-colors"
                  >
                    {showKeys.gemini ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-accent-blue/5 border border-accent-blue/20 rounded-lg">
                <p className="text-xs text-gray-400">
                  💡 <strong>Tip:</strong> Changing API keys will reset verification status. The bot will automatically re-verify the new keys.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex-1 bg-gradient-to-r from-accent-blue to-accent-blue/80 text-black font-bold py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin relative z-10" />
                    <span className="relative z-10">Updating Bot...</span>
                  </>
                ) : (
                  <span className="relative z-10">Update Bot ✨</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBotModal;
