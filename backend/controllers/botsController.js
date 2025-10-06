import Bot from '../models/Bot.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Create a new bot
export const createBot = async (req, res) => {
  try {
    const { name, type, description, color, pineconeKey, pineconeEnvironment, pineconeIndexName, geminiKey } = req.body;
    const userId = req.user.uid;

    // Validation
    if (!name || !type) {
      return res.status(400).json({ error: 'Bot name and type are required' });
    }

    if (!pineconeKey || !pineconeEnvironment || !pineconeIndexName) {
      return res.status(400).json({ error: 'Pinecone configuration (API key, environment, index name) is required for each bot' });
    }

    if (!geminiKey) {
      return res.status(400).json({ error: 'Gemini API key is required for each bot' });
    }

    // Encrypt API keys
    const encryptedPineconeKey = encrypt(pineconeKey);
    const encryptedGeminiKey = encrypt(geminiKey);

    // Create bot
    const bot = new Bot({
      userId,
      name,
      type,
      description,
      color: color || 'blue',
      pineconeKey: encryptedPineconeKey,
      pineconeEnvironment,
      pineconeIndexName,
      geminiKey: encryptedGeminiKey,
      status: 'inactive', // Will be activated after verification
    });

    await bot.save();

    // Return bot without sensitive data
    const botResponse = {
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      createdAt: bot.createdAt,
    };

    res.status(201).json({
      message: 'Bot created successfully',
      bot: botResponse,
    });
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
};

// Get all bots for a user
export const getBots = async (req, res) => {
  try {
    const userId = req.user.uid;

    const bots = await Bot.find({ userId }).sort({ createdAt: -1 });

    // Return bots without sensitive data
    const botsResponse = bots.map((bot) => ({
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    }));

    res.json({ bots: botsResponse });
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
};

// Get single bot by ID
export const getBotById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const bot = await Bot.findOne({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const botResponse = {
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
    };

    res.json({ bot: botResponse });
  } catch (error) {
    console.error('Error fetching bot:', error);
    res.status(500).json({ error: 'Failed to fetch bot' });
  }
};

// Update bot
export const updateBot = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { name, type, description, color, pineconeKey, pineconeEnvironment, pineconeIndexName, geminiKey, useGlobalGeminiKey, status } = req.body;

    const bot = await Bot.findOne({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Update fields
    if (name) bot.name = name;
    if (type) bot.type = type;
    if (description !== undefined) bot.description = description;
    if (color) bot.color = color;
    if (status) bot.status = status;
    if (useGlobalGeminiKey !== undefined) bot.useGlobalGeminiKey = useGlobalGeminiKey;

    // Update Pinecone config if provided
    if (pineconeKey) {
      bot.pineconeKey = encrypt(pineconeKey);
      bot.pineconeVerified = false; // Reset verification
    }
    if (pineconeEnvironment) bot.pineconeEnvironment = pineconeEnvironment;
    if (pineconeIndexName) bot.pineconeIndexName = pineconeIndexName;

    // Update Gemini key if provided
    if (geminiKey) {
      bot.geminiKey = encrypt(geminiKey);
      bot.geminiVerified = false; // Reset verification
    }

    await bot.save();

    const botResponse = {
      id: bot._id,
      name: bot.name,
      type: bot.type,
      description: bot.description,
      status: bot.status,
      color: bot.color,
      pineconeEnvironment: bot.pineconeEnvironment,
      pineconeIndexName: bot.pineconeIndexName,
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
      useGlobalGeminiKey: bot.useGlobalGeminiKey,
      totalQueries: bot.totalQueries,
      avgResponseTime: bot.avgResponseTime,
      accuracy: bot.accuracy,
      updatedAt: bot.updatedAt,
    };

    res.json({
      message: 'Bot updated successfully',
      bot: botResponse,
    });
  } catch (error) {
    console.error('Error updating bot:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
};

// Delete bot
export const deleteBot = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const bot = await Bot.findOneAndDelete({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    console.error('Error deleting bot:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
};

// Test bot API connections
export const testBotConnection = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const bot = await Bot.findOne({ _id: id, userId });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Decrypt keys for testing
    const pineconeKey = bot.pineconeKey ? decrypt(bot.pineconeKey) : null;
    const geminiKey = bot.geminiKey ? decrypt(bot.geminiKey) : null;

    // TODO: Implement actual Pinecone and Gemini connection testing
    // For now, just mark as verified if keys exist
    bot.pineconeVerified = !!pineconeKey;
    bot.geminiVerified = !!geminiKey || bot.useGlobalGeminiKey;
    bot.lastVerified = new Date();

    await bot.save();

    res.json({
      message: 'Bot connections tested',
      pineconeVerified: bot.pineconeVerified,
      geminiVerified: bot.geminiVerified,
    });
  } catch (error) {
    console.error('Error testing bot connection:', error);
    res.status(500).json({ error: 'Failed to test connections' });
  }
};
