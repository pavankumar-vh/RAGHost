import express from 'express';
import { getProfile, updateProfile, getUserStats, deleteAccount } from '../controllers/usersController.js';

const router = express.Router();

// @route   GET  /api/users/profile
router.get('/profile', getProfile);

// @route   PUT  /api/users/profile
router.put('/profile', updateProfile);

// @route   GET  /api/users/stats
router.get('/stats', getUserStats);

// @route   DELETE /api/users/account
router.delete('/account', deleteAccount);

export default router;
