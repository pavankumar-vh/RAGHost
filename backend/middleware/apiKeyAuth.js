import ExternalApiKey from '../models/ExternalApiKey.js';
import Bot from '../models/Bot.js';

/**
 * Middleware to authenticate requests using external API keys.
 * Expects header: X-API-Key: rh_xxxxx...
 *
 * Attaches to req:
 *   req.apiKey   — the ExternalApiKey document
 *   req.bot      — the Bot document (populated)
 *   req.user     — { uid } for compatibility with existing code
 *
 * @param {string[]} requiredScopes - e.g. ['query'] or ['upload']
 */
export const authenticateApiKey = (...requiredScopes) => {
  return async (req, res, next) => {
    try {
      const rawKey = req.headers['x-api-key'];

      if (!rawKey || !rawKey.startsWith('rh_')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or invalid API key. Include X-API-Key header.',
          code: 'MISSING_API_KEY',
        });
      }

      // Hash and look up
      const keyHash = ExternalApiKey.hashKey(rawKey);
      const apiKeyDoc = await ExternalApiKey.findOne({ keyHash });

      if (!apiKeyDoc) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key.',
          code: 'INVALID_API_KEY',
        });
      }

      if (!apiKeyDoc.active) {
        return res.status(403).json({
          success: false,
          error: 'API key has been revoked.',
          code: 'KEY_REVOKED',
        });
      }

      // Check expiry
      if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < new Date()) {
        return res.status(403).json({
          success: false,
          error: 'API key has expired.',
          code: 'KEY_EXPIRED',
        });
      }

      // Check scopes
      if (requiredScopes.length > 0) {
        const hasScope = requiredScopes.some((s) => apiKeyDoc.scopes.includes(s));
        if (!hasScope) {
          return res.status(403).json({
            success: false,
            error: `API key missing required scope: ${requiredScopes.join(' or ')}`,
            code: 'INSUFFICIENT_SCOPE',
          });
        }
      }

      // Load the bot
      const bot = await Bot.findById(apiKeyDoc.botId);
      if (!bot) {
        return res.status(404).json({
          success: false,
          error: 'Bot associated with this API key no longer exists.',
          code: 'BOT_NOT_FOUND',
        });
      }

      if (bot.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Bot is not active.',
          code: 'BOT_INACTIVE',
        });
      }

      // Track usage (fire-and-forget)
      ExternalApiKey.findByIdAndUpdate(apiKeyDoc._id, {
        lastUsedAt: new Date(),
        $inc: { totalRequests: 1 },
      }).catch(() => {});

      // Attach to request
      req.apiKey = apiKeyDoc;
      req.bot = bot;
      req.user = { uid: apiKeyDoc.userId };

      next();
    } catch (error) {
      console.error('API key auth error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed.',
        code: 'AUTH_ERROR',
      });
    }
  };
};
