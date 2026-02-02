import express from 'express';
import {
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateProfile,
  searchUsers,
  getUserStats,
  getCurrentUser,
  updateFarmStats,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/me', getCurrentUser);  // Get current user profile
router.put('/me/farm-stats', updateFarmStats);  // Update farm stats
router.get('/username/:username', getUserByUsername);  // Get user by username
router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);
router.put('/profile', updateProfile);

export default router;
