import express from 'express';
import upload from '../config/multer.js';
import { authenticate } from '../middleware/auth.js';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  queryBot,
  uploadDocumentHeadless,
  getUploadStatus,
  listDocuments,
} from '../controllers/v1Controller.js';

const router = express.Router();

// ── Key Management (Firebase auth — done from RAGHost dashboard) ──
router.post('/keys', authenticate, createApiKey);
router.get('/keys/:botId', authenticate, listApiKeys);
router.delete('/keys/:keyId', authenticate, revokeApiKey);

// ── Headless Query (API key auth, scope: query) ──
router.post('/query', authenticateApiKey('query'), queryBot);

// ── Headless Document Upload (API key auth, scope: upload) ──
router.post('/documents/upload', authenticateApiKey('upload'), upload.single('document'), uploadDocumentHeadless);
router.get('/documents/status/:jobId', authenticateApiKey('upload'), getUploadStatus);
router.get('/documents', authenticateApiKey('upload'), listDocuments);

export default router;
