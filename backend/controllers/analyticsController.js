import Bot from '../models/Bot.js';
import ChatSession from '../models/ChatSession.js';

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overall analytics across all user's bots
 * @access  Private
 */
export const getOverviewAnalytics = async (req, res) => {
  try {
    const userId = req.user.uid;

    const bots = await Bot.find({ userId });

    const overview = {
      totalBots: bots.length,
      activeBots: bots.filter(b => b.status === 'active').length,
      totalQueries: bots.reduce((sum, bot) => sum + (bot.totalQueries || 0), 0),
      totalTokens: bots.reduce((sum, bot) => sum + (bot.totalTokensUsed || 0), 0),
      totalCost: bots.reduce((sum, bot) => sum + (bot.estimatedCost || 0), 0),
      avgResponseTime: bots.length > 0
        ? Math.round(bots.reduce((sum, bot) => sum + (bot.avgResponseTime || 0), 0) / bots.length)
        : 0,
      avgAccuracy: bots.length > 0
        ? Math.round(bots.reduce((sum, bot) => sum + (bot.accuracy || 0), 0) / bots.length)
        : 0,
    };

    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
};

/**
 * @route   GET /api/analytics/bot/:botId
 * @desc    Get detailed analytics for a specific bot
 * @access  Private
 */
export const getBotAnalytics = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { botId } = req.params;

    const bot = await Bot.findOne({ _id: botId, userId });

    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found',
      });
    }

    // Get daily stats for last 30 days
    const dailyStats = bot.dailyStats || [];
    dailyStats.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get chat sessions count
    const sessionsCount = await ChatSession.countDocuments({ botId });

    const analytics = {
      botId: bot._id,
      botName: bot.name,
      totalQueries: bot.totalQueries || 0,
      totalTokens: bot.totalTokensUsed || 0,
      estimatedCost: bot.estimatedCost || 0,
      avgResponseTime: bot.avgResponseTime || 0,
      accuracy: bot.accuracy || 0,
      sessionsCount,
      dailyStats: dailyStats.map(stat => ({
        date: stat.date,
        queries: stat.queries,
        tokens: stat.tokens,
        avgResponseTime: stat.avgResponseTime,
      })),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching bot analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bot analytics',
    });
  }
};

/**
 * @route   GET /api/analytics/daily
 * @desc    Get daily aggregated analytics for all user's bots
 * @access  Private
 */
export const getDailyAnalytics = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { days = 7 } = req.query;

    const bots = await Bot.find({ userId });

    // Aggregate daily stats from all bots
    const aggregatedStats = {};

    bots.forEach(bot => {
      if (!bot.dailyStats) return;

      bot.dailyStats.forEach(stat => {
        const dateKey = new Date(stat.date).toISOString().split('T')[0];

        if (!aggregatedStats[dateKey]) {
          aggregatedStats[dateKey] = {
            date: stat.date,
            queries: 0,
            tokens: 0,
            avgResponseTime: 0,
            responseTimeCount: 0,
          };
        }

        aggregatedStats[dateKey].queries += stat.queries;
        aggregatedStats[dateKey].tokens += stat.tokens;
        aggregatedStats[dateKey].avgResponseTime += stat.avgResponseTime * stat.queries;
        aggregatedStats[dateKey].responseTimeCount += stat.queries;
      });
    });

    // Calculate average response time and format
    const dailyData = Object.values(aggregatedStats)
      .map(stat => ({
        date: stat.date,
        queries: stat.queries,
        tokens: stat.tokens,
        avgResponseTime: stat.responseTimeCount > 0
          ? Math.round(stat.avgResponseTime / stat.responseTimeCount)
          : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-parseInt(days));

    res.json({
      success: true,
      data: dailyData,
    });
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily analytics',
    });
  }
};

/**
 * @route   GET /api/analytics/top-bots
 * @desc    Get top performing bots
 * @access  Private
 */
export const getTopBots = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 5, sortBy = 'queries' } = req.query;

    let sortField;
    switch (sortBy) {
      case 'queries':
        sortField = { totalQueries: -1 };
        break;
      case 'accuracy':
        sortField = { accuracy: -1 };
        break;
      case 'tokens':
        sortField = { totalTokensUsed: -1 };
        break;
      default:
        sortField = { totalQueries: -1 };
    }

    const topBots = await Bot.find({ userId })
      .sort(sortField)
      .limit(parseInt(limit))
      .select('name type totalQueries totalTokensUsed estimatedCost accuracy avgResponseTime color');

    res.json({
      success: true,
      data: topBots.map(bot => ({
        id: bot._id,
        name: bot.name,
        type: bot.type,
        color: bot.color,
        totalQueries: bot.totalQueries || 0,
        totalTokens: bot.totalTokensUsed || 0,
        estimatedCost: bot.estimatedCost || 0,
        accuracy: bot.accuracy || 0,
        avgResponseTime: bot.avgResponseTime || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching top bots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top bots',
    });
  }
};

