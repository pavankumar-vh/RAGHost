import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Loader2, Database, Zap, XCircle } from 'lucide-react';

const BotConfigModal = ({ setShowModal, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setShowModal(false), 300);
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
      handleClose();
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
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-nb-bg border-l-2 border-black w-full max-w-2xl h-full overflow-y-auto shadow-nb-xl transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isClosing ? 'translate3d(100%, 0, 0)' : 'translate3d(0, 0, 0)'
        }}
      >
        <div className="p-6">
          {/* Sticky Header */}
          <div className="sticky top-0 -mx-6 px-6 py-4 bg-nb-bg border-b-2 border-black mb-6 z-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-nb-text">Create New Bot</h2>
                <p className="text-nb-muted text-sm mt-0.5">Configure your AI assistant</p>
              </div>
              <button onClick={handleClose} className="nb-btn bg-white p-2"><X size={20} /></button>
            </div>
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
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Customer Support Bot" className="nb-input" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-nb-text">Bot Type *</label>
                  <select value={formData.type} onChange={(e) => handleTypeChange(e.target.value)}
                    className="nb-input cursor-pointer">
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
                  <p className="text-xs text-nb-muted mt-1">💡 Selecting a template auto-fills fields</p>
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
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief description of what this bot does..." rows={2} className="nb-input resize-none" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">System Prompt (Optional)</label>
                <textarea value={formData.systemPrompt} onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})} placeholder="Define how your bot should behave..." rows={3} className="nb-input resize-none" />
                <p className="text-xs text-nb-muted mt-1">💡 Leave empty to use default behavior based on bot type.</p>
              </div>
            </div>

            {/* Pinecone Configuration */}
            <div className="space-y-4 p-5 bg-white border-2 border-black shadow-nb-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border-2 border-black bg-nb-blue flex items-center justify-center"><Database size={18} /></div>
                <div>
                  <h3 className="text-base font-bold">Pinecone Configuration *</h3>
                  <p className="text-xs text-nb-muted">Each bot needs its own Pinecone index</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">API Key *</label>
                <div className="relative">
                  <input type={showKeys.pinecone ? 'text' : 'password'} value={formData.pineconeKey} onChange={(e) => setFormData({...formData, pineconeKey: e.target.value})} placeholder="pcsk_xxxxx..." className="nb-input pr-12 font-mono text-sm" required />
                  <button type="button" onClick={() => setShowKeys({...showKeys, pinecone: !showKeys.pinecone})} className="absolute right-3 top-1/2 -translate-y-1/2 text-nb-muted hover:text-black p-1">
                    {showKeys.pinecone ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Pinecone Host URL *</label>
                <input type="text" value={formData.pineconeEnvironment} onChange={(e) => setFormData({...formData, pineconeEnvironment: e.target.value})} placeholder="https://test-le0abl6.svc.aped-4627-b74a.pinecone.io" className="nb-input font-mono text-sm" required />
                <p className="text-xs text-nb-muted mt-1">Copy the full host URL from your Pinecone dashboard</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Index Name *</label>
                <input type="text" value={formData.pineconeIndexName} onChange={(e) => setFormData({...formData, pineconeIndexName: e.target.value})} placeholder="my-index" className="nb-input" required />
                <p className="text-xs text-nb-muted mt-1">The name of your Pinecone index</p>
              </div>
            </div>

            {/* Gemini Configuration */}
            <div className="space-y-4 p-5 bg-white border-2 border-black shadow-nb-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border-2 border-black bg-nb-pink flex items-center justify-center"><Zap size={18} /></div>
                <div>
                  <h3 className="text-base font-bold">Gemini AI Configuration *</h3>
                  <p className="text-xs text-nb-muted">Each bot needs its own Gemini API key</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-nb-text">Gemini API Key *</label>
                <div className="relative">
                  <input type={showKeys.gemini ? 'text' : 'password'} value={formData.geminiKey} onChange={(e) => setFormData({...formData, geminiKey: e.target.value})} placeholder="AIzaSy..." className="nb-input pr-12" required />
                  <button type="button" onClick={() => setShowKeys({...showKeys, gemini: !showKeys.gemini})} className="absolute right-3 top-1/2 -translate-y-1/2 text-nb-muted hover:text-black p-1">
                    {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="nb-btn w-full bg-black text-white border-black hover:bg-gray-900 py-3 justify-center text-base disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0">
              {loading ? <><Loader2 size={18} className="animate-spin" />Creating Bot...</> : 'Create Bot 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BotConfigModal;
