import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';
import axios from 'axios';

const EmbedPage = () => {
  const { botId } = useParams();
  const [searchParams] = useSearchParams();
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  // Get theme parameter from URL
  const theme = searchParams.get('theme') || 'classic';
  const mobile = searchParams.get('mobile') === 'true';
  const color = searchParams.get('color');

  useEffect(() => {
    fetchBotDetails();
  }, [botId]);

  const fetchBotDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/bots/public/${botId}`);
      setBot(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bot details:', error);
      setError('Failed to load bot. Please check if the bot ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat widget...</p>
        </div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Widget Not Available</h2>
          <p className="text-gray-400 mb-4">{error || 'Bot not found'}</p>
          <p className="text-sm text-gray-500">
            Please contact the website owner to resolve this issue.
          </p>
        </div>
      </div>
    );
  }

  // Apply theme-specific styles
  const getContainerStyle = () => {
    const baseStyle = {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A0A0A'
    };

    switch (theme) {
      case 'sidebar':
        return {
          ...baseStyle,
          alignItems: 'stretch',
          justifyContent: 'flex-end'
        };
      case 'bottombar':
        return {
          ...baseStyle,
          alignItems: 'flex-end',
          minHeight: '80px',
          height: '80px'
        };
      case 'inline':
        return {
          ...baseStyle,
          padding: '20px'
        };
      default:
        return baseStyle;
    }
  };

  const getWidgetWrapperStyle = () => {
    switch (theme) {
      case 'sidebar':
        return {
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        };
      case 'bottombar':
        return {
          width: '100%',
          height: '80px'
        };
      case 'minimal':
        return {
          width: '350px',
          height: '500px'
        };
      default:
        return {
          width: mobile ? '100%' : '400px',
          height: mobile ? '100%' : '600px',
          maxWidth: mobile ? 'calc(100vw - 40px)' : '400px',
          maxHeight: mobile ? 'calc(100vh - 100px)' : '600px'
        };
    }
  };

  return (
    <div style={getContainerStyle()}>
      <div style={getWidgetWrapperStyle()}>
        <ChatWidget
          botId={bot.id}
          botName={bot.name}
          botType={bot.type}
          color={color || bot.color}
          apiUrl={apiUrl}
          isEmbedded={true}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default EmbedPage;
