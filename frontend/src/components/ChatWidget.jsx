import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import axios from 'axios';

const ChatWidget = ({ botId, botName, botType, color = 'blue', apiUrl = 'http://localhost:5001' }) => {
  const [isOpen, setIsOpen] = useState(false);
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

    try {
      const response = await axios.post(
        `${apiUrl}/api/chat/${botId}/message`,
        {
          message: input,
          sessionId,
        }
      );

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 ${colors.bg} text-black rounded-full shadow-lg hover:scale-110 transition-transform z-[9999] flex items-center justify-center font-bold text-xl`}
      >
        💬
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-black border border-gray-800 rounded-2xl shadow-2xl z-[9999] transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } flex flex-col`}
    >
      {/* Header */}
      <div className={`${colors.bg} text-black rounded-t-2xl p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h3 className="font-bold">{botName}</h3>
            <p className="text-xs opacity-80">{botType} Bot</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-black/10 p-2 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-black/10 p-2 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0A0A]">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg mb-2">👋 Hello!</p>
                <p className="text-sm">How can I help you today?</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? `${colors.bg} text-black`
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-black rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-gray-700 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`${colors.bg} text-black p-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Powered by RAGhost
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
