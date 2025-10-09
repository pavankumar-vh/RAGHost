import express from 'express';
import upload from '../config/multer.js';
import {
  uploadDocument,
  getKnowledgeBase,
  deleteDocument,
  searchKnowledgeBase,
  getJobStatus,
} from '../controllers/knowledgeBaseController.js';

const router = express.Router();

// All routes require authentication (applied in server.js)

// Upload document to knowledge base
router.post('/:botId/upload', upload.single('document'), uploadDocument);

// Get knowledge base for a bot
router.get('/:botId', getKnowledgeBase);

// Get upload job status
router.get('/:botId/job/:jobId', getJobStatus);

// Search knowledge base
router.get('/:botId/search', searchKnowledgeBase);

// Delete document from knowledge base
router.delete('/:botId/document/:documentId', deleteDocument);

export default router;

