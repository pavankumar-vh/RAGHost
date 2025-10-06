import express from 'express';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chatController.js';

const router = express.Router();

// Public route - no auth required (bot is identified by botId)
// POST /api/chat/:botId/message
router.post('/:botId/message', sendMessage);

// Get chat history for a session
router.get('/:botId/history/:sessionId', getChatHistory);

// Clear chat history for a session
router.delete('/:botId/history/:sessionId', clearChatHistory);

export default router;
