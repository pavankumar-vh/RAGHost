import Bot from '../models/Bot.js';
import ChatSession from '../models/ChatSession.js';
import { decrypt } from '../utils/encryption.js';
import { queryPinecone } from '../services/pineconeService.js';
import { generateResponse } from '../services/geminiService.js';
import mongoose from 'mongoose';

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

    // Validate botId format
    if (!mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bot ID format. Please provide a valid bot ID.',
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

    // Use pineconeEnvironment directly as host URL
    const pineconeHost = bot.pineconeEnvironment;

    // Step 1: Query Pinecone for relevant context using Gemini embeddings
    console.log('🔍 Querying Pinecone for relevant context...');
    console.log('📍 Pinecone Config:', {
      indexName: bot.pineconeIndexName,
      host: pineconeHost,
      hasApiKey: !!pineconeKey,
      hasGeminiKey: !!geminiKey,
    });
    
    const context = await queryPinecone({
      apiKey: pineconeKey,
      environment: bot.pineconeEnvironment,
      indexName: bot.pineconeIndexName,
      query: message,
      geminiKey: geminiKey, // Use Gemini for embeddings
      topK: 5, // Get top 5 most relevant chunks
      pineconeHost,
    });

    console.log(`📚 Found ${context.matches?.length || 0} relevant context chunks`);
    if (context.matches && context.matches.length > 0) {
      console.log('🎯 Top match score:', context.matches[0].score);
      console.log('📝 First chunk preview:', context.matches[0].metadata?.text?.substring(0, 100));
    } else if (context.error) {
      console.error('⚠️ Context retrieval error:', context.error);
    }

    // Step 2: Generate response with Gemini using context and system prompt
    console.log('🤖 Generating AI response with Gemini...');
    const response = await generateResponse({
      apiKey: geminiKey,
      message,
      context: context.matches || [],
      botName: bot.name,
      botType: bot.type,
      systemPrompt: bot.systemPrompt || '', // Use custom system prompt
      temperature: bot.temperature || 0.7,
      maxTokens: bot.maxTokens || 1024,
    });

    console.log('✅ Response generated successfully');
    const responseTime = Date.now() - startTime;

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
    
    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!bot.dailyStats) {
      bot.dailyStats = [];
    }
    
    // Find or create today's stat entry
    let todayStat = bot.dailyStats.find(stat => {
      const statDate = new Date(stat.date);
      statDate.setHours(0, 0, 0, 0);
      return statDate.getTime() === today.getTime();
    });
    
    if (!todayStat) {
      todayStat = {
        date: today,
        queries: 0,
        tokens: 0,
        avgResponseTime: 0,
      };
      bot.dailyStats.push(todayStat);
    }
    
    // Update today's stats
    todayStat.queries += 1;
    todayStat.tokens += response.tokensUsed || 0;
    todayStat.avgResponseTime = 
      todayStat.avgResponseTime === 0
        ? responseTime
        : (todayStat.avgResponseTime + responseTime) / 2;
    
    // Keep only last 90 days of stats
    if (bot.dailyStats.length > 90) {
      bot.dailyStats.sort((a, b) => new Date(b.date) - new Date(a.date));
      bot.dailyStats = bot.dailyStats.slice(0, 90);
    }
    
    await bot.save();
    
    console.log('📊 Updated bot daily stats:', {
      botId: bot._id,
      totalQueries: bot.totalQueries,
      dailyStatsCount: bot.dailyStats.length,
      todayStats: todayStat,
    });

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

    // Validate botId format
    if (!mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bot ID format',
      });
    }

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

    // Validate botId format
    if (!mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bot ID format',
      });
    }

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
