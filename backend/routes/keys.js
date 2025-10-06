import express from 'express';
import { addKeys, getKeys, testConnection, deleteKeys } from '../controllers/keysController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/keys/add
// @desc    Add or update user's API keys (Pinecone + Gemini)
// @access  Private
router.post('/add', addKeys);

// @route   GET /api/keys
// @desc    Get user's API keys status (not the actual keys)
// @access  Private
router.get('/', getKeys);

// @route   POST /api/keys/test
// @desc    Test connection to Pinecone and Gemini with stored keys
// @access  Private
router.post('/test', testConnection);

// @route   DELETE /api/keys
// @desc    Delete user's API keys
// @access  Private
router.delete('/', deleteKeys);

export default router;
