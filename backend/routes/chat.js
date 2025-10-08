import express from 'express';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chatController.js';
import { Bot } from '../models/Bot.js';

const router = express.Router();

// Get public bot info (for widget embedding) - no auth required
router.get('/:botId/info', async (req, res) => {
  try {
    const { botId } = req.params;
    
    const bot = await Bot.findOne({ _id: botId });
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    // Return only public information
    res.json({
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      color: bot.color,
      status: bot.status,
      createdAt: bot.createdAt,
    });
  } catch (error) {
    console.error('Error fetching bot info:', error);
    res.status(500).json({ error: 'Failed to fetch bot information' });
  }
});

// Public route - no auth required (bot is identified by botId)
// POST /api/chat/:botId/message
router.post('/:botId/message', sendMessage);

// Get chat history for a session
router.get('/:botId/history/:sessionId', getChatHistory);

// Clear chat history for a session
router.delete('/:botId/history/:sessionId', clearChatHistory);

export default router;
