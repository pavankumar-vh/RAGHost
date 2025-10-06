import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API Keys endpoints (Global Gemini key only)
export const apiKeysService = {
  // Add global Gemini API key
  addKeys: async (geminiKey) => {
    const response = await api.post('/api/keys/add', { geminiKey });
    return response.data;
  },

  // Get global Gemini key status
  getKeys: async () => {
    const response = await api.get('/api/keys');
    return response.data;
  },

  // Test Gemini connection
  testConnection: async () => {
    const response = await api.post('/api/keys/test');
    return response.data;
  },

  // Delete global Gemini key
  deleteKeys: async () => {
    const response = await api.delete('/api/keys');
    return response.data;
  },
};

// Bots endpoints (Each bot has its own Pinecone + optional Gemini config)
export const botsService = {
  // Create a new bot
  createBot: async (botData) => {
    const response = await api.post('/api/bots/create', botData);
    return response.data;
  },

  // Get all bots
  getBots: async () => {
    const response = await api.get('/api/bots');
    return response.data;
  },

  // Get single bot
  getBot: async (id) => {
    const response = await api.get(`/api/bots/${id}`);
    return response.data;
  },

  // Update bot
  updateBot: async (id, botData) => {
    const response = await api.put(`/api/bots/${id}`, botData);
    return response.data;
  },

  // Delete bot
  deleteBot: async (id) => {
    const response = await api.delete(`/api/bots/${id}`);
    return response.data;
  },

  // Test bot connections
  testBot: async (id) => {
    const response = await api.post(`/api/bots/${id}/test`);
    return response.data;
  },
};

export default api;
