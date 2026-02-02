import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import friendRoutes from './friends.js';
import chatRoutes from './chat.js';
import gameRoutes from './game.js';
import notificationRoutes from './notifications.js';
import postRoutes from './posts.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Transcendence backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/friends', friendRoutes);
router.use('/chat', chatRoutes);
router.use('/game', gameRoutes);
router.use('/notifications', notificationRoutes);
router.use('/posts', postRoutes);

export default router;
