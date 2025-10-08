import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';

const ApiKeysModal = ({ setShowModal, onSave }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!geminiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    setLoading(true);
    try {
      await onSave(geminiKey);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Configure Global Gemini API Key</h2>
          <button 
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-3 rounded-xl transition-all hover:rotate-90 duration-300"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6 p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-xl">
          <p className="text-sm text-gray-300">
            <strong>Note:</strong> This Gemini API key will be used by default for all your bots. 
            You can optionally configure individual Gemini keys for specific bots.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gemini Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent-pink/20 flex items-center justify-center">
                <span className="text-accent-pink font-bold">G</span>
              </div>
              <h3 className="text-lg font-bold">Gemini AI API Key</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-accent-pink transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent-pink hover:underline">Google AI Studio</a>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-pink text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Global Key'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeysModal;
