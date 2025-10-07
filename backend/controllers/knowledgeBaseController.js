import KnowledgeBase from '../models/KnowledgeBase.js';
import Bot from '../models/Bot.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { processAndUploadDocument, deleteDocumentFromPinecone } from '../services/embeddingService.js';
import { decrypt } from '../utils/encryption.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route   POST /api/knowledge/:botId/upload
 * @desc    Upload document to bot's knowledge base
 * @access  Private
 */
export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { botId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Verify bot ownership
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      // Delete uploaded file
      fs.unlinkSync(file.path);
      return res.status(404).json({
        success: false,
        error: 'Bot not found',
      });
    }

    // Extract text from file
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
        error: 'Failed to parse file content',
      });
    }

    // Calculate chunk count (rough estimate: 500 chars per chunk)
    const chunkCount = Math.ceil(content.length / 500);

    // Find or create knowledge base
    let knowledgeBase = await KnowledgeBase.findOne({ botId, userId });

    if (!knowledgeBase) {
      knowledgeBase = new KnowledgeBase({
        botId,
        userId,
        documents: [],
        totalDocuments: 0,
        totalChunks: 0,
      });
    }

    // Add document to knowledge base
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

    // Delete the uploaded file from disk (we've saved the content in DB)
    fs.unlinkSync(file.path);

    // Step 2: Process and upload to Pinecone (async - don't block response)
    const pineconeKey = decrypt(bot.pineconeKey);
    const geminiKey = decrypt(bot.geminiKey);

    // Upload to Pinecone in background
    processAndUploadDocument({
      text: content,
      documentId: documentId.toString(),
      filename: file.originalname,
      pineconeKey,
      geminiKey,
      environment: bot.pineconeEnvironment,
      indexName: bot.pineconeIndexName,
    })
      .then(result => {
        console.log(`✅ Document uploaded to Pinecone: ${file.originalname}`, result);
        // Update chunk count with actual uploaded count
        KnowledgeBase.findOne({ botId, userId }).then(kb => {
          if (kb) {
            kb.totalChunks = kb.documents.reduce((sum, doc) => sum + doc.chunkCount, 0);
            kb.save();
          }
        });
      })
      .catch(error => {
        console.error(`❌ Failed to upload to Pinecone: ${file.originalname}`, error);
      });

    res.json({
      success: true,
      message: 'Document uploaded successfully. Embedding to Pinecone in progress...',
      data: {
        documentId,
        filename: file.originalname,
        fileType,
        chunkCount,
        totalDocuments: knowledgeBase.totalDocuments,
        status: 'processing',
      },
    });
  } catch (error) {
    console.error('Upload document error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
    });
  }
};

/**
 * @route   GET /api/knowledge/:botId
 * @desc    Get knowledge base for a bot
 * @access  Private
 */
export const getKnowledgeBase = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { botId } = req.params;

    // Verify bot ownership
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found',
      });
    }

    const knowledgeBase = await KnowledgeBase.findOne({ botId, userId });

    if (!knowledgeBase) {
      return res.json({
        success: true,
        data: {
          documents: [],
          totalDocuments: 0,
          totalChunks: 0,
        },
      });
    }

    // Return without full content (just metadata)
    const documentsMetadata = knowledgeBase.documents.map(doc => ({
      id: doc._id,
      filename: doc.originalName,
      fileType: doc.fileType,
      chunkCount: doc.chunkCount,
      contentPreview: doc.content.substring(0, 200) + '...',
      uploadedAt: doc.uploadedAt,
    }));

    res.json({
      success: true,
      data: {
        documents: documentsMetadata,
        totalDocuments: knowledgeBase.totalDocuments,
        totalChunks: knowledgeBase.totalChunks,
        lastUpdated: knowledgeBase.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Get knowledge base error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge base',
    });
  }
};

/**
 * @route   DELETE /api/knowledge/:botId/document/:documentId
 * @desc    Delete a document from knowledge base
 * @access  Private
 */
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { botId, documentId } = req.params;

    // Verify bot ownership
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found',
      });
    }

    const knowledgeBase = await KnowledgeBase.findOne({ botId, userId });

    if (!knowledgeBase) {
      return res.status(404).json({
        success: false,
        error: 'Knowledge base not found',
      });
    }

    // Get document info before deleting
    const document = knowledgeBase.documents.find(doc => doc._id.toString() === documentId);
    
    // Remove document from MongoDB
    knowledgeBase.documents = knowledgeBase.documents.filter(
      doc => doc._id.toString() !== documentId
    );

    knowledgeBase.totalDocuments = knowledgeBase.documents.length;
    knowledgeBase.totalChunks = knowledgeBase.documents.reduce((sum, doc) => sum + doc.chunkCount, 0);
    knowledgeBase.lastUpdated = new Date();

    await knowledgeBase.save();

    // Delete from Pinecone in background
    if (document) {
      const pineconeKey = decrypt(bot.pineconeKey);
      deleteDocumentFromPinecone({
        documentId: documentId,
        pineconeKey,
        environment: bot.pineconeEnvironment,
        indexName: bot.pineconeIndexName,
      })
        .then(() => console.log(`✅ Document vectors deleted from Pinecone: ${documentId}`))
        .catch(error => console.error(`❌ Failed to delete from Pinecone:`, error));
    }

    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: {
        totalDocuments: knowledgeBase.totalDocuments,
        totalChunks: knowledgeBase.totalChunks,
      },
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
};

/**
 * @route   GET /api/knowledge/:botId/search
 * @desc    Search knowledge base content
 * @access  Private
 */
export const searchKnowledgeBase = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { botId } = req.params;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    // Verify bot ownership
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found',
      });
    }

    const knowledgeBase = await KnowledgeBase.findOne({ botId, userId });

    if (!knowledgeBase) {
      return res.json({
        success: true,
        data: {
          results: [],
        },
      });
    }

    // Simple text search (can be enhanced with vector search later)
    const results = [];
    const searchLower = query.toLowerCase();

    knowledgeBase.documents.forEach(doc => {
      const contentLower = doc.content.toLowerCase();
      const index = contentLower.indexOf(searchLower);
      
      if (index !== -1) {
        const start = Math.max(0, index - 100);
        const end = Math.min(doc.content.length, index + query.length + 100);
        const snippet = doc.content.substring(start, end);

        results.push({
          documentId: doc._id,
          filename: doc.originalName,
          fileType: doc.fileType,
          snippet: (start > 0 ? '...' : '') + snippet + (end < doc.content.length ? '...' : ''),
        });
      }
    });

    res.json({
      success: true,
      data: {
        query,
        results,
        totalResults: results.length,
      },
    });
  } catch (error) {
    console.error('Search knowledge base error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search knowledge base',
    });
  }
};

