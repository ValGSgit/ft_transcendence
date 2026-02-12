import express from 'express';
import {
  getGameConfig,
  createGame,
  getGame,
  startGame,
  updateScore,
  endGame,
  getMatchHistory,
  getLeaderboard,
  abandonGame,
  getActiveGames,
} from '../controllers/gameController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/config', optionalAuth, getGameConfig);
router.get('/leaderboard', optionalAuth, getLeaderboard);

// Protected routes
router.use(authenticate);

router.post('/', createGame);
router.get('/active', getActiveGames);
router.get('/history', getMatchHistory);
router.get('/history/:userId', getMatchHistory);
router.get('/:gameId', getGame);
router.post('/:gameId/start', startGame);
router.post('/:gameId/score', updateScore);
router.post('/:gameId/end', endGame);
router.post('/:gameId/abandon', abandonGame);

export default router;
