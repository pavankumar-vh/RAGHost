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
  getEmbedHistory,
  addEmbedSnapshot,
  deleteEmbedSnapshot,
  updateSettings,
  saveWidgetConfig,
  getWidgetConfig,
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

// Embed version history
router.get('/:id/embed-history', getEmbedHistory);
router.post('/:id/embed-history', addEmbedSnapshot);
router.delete('/:id/embed-history/:snapId', deleteEmbedSnapshot);

// Advanced settings
router.put('/:id/settings', updateSettings);

// Widget customizer config
router.get('/:id/widget-config', getWidgetConfig);
router.put('/:id/widget-config', saveWidgetConfig);

export default router;
