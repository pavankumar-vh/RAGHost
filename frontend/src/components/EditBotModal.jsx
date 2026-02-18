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
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
    }, 300); // Match animation duration
  };

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

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
      handleClose();
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
      className={`fixed inset-0 bg-black/60 flex items-center justify-end z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-nb-bg border-l-0 sm:border-l-2 border-black h-full w-full sm:max-w-2xl shadow-nb-xl overflow-y-auto transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ willChange: isClosing ? 'auto' : 'transform', transform: isClosing ? 'translate3d(100%, 0, 0)' : 'translate3d(0, 0, 0)' }}
      >
        <div className="p-4 sm:p-6">
          <div className="sticky top-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 bg-nb-bg border-b-2 border-black mb-4 sm:mb-6 z-20 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-nb-text">Edit Bot</h2>
              <p className="text-nb-muted text-sm mt-0.5">Update your AI assistant configuration</p>
            </div>
            <button type="button" onClick={handleClose} className="nb-btn bg-white p-2"><X size={20} /></button>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border-2 border-red-500 text-red-700 text-sm flex items-center gap-2">
              <XCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bot Details */}
            <div className="space-y-4 p-5 bg-white border-2 border-black shadow-nb-sm">
              <h3 className="text-base font-bold flex items-center gap-2">
                <div className="w-7 h-7 border-2 border-black bg-nb-yellow flex items-center justify-center text-sm">🤖</div>
                Bot Details
              </h3>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Bot Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Customer Support Bot" className="nb-input" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-nb-text">Bot Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="nb-input cursor-pointer">
                    <option value="Support">🎧 Customer Support</option>
                    <option value="Sales">💼 Sales Assistant</option>
                    <option value="Docs">📚 Documentation</option>
                    <option value="HR">👥 HR Assistant</option>
                    <option value="Ecommerce">🛒 E-commerce Shopping</option>
                    <option value="Education">🎓 Educational Tutor</option>
                    <option value="Healthcare">🏥 Healthcare Info</option>
                    <option value="Finance">💰 Financial Advisory</option>
                    <option value="Travel">✈️ Travel Planning</option>
                    <option value="Restaurant">🍽️ Restaurant Booking</option>
                    <option value="Legal">⚖️ Legal Information</option>
                    <option value="RealEstate">🏠 Real Estate</option>
                    <option value="General">🤖 General Purpose</option>
                    <option value="Custom">⚙️ Custom Bot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 text-nb-text">Color Theme</label>
                  <div className="flex gap-2">
                    {[{c:'pink',bg:'#FF6B9D'},{c:'yellow',bg:'#FFE500'},{c:'blue',bg:'#4D9FFF'}].map(({c,bg}) => (
                      <button key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                        className={`w-10 h-10 border-2 transition-all ${formData.color === c ? 'border-black shadow-nb-sm scale-110' : 'border-gray-300 hover:border-black'}`}
                        style={{backgroundColor: bg}} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Description (Optional)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief description..." rows={2} className="nb-input resize-none" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">System Prompt (Optional)</label>
                <textarea value={formData.systemPrompt} onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})} placeholder="Define how your bot should behave..." rows={3} className="nb-input resize-none" />
                <p className="text-xs text-nb-muted mt-1">💡 Leave empty to use default behavior based on bot type.</p>
              </div>
            </div>

            {/* Pinecone Configuration */}
            <div className="space-y-4 p-5 bg-white border-2 border-black shadow-nb-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border-2 border-black bg-nb-blue flex items-center justify-center"><Database size={18} /></div>
                  <div>
                    <h3 className="text-base font-bold">Pinecone Configuration</h3>
                    <p className="text-xs text-nb-muted">Leave API key blank to keep current</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border-2 ${bot?.pineconeVerified ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-500 bg-red-100 text-red-600'}`}>
                  {bot?.pineconeVerified ? <><CheckCircle2 size={11} />Verified</> : <><XCircle size={11} />Unverified</>}
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">API Key {formData.pineconeKey && <span className="text-nb-blue font-normal">(will update)</span>}</label>
                <div className="relative">
                  <input type={showKeys.pinecone ? 'text' : 'password'} value={formData.pineconeKey} onChange={(e) => setFormData({...formData, pineconeKey: e.target.value})} placeholder="pcsk_xxxxx... (leave blank to keep current)" className="nb-input pr-12 font-mono text-sm" />
                  <button type="button" onClick={() => setShowKeys({...showKeys, pinecone: !showKeys.pinecone})} className="absolute right-3 top-1/2 -translate-y-1/2 text-nb-muted hover:text-black p-1">
                    {showKeys.pinecone ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Pinecone Host URL *</label>
                <input type="text" value={formData.pineconeEnvironment} onChange={(e) => setFormData({...formData, pineconeEnvironment: e.target.value})} placeholder="https://test-le0abl6.svc.aped.pinecone.io" className="nb-input font-mono text-sm" required />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Index Name *</label>
                <input type="text" value={formData.pineconeIndexName} onChange={(e) => setFormData({...formData, pineconeIndexName: e.target.value})} placeholder="my-index" className="nb-input" required />
              </div>
            </div>

            {/* Gemini Configuration */}
            <div className="space-y-4 p-5 bg-white border-2 border-black shadow-nb-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border-2 border-black bg-nb-pink flex items-center justify-center"><Zap size={18} /></div>
                  <div>
                    <h3 className="text-base font-bold">Gemini AI Configuration</h3>
                    <p className="text-xs text-nb-muted">Leave blank to keep current key</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border-2 ${bot?.geminiVerified ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-500 bg-red-100 text-red-600'}`}>
                  {bot?.geminiVerified ? <><CheckCircle2 size={11} />Verified</> : <><XCircle size={11} />Unverified</>}
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Gemini API Key {formData.geminiKey && <span className="text-nb-pink font-normal">(will update)</span>}</label>
                <div className="relative">
                  <input type={showKeys.gemini ? 'text' : 'password'} value={formData.geminiKey} onChange={(e) => setFormData({...formData, geminiKey: e.target.value})} placeholder="AIzaSy... (leave blank to keep current)" className="nb-input pr-12" />
                  <button type="button" onClick={() => setShowKeys({...showKeys, gemini: !showKeys.gemini})} className="absolute right-3 top-1/2 -translate-y-1/2 text-nb-muted hover:text-black p-1">
                    {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="p-3 bg-nb-blue/20 border-2 border-black">
                <p className="text-xs text-nb-text">💡 Changing API keys resets verification status — bot will re-verify automatically.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleClose} className="nb-btn flex-1 bg-white py-3 justify-center">Cancel</button>
              <button type="submit" disabled={loading} className="nb-btn flex-1 bg-black text-white border-black hover:bg-gray-900 py-3 justify-center disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0">
                {loading ? <><Loader2 size={16} className="animate-spin" />Updating...</> : 'Update Bot ✨'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBotModal;
