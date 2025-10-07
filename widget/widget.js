/**
 * RAGhost Chat Widget
 * Universal widget script for all templates
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    botId: window.RAGhostConfig?.botId || 'demo',
    apiUrl: window.RAGhostConfig?.apiUrl || 'http://localhost:5001',
    botName: window.RAGhostConfig?.botName || 'AI Assistant',
    botType: window.RAGhostConfig?.botType || 'Support',
    color: window.RAGhostConfig?.color || 'blue',
    position: window.RAGhostConfig?.position || 'bottom-right',
    welcomeMessage: window.RAGhostConfig?.welcomeMessage || 'Hi! How can I help you today?',
  };

  // Elements
  const chatButton = document.getElementById('raghost-chat-button');
  const chatWindow = document.getElementById('raghost-chat-window');
  const closeBtn = document.getElementById('raghost-close-btn');
  const messagesContainer = document.getElementById('raghost-messages');
  const input = document.getElementById('raghost-input');
  const sendBtn = document.getElementById('raghost-send-btn');
  const botNameEl = document.getElementById('raghost-bot-name');

  // Session management
  let sessionId = getSessionId();
  let isTyping = false;

  // Initialize
  function init() {
    if (botNameEl) {
      botNameEl.textContent = config.botName;
    }

    // Event listeners
    if (chatButton) {
      chatButton.addEventListener('click', toggleChat);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeChat);
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', handleSendMessage);
    }

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      });
    }

    console.log('RAGhost Widget initialized', config);
  }

  // Session ID management
  function getSessionId() {
    let sid = localStorage.getItem('raghost-session-id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('raghost-session-id', sid);
    }
    return sid;
  }

  // Toggle chat window
  function toggleChat() {
    if (chatWindow) {
      chatWindow.classList.toggle('open');
      if (chatWindow.classList.contains('open') && input) {
        input.focus();
      }
    }
  }

  // Close chat window
  function closeChat() {
    if (chatWindow) {
      chatWindow.classList.remove('open');
    }
  }

  // Handle send message
  function handleSendMessage() {
    const message = input?.value.trim();
    if (!message || isTyping) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    const typingEl = showTyping();
    isTyping = true;

    // Send to API
    sendMessageToAPI(message)
      .then(response => {
        if (typingEl) typingEl.remove();
        isTyping = false;

        if (response.success && response.data && response.data.response) {
          addMessage(response.data.response, 'bot');
        } else if (response.error) {
          addMessage(`Error: ${response.error}`, 'bot');
        } else {
          addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
      })
      .catch(error => {
        if (typingEl) typingEl.remove();
        isTyping = false;
        console.error('Chat error:', error);
        addMessage('Sorry, I could not connect to the server. Please try again later.', 'bot');
      });
  }

  // Send message to API
  async function sendMessageToAPI(message) {
    const response = await fetch(`${config.apiUrl}/api/chat/${config.botId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Add message to chat
  function addMessage(text, type) {
    if (!messagesContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `raghost-message ${type}`;
    
    // Check if template uses avatars
    const hasAvatars = messagesContainer.querySelector('.raghost-message-avatar');
    
    if (hasAvatars) {
      const avatar = document.createElement('div');
      avatar.className = 'raghost-message-avatar';
      avatar.textContent = type === 'user' ? '👤' : '🤖';
      messageEl.appendChild(avatar);
    }

    const content = document.createElement('div');
    content.className = hasAvatars ? 'raghost-message-content' : '';

    const bubble = document.createElement('div');
    bubble.className = 'raghost-message-bubble';
    bubble.textContent = text;

    content.appendChild(bubble);

    // Check if template uses timestamps
    if (hasAvatars) {
      const time = document.createElement('div');
      time.className = 'raghost-message-time';
      time.textContent = formatTime(new Date());
      content.appendChild(time);
    }

    messageEl.appendChild(content);
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
  }

  // Show typing indicator
  function showTyping() {
    if (!messagesContainer) return null;

    const messageEl = document.createElement('div');
    messageEl.className = 'raghost-message bot';
    
    const hasAvatars = messagesContainer.querySelector('.raghost-message-avatar');
    
    if (hasAvatars) {
      const avatar = document.createElement('div');
      avatar.className = 'raghost-message-avatar';
      avatar.textContent = '🤖';
      messageEl.appendChild(avatar);
    }

    const content = document.createElement('div');
    content.className = hasAvatars ? 'raghost-message-content' : '';

    const typing = document.createElement('div');
    typing.className = 'raghost-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    content.appendChild(typing);
    messageEl.appendChild(content);
    
    messagesContainer.appendChild(messageEl);
    scrollToBottom();

    return messageEl;
  }

  // Scroll to bottom
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Format time
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.RAGhostWidget = {
    open: toggleChat,
    close: closeChat,
    sendMessage: (text) => {
      if (input) input.value = text;
      handleSendMessage();
    },
    getSessionId: () => sessionId,
    resetSession: () => {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('raghost-session-id', sessionId);
    }
  };
})();
