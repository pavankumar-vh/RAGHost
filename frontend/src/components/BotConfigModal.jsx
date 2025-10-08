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
    systemPrompt: '',
  });
  const [showKeys, setShowKeys] = useState({
    pinecone: false,
    gemini: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bot type templates with pre-configured system prompts
  const botTemplates = {
    'Support': {
      name: 'Customer Support Bot',
      description: 'Helps users with technical issues and questions',
      systemPrompt: 'You are a friendly and helpful customer support agent. Your goal is to assist users with their technical issues, answer questions clearly, and provide step-by-step solutions. Always be patient, polite, and professional. If you don\'t know the answer, guide users to the appropriate resources or escalate to a human agent.',
      color: 'blue'
    },
    'Sales': {
      name: 'Sales Assistant Bot',
      description: 'Engages leads and helps with product inquiries',
      systemPrompt: 'You are an enthusiastic sales assistant who helps potential customers understand our products and services. Focus on understanding customer needs, highlighting key benefits, and guiding them toward the best solution. Be persuasive but not pushy. Always ask qualifying questions to better understand their requirements.',
      color: 'yellow'
    },
    'Docs': {
      name: 'Documentation Assistant',
      description: 'Helps users navigate and understand documentation',
      systemPrompt: 'You are a technical documentation assistant. Help users find relevant information in the documentation, explain technical concepts clearly, and provide code examples when needed. Break down complex topics into simple, easy-to-understand explanations. Always cite the specific documentation sections you reference.',
      color: 'blue'
    },
    'HR': {
      name: 'HR Assistant Bot',
      description: 'Handles employee inquiries about policies and benefits',
      systemPrompt: 'You are a professional HR assistant who helps employees with questions about company policies, benefits, leave requests, and general HR procedures. Maintain confidentiality, be empathetic, and provide accurate information. For sensitive matters, direct employees to contact HR directly.',
      color: 'pink'
    },
    'Ecommerce': {
      name: 'E-commerce Shopping Assistant',
      description: 'Helps customers find and purchase products',
      systemPrompt: 'You are a helpful shopping assistant for an e-commerce platform. Help customers find products that match their needs, answer questions about specifications, shipping, returns, and payment options. Suggest relevant products and upsell when appropriate. Always prioritize customer satisfaction.',
      color: 'yellow'
    },
    'Education': {
      name: 'Educational Tutor Bot',
      description: 'Assists students with learning and homework',
      systemPrompt: 'You are a patient and encouraging educational tutor. Help students understand concepts, guide them through problems step-by-step, and provide helpful explanations. Never give direct answers to homework questions - instead, help students learn by asking guiding questions. Adapt your teaching style to the student\'s level.',
      color: 'blue'
    },
    'Healthcare': {
      name: 'Healthcare Information Bot',
      description: 'Provides general health information and appointment help',
      systemPrompt: 'You are a healthcare information assistant. Provide general health information, help schedule appointments, and answer non-medical questions about services, hours, and procedures. IMPORTANT: Always clarify that you cannot provide medical advice or diagnoses. Direct users to consult healthcare professionals for medical concerns.',
      color: 'pink'
    },
    'Finance': {
      name: 'Financial Advisory Bot',
      description: 'Helps with financial queries and banking services',
      systemPrompt: 'You are a financial assistant who helps users with banking services, account information, transaction queries, and general financial literacy. Explain financial concepts clearly, help with budget planning, and guide users through banking procedures. Always emphasize security and never ask for sensitive information like passwords or full card numbers.',
      color: 'yellow'
    },
    'Travel': {
      name: 'Travel Planning Assistant',
      description: 'Helps users plan trips and find travel information',
      systemPrompt: 'You are an enthusiastic travel planning assistant. Help users plan their trips, suggest destinations, provide information about accommodations, transportation, and local attractions. Ask about their preferences, budget, and interests to provide personalized recommendations. Share travel tips and safety information.',
      color: 'blue'
    },
    'Restaurant': {
      name: 'Restaurant Booking Bot',
      description: 'Handles reservations and menu inquiries',
      systemPrompt: 'You are a friendly restaurant assistant. Help customers make reservations, answer questions about the menu, dietary restrictions, and special events. Provide recommendations based on customer preferences, inform about wait times, and assist with special requests. Always be warm and welcoming.',
      color: 'yellow'
    },
    'Legal': {
      name: 'Legal Information Assistant',
      description: 'Provides general legal information and resources',
      systemPrompt: 'You are a legal information assistant. Provide general legal information, explain legal processes, and guide users to appropriate resources. IMPORTANT: Always clarify that you cannot provide legal advice and users should consult with a licensed attorney for specific legal matters. Be clear, precise, and avoid complex legal jargon.',
      color: 'blue'
    },
    'RealEstate': {
      name: 'Real Estate Assistant',
      description: 'Helps with property searches and inquiries',
      systemPrompt: 'You are a knowledgeable real estate assistant. Help users search for properties, answer questions about listings, neighborhoods, pricing, and the buying/renting process. Ask about their requirements, budget, and preferences to provide relevant property suggestions. Be informative and helpful throughout their property search journey.',
      color: 'pink'
    },
    'General': {
      name: 'General Purpose Bot',
      description: 'Versatile assistant for various tasks',
      systemPrompt: 'You are a helpful and versatile AI assistant. Assist users with a wide range of questions and tasks. Be friendly, professional, and adapt your communication style to the user\'s needs. Provide accurate information and helpful suggestions.',
      color: 'blue'
    },
    'Custom': {
      name: 'Custom Bot',
      description: 'Create your own specialized bot',
      systemPrompt: '',
      color: 'pink'
    }
  };

  // Handle bot type change and auto-fill template
  const handleTypeChange = (type) => {
    const template = botTemplates[type];
    if (template && formData.name === '' || formData.name === botTemplates[formData.type]?.name) {
      setFormData({
        ...formData,
        type,
        name: template.name,
        description: template.description,
        systemPrompt: template.systemPrompt,
        color: template.color
      });
    } else {
      setFormData({ ...formData, type });
    }
  };

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
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all cursor-pointer"
                  >
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
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Selecting a template auto-fills name, description & prompt
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Color Theme</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, color: 'pink' })}
                      className={`relative w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 ${
                        formData.color === 'pink' ? 'ring-4 ring-white/30 scale-110 shadow-xl' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: '#FF6B9D' }}
                    >
                      {formData.color === 'pink' && (
                        <div className="absolute inset-0 rounded-xl bg-white/20"></div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, color: 'yellow' })}
                      className={`relative w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 ${
                        formData.color === 'yellow' ? 'ring-4 ring-white/30 scale-110 shadow-xl' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: '#FEC84B' }}
                    >
                      {formData.color === 'yellow' && (
                        <div className="absolute inset-0 rounded-xl bg-white/20"></div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, color: 'blue' })}
                      className={`relative w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 ${
                        formData.color === 'blue' ? 'ring-4 ring-white/30 scale-110 shadow-xl' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: '#7DD3FC' }}
                    >
                      {formData.color === 'blue' && (
                        <div className="absolute inset-0 rounded-xl bg-white/20"></div>
                      )}
                    </button>
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

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pinecone Host URL *</label>
                <input
                  type="text"
                  value={formData.pineconeEnvironment}
                  onChange={(e) => setFormData({ ...formData, pineconeEnvironment: e.target.value })}
                  placeholder="https://test-le0abl6.svc.aped-4627-b74a.pinecone.io"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Copy the full host URL from your Pinecone dashboard</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Index Name *</label>
                <input
                  type="text"
                  value={formData.pineconeIndexName}
                  onChange={(e) => setFormData({ ...formData, pineconeIndexName: e.target.value })}
                  placeholder="test"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The name of your Pinecone index</p>
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
