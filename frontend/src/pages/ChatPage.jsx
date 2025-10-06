import React from 'react';
import { useParams } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

const ChatPage = () => {
  const { botId } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // For embedded/standalone chat, we always show the widget as open
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ChatWidget
          botId={botId}
          botName="Support Bot"
          botType="Support"
          color="blue"
          apiUrl={apiUrl}
        />
      </div>
    </div>
  );
};

export default ChatPage;
