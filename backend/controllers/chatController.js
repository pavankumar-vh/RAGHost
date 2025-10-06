import Bot from '../models/Bot.js';
import ChatSession from '../models/ChatSession.js';
import { decrypt } from '../utils/encryption.js';
import { queryPinecone } from '../services/pineconeService.js';
import { generateResponse } from '../services/geminiService.js';

/**
 * @route   POST /api/chat/:botId/message
 * @desc    Send a message to the bot and get AI response
 * @access  Public (no auth required - identified by botId)
 */
export const sendMessage = async (req, res) => {
  try {
    const { botId } = req.params;
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Find bot
    const bot = await Bot.findById(botId);
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found',
      });
    }

    if (bot.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Bot is not active',
      });
    }

    // Decrypt API keys
    const pineconeKey = decrypt(bot.pineconeKey);
    const geminiKey = decrypt(bot.geminiKey);

    const startTime = Date.now();

    // Step 1: Query Pinecone for relevant context
    const context = await queryPinecone({
      apiKey: pineconeKey,
      environment: bot.pineconeEnvironment,
      indexName: bot.pineconeIndexName,
      query: message,
      topK: 3,
    });

    // Step 2: Generate response with Gemini
    const response = await generateResponse({
      apiKey: geminiKey,
      message,
      context: context.matches || [],
      botName: bot.name,
      botType: bot.type,
    });

    const responseTime = Date.now() - startTime;

    // Estimate token usage (rough estimation: 1 token ≈ 4 characters)
    const promptTokens = Math.ceil((message + JSON.stringify(context)).length / 4);
    const responseTokens = Math.ceil(response.text.length / 4);
    const totalTokens = promptTokens + responseTokens;
    const estimatedCost = (totalTokens / 1000) * 0.001; // Rough cost estimate

    // Step 3: Save chat history
    let chatSession = await ChatSession.findOne({ sessionId, botId });
    
    if (!chatSession) {
      chatSession = new ChatSession({
        botId,
        sessionId: sessionId || `session_${Date.now()}`,
        messages: [],
      });
    }

    chatSession.messages.push(
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
      },
      {
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        metadata: {
          contextUsed: context.matches?.length || 0,
          responseTime,
        },
      }
    );

    await chatSession.save();

    // Update bot stats
    bot.totalQueries += 1;
    bot.avgResponseTime = 
      bot.avgResponseTime === 0
        ? responseTime
        : (bot.avgResponseTime + responseTime) / 2;
    bot.totalTokensUsed = (bot.totalTokensUsed || 0) + totalTokens;
    bot.estimatedCost = (bot.estimatedCost || 0) + estimatedCost;

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!bot.dailyStats) bot.dailyStats = [];
    
    const todayStats = bot.dailyStats.find(stat => 
      new Date(stat.date).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (todayStats) {
      todayStats.queries += 1;
      todayStats.tokens += totalTokens;
      todayStats.avgResponseTime = Math.round(
        (todayStats.avgResponseTime * (todayStats.queries - 1) + responseTime) / todayStats.queries
      );
    } else {
      bot.dailyStats.push({
        date: today,
        queries: 1,
        tokens: totalTokens,
        avgResponseTime: responseTime,
      });
      // Keep only last 30 days
      if (bot.dailyStats.length > 30) {
        bot.dailyStats.sort((a, b) => new Date(b.date) - new Date(a.date));
        bot.dailyStats = bot.dailyStats.slice(0, 30);
      }
    }

    await bot.save();

    res.json({
      success: true,
      data: {
        response: response.text,
        sessionId: chatSession.sessionId,
        responseTime,
        contextUsed: context.matches?.length || 0,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message,
    });
  }
};

/**
 * @route   GET /api/chat/:botId/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Public
 */
export const getChatHistory = async (req, res) => {
  try {
    const { botId, sessionId } = req.params;

    const chatSession = await ChatSession.findOne({ sessionId, botId });

    if (!chatSession) {
      return res.json({
        success: true,
        data: {
          messages: [],
        },
      });
    }

    res.json({
      success: true,
      data: {
        messages: chatSession.messages,
        createdAt: chatSession.createdAt,
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
    });
  }
};

/**
 * @route   DELETE /api/chat/:botId/history/:sessionId
 * @desc    Clear chat history for a session
 * @access  Public
 */
export const clearChatHistory = async (req, res) => {
  try {
    const { botId, sessionId } = req.params;

    await ChatSession.findOneAndDelete({ sessionId, botId });

    res.json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history',
    });
  }
};
