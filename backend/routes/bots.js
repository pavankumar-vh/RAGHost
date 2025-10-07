import express from 'express';
import {
  createBot,
  getBots,
  getBotById,
  updateBot,
  deleteBot,
  testBotConnection,
  getEmbedCode,
} from '../controllers/botsController.js';

const router = express.Router();

// All routes require authentication (applied in server.js)

// Create a new bot
router.post('/create', createBot);

// Get all bots
router.get('/', getBots);

// Get single bot
router.get('/:id', getBotById);

// Update bot
router.put('/:id', updateBot);

// Delete bot
router.delete('/:id', deleteBot);

// Test bot connections
router.post('/:id/test', testBotConnection);

// Get embed code for bot
router.get('/:id/embed', getEmbedCode);

export default router;
