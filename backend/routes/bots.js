import express from 'express';
import {
  createBot,
  getBots,
  getBotById,
  updateBot,
  deleteBot,
  testBotConnection,
  getEmbedCode,
  getBotByIdPublic,
} from '../controllers/botsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public route (no authentication required) - must be first!
router.get('/public/:id', getBotByIdPublic);

// All other routes require authentication
router.use(authenticate);

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
