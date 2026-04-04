import ExternalApiKey from '../models/ExternalApiKey.js';
import Bot from '../models/Bot.js';
import ChatSession from '../models/ChatSession.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import UploadJob from '../models/UploadJob.js';
import { decrypt } from '../utils/encryption.js';
import { queryPinecone } from '../services/pineconeService.js';
import { generateResponse } from '../services/geminiService.js';
import { processAndUploadDocument, deleteDocumentFromPinecone } from '../services/embeddingService.js';
import { sanitizeString, isValidObjectId } from '../middleware/inputValidation.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// ──────────────────────────────────────────
//  API KEY MANAGEMENT  (Firebase auth required)
// ──────────────────────────────────────────

/**
 * @route   POST /api/v1/keys
 * @desc    Generate a new external API key for a bot
 * @access  Private (Firebase auth)
 */
export const createApiKey = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { botId, name, scopes } = req.body;

    if (!botId || !name) {
      return res.status(400).json({
        success: false,
        error: 'botId and name are required.',
      });
    }

    if (!isValidObjectId(botId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid botId format.',
      });
    }

    // Verify bot ownership
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found or not owned by you.',
      });
    }

    // Validate scopes
    const validScopes = ['query', 'upload'];
    const requestedScopes = scopes && Array.isArray(scopes) ? scopes : ['query'];
    const invalidScopes = requestedScopes.filter((s) => !validScopes.includes(s));
    if (invalidScopes.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid scopes: ${invalidScopes.join(', ')}. Valid: ${validScopes.join(', ')}`,
      });
    }

    // Limit: max 10 keys per bot
    const existingCount = await ExternalApiKey.countDocuments({ userId, botId });
    if (existingCount >= 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 API keys per bot. Revoke an existing key first.',
      });
    }

    // Generate key
    const { raw, hash, prefix } = ExternalApiKey.generateKey();

    const apiKey = new ExternalApiKey({
      userId,
      botId,
      name: name.substring(0, 100),
      keyHash: hash,
      keyPrefix: prefix,
      scopes: requestedScopes,
    });

    await apiKey.save();

    res.status(201).json({
      success: true,
      message: 'API key created. Copy it now — it will not be shown again.',
      data: {
        id: apiKey._id,
        key: raw, // Only time the full key is returned
        prefix: prefix,
        name: apiKey.name,
        botId: apiKey.botId,
        scopes: apiKey.scopes,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ success: false, error: 'Failed to create API key.' });
  }
};

/**
 * @route   GET /api/v1/keys/:botId
 * @desc    List all external API keys for a bot
 * @access  Private (Firebase auth)
 */
export const listApiKeys = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { botId } = req.params;

    const keys = await ExternalApiKey.find({ userId, botId })
      .select('name keyPrefix scopes active lastUsedAt totalRequests createdAt expiresAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: keys,
    });
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({ success: false, error: 'Failed to list API keys.' });
  }
};

/**
 * @route   DELETE /api/v1/keys/:keyId
 * @desc    Revoke (delete) an API key
 * @access  Private (Firebase auth)
 */
export const revokeApiKey = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { keyId } = req.params;

    const result = await ExternalApiKey.findOneAndDelete({ _id: keyId, userId });
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'API key not found.',
      });
    }

    res.json({ success: true, message: 'API key revoked.' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ success: false, error: 'Failed to revoke API key.' });
  }
};

// ──────────────────────────────────────────
//  HEADLESS QUERY  (API key auth)
// ──────────────────────────────────────────

/**
 * @route   POST /api/v1/query
 * @desc    Send a message and get an AI response (headless — no widget needed)
 * @access  API Key (scope: query)
 * @body    { message: string, sessionId?: string }
 */
export const queryBot = async (req, res) => {
  try {
    const bot = req.bot; // Set by apiKeyAuth middleware
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'message is required.',
        code: 'MESSAGE_REQUIRED',
      });
    }

    const MAX_MESSAGE_LENGTH = 5000;
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
        code: 'MESSAGE_TOO_LONG',
      });
    }

    const sanitizedMessage = sanitizeString(message);

    // Decrypt bot keys
    const pineconeKey = decrypt(bot.pineconeKey);
    const geminiKey = decrypt(bot.geminiKey);
    const pineconeHost = bot.pineconeEnvironment;

    const startTime = Date.now();

    // Step 1: Query Pinecone
    const context = await queryPinecone({
      apiKey: pineconeKey,
      environment: bot.pineconeEnvironment,
      indexName: bot.pineconeIndexName,
      query: sanitizedMessage,
      geminiKey,
      topK: 5,
      pineconeHost,
    });

    // Step 2: Generate with Gemini
    const response = await generateResponse({
      apiKey: geminiKey,
      message: sanitizedMessage,
      context: context.matches || [],
      botName: bot.name,
      botType: bot.type,
      systemPrompt: bot.systemPrompt || '',
      temperature: bot.temperature || 0.7,
      maxTokens: bot.maxTokens || 1024,
    });

    const responseTime = Date.now() - startTime;

    // Step 3: Save chat history
    const actualSessionId = sessionId || `api_${Date.now()}`;
    let chatSession = await ChatSession.findOne({ sessionId: actualSessionId, botId: bot._id });

    if (!chatSession) {
      chatSession = new ChatSession({
        botId: bot._id,
        sessionId: actualSessionId,
        messages: [],
      });
    }

    chatSession.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      {
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        metadata: { contextUsed: context.matches?.length || 0, responseTime },
      }
    );

    await chatSession.save();

    // Update bot stats (fire-and-forget)
    Bot.findByIdAndUpdate(bot._id, {
      $inc: { totalQueries: 1 },
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        response: response.text,
        sessionId: actualSessionId,
        responseTime,
        contextUsed: context.matches?.length || 0,
        tokensUsed: response.tokensUsed || null,
      },
    });
  } catch (error) {
    console.error('Headless query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process query.',
    });
  }
};

// ──────────────────────────────────────────
//  HEADLESS DOCUMENT UPLOAD  (API key auth)
// ──────────────────────────────────────────

/**
 * @route   POST /api/v1/documents/upload
 * @desc    Upload a document (PDF, DOCX, TXT, MD, CSV) via API key
 * @access  API Key (scope: upload)
 * @body    multipart/form-data — field: "document"
 */
export const uploadDocumentHeadless = async (req, res) => {
  try {
    const bot = req.bot;
    const userId = req.user.uid;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Send multipart form-data with field "document".',
      });
    }

    // Extract text
    let content = '';
    const fileType = path.extname(file.originalname).toLowerCase().slice(1);

    try {
      if (fileType === 'pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        content = data.text;
      } else if (fileType === 'docx') {
        const result = await mammoth.extractRawText({ path: file.path });
        content = result.value;
      } else if (fileType === 'txt' || fileType === 'md') {
        content = fs.readFileSync(file.path, 'utf-8');
      } else if (fileType === 'csv') {
        content = fs.readFileSync(file.path, 'utf-8');
      } else {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          error: 'Unsupported file type. Supported: PDF, DOCX, TXT, MD, CSV',
        });
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Failed to parse file content.',
      });
    }

    const chunkCount = Math.ceil(content.length / 500);

    // Find or create knowledge base
    let knowledgeBase = await KnowledgeBase.findOne({ botId: bot._id, userId });

    if (!knowledgeBase) {
      knowledgeBase = new KnowledgeBase({
        botId: bot._id,
        userId,
        documents: [],
        totalDocuments: 0,
        totalChunks: 0,
      });
    }

    knowledgeBase.documents.push({
      filename: file.filename,
      originalName: file.originalname,
      fileType,
      content,
      chunkCount,
      uploadedAt: new Date(),
    });

    knowledgeBase.totalDocuments = knowledgeBase.documents.length;
    const documentId = knowledgeBase.documents[knowledgeBase.documents.length - 1]._id;

    await knowledgeBase.save();

    // Create upload job
    const uploadJob = new UploadJob({
      userId,
      botId: bot._id,
      documentId,
      filename: file.originalname,
      fileType,
      status: 'extracting',
      progress: {
        current: 10,
        total: 100,
        percentage: 10,
        message: 'Document uploaded, extracting text...',
      },
    });

    await uploadJob.save();

    // Remove temp file
    fs.unlinkSync(file.path);

    // Respond immediately
    res.json({
      success: true,
      message: 'Document uploaded. Processing in background.',
      data: {
        documentId,
        jobId: uploadJob._id,
        filename: file.originalname,
        fileType,
        chunkCount,
        status: 'processing',
      },
    });

    // Background processing
    const pineconeKey = decrypt(bot.pineconeKey);
    const geminiKey = decrypt(bot.geminiKey);
    const pineconeHost = bot.pineconeEnvironment;

    const updateProgress = async (status, percentage, message) => {
      try {
        await UploadJob.findByIdAndUpdate(uploadJob._id, {
          status,
          progress: { current: percentage, total: 100, percentage, message },
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error('Failed to update job progress:', err);
      }
    };

    processAndUploadDocument({
      text: content,
      documentId: documentId.toString(),
      filename: file.originalname,
      pineconeKey,
      geminiKey,
      environment: bot.pineconeEnvironment,
      indexName: bot.pineconeIndexName,
      pineconeHost,
      onProgress: updateProgress,
    })
      .then(async (result) => {
        await UploadJob.findByIdAndUpdate(uploadJob._id, {
          status: 'completed',
          progress: {
            current: 100,
            total: 100,
            percentage: 100,
            message: `Successfully processed ${result.vectorsUploaded} vectors`,
          },
          result: {
            chunksProcessed: result.chunksProcessed,
            vectorsUploaded: result.vectorsUploaded,
          },
          completedAt: new Date(),
        });
        console.log(`✅ API upload complete: ${file.originalname} — ${result.vectorsUploaded} vectors`);
      })
      .catch(async (error) => {
        console.error('Background processing failed:', error);
        await UploadJob.findByIdAndUpdate(uploadJob._id, {
          status: 'failed',
          progress: {
            current: 0,
            total: 100,
            percentage: 0,
            message: `Processing failed: ${error.message}`,
          },
          error: error.message,
        });
      });
  } catch (error) {
    console.error('Headless upload error:', error);
    // Clean up file if it exists
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    res.status(500).json({
      success: false,
      error: 'Failed to upload document.',
    });
  }
};

/**
 * @route   GET /api/v1/documents/status/:jobId
 * @desc    Check upload job status
 * @access  API Key (scope: upload)
 */
export const getUploadStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.uid;

    const job = await UploadJob.findOne({ _id: jobId, userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Upload job not found.',
      });
    }

    res.json({
      success: true,
      data: {
        jobId: job._id,
        status: job.status,
        progress: job.progress,
        filename: job.filename,
        result: job.result || null,
        error: job.error || null,
        createdAt: job.createdAt,
        completedAt: job.completedAt || null,
      },
    });
  } catch (error) {
    console.error('Get upload status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get upload status.' });
  }
};

/**
 * @route   GET /api/v1/documents
 * @desc    List documents in the bot's knowledge base
 * @access  API Key (scope: upload)
 */
export const listDocuments = async (req, res) => {
  try {
    const bot = req.bot;
    const userId = req.user.uid;

    const kb = await KnowledgeBase.findOne({ botId: bot._id, userId });
    if (!kb) {
      return res.json({ success: true, data: { documents: [], totalDocuments: 0 } });
    }

    const docs = kb.documents.map((d) => ({
      id: d._id,
      originalName: d.originalName,
      fileType: d.fileType,
      chunkCount: d.chunkCount,
      uploadedAt: d.uploadedAt,
    }));

    res.json({
      success: true,
      data: { documents: docs, totalDocuments: kb.totalDocuments },
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ success: false, error: 'Failed to list documents.' });
  }
};
