import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import axios from 'axios';

const ChatWidget = ({ botId, botName, botType, color = 'blue', apiUrl = 'http://localhost:5001', isEmbedded = false, theme = 'classic' }) => {
  const [isOpen, setIsOpen] = useState(isEmbedded); // Auto-open if embedded
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random()}`);
  const messagesEndRef = useRef(null);

  const colorClasses = {
    pink: {
      bg: 'bg-[#FF95DD]',
      text: 'text-[#FF95DD]',
      border: 'border-[#FF95DD]',
      hover: 'hover:bg-[#FF95DD]/10',
    },
    yellow: {
      bg: 'bg-[#F6FF7F]',
      text: 'text-[#F6FF7F]',
      border: 'border-[#F6FF7F]',
      hover: 'hover:bg-[#F6FF7F]/10',
    },
    blue: {
      bg: 'bg-[#B7BEFE]',
      text: 'text-[#B7BEFE]',
      border: 'border-[#B7BEFE]',
      hover: 'hover:bg-[#B7BEFE]/10',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/chat/${botId}/history/${sessionId}`
      );
      if (response.data.success && response.data.data.messages) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    console.log('💬 Sending message to bot:', { botId, sessionId, message: input.substring(0, 50) });

    try {
      const response = await axios.post(
        `${apiUrl}/api/chat/${botId}/message`,
        {
          message: input,
          sessionId,
        }
      );
      
      console.log('✅ Chat response received:', response.data);

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen && !isEmbedded) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 ${colors.bg} text-black rounded-full shadow-lg hover:scale-110 transition-transform z-[9999] flex items-center justify-center font-bold text-xl`}
      >
        💬
      </button>
    );
  }

  // Embedded mode: full height/width of container
  if (isEmbedded) {
    return (
      <div className="w-full h-full bg-nb-bg border-2 border-black flex flex-col">
        {/* Header */}
        <div className={`${colors.bg} border-b-2 border-black p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center text-lg">🤖</div>
            <div>
              <h3 className="font-bold text-black">{botName}</h3>
              <p className="text-xs text-black/60">{botType} Bot</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-nb-bg">
          {messages.length === 0 && (
            <div className="text-center text-nb-muted mt-8">
              <p className="text-lg mb-2">👋 Hello!</p>
              <p className="text-sm">How can I help you today?</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] border-2 border-black px-4 py-2 ${
                msg.role === 'user' ? `${colors.bg} text-black` : 'bg-white text-nb-text'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="border-2 border-black bg-white px-4 py-3">
                <div className="w-4 h-4 border-2 border-black border-t-nb-yellow animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t-2 border-black bg-nb-bg">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              className="nb-input flex-1 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`nb-btn ${colors.bg} border-black p-2 disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0`}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-nb-muted mt-2 text-center">Powered by RAGhost</p>
        </div>
      </div>
    );
  }

  // Regular floating widget mode
  return (
    <div className={`fixed bottom-6 right-6 bg-nb-bg border-2 border-black shadow-nb z-[9999] transition-all ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    } flex flex-col`}>
      {/* Header */}
      <div className={`${colors.bg} border-b-2 border-black p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center text-lg">🤖</div>
          <div>
            <h3 className="font-bold text-black">{botName}</h3>
            <p className="text-xs text-black/60">{botType} Bot</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-black/10 p-2 transition-colors">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-2 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-nb-bg">
            {messages.length === 0 && (
              <div className="text-center text-nb-muted mt-8">
                <p className="text-lg mb-2">👋 Hello!</p>
                <p className="text-sm">How can I help you today?</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] border-2 border-black px-4 py-2 ${
                  msg.role === 'user' ? `${colors.bg} text-black` : 'bg-white text-nb-text'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="border-2 border-black bg-white px-4 py-3">
                  <div className="w-4 h-4 border-2 border-black border-t-nb-yellow animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t-2 border-black bg-nb-bg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="nb-input flex-1 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`nb-btn ${colors.bg} border-black p-2 disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0`}
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-nb-muted mt-2 text-center">Powered by RAGhost</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
