import express from 'express';
import {
  getOverviewAnalytics,
  getBotAnalytics,
  getDailyAnalytics,
  getTopBots,
} from '../controllers/analyticsController.js';

const router = express.Router();

// All routes require authentication (applied in server.js)

// Get overview analytics
router.get('/overview', getOverviewAnalytics);

// Get bot-specific analytics
router.get('/bot/:botId', getBotAnalytics);

// Get daily aggregated analytics
router.get('/daily', getDailyAnalytics);

// Get top performing bots
router.get('/top-bots', getTopBots);

export default router;

