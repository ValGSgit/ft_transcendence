import express from 'express';
import {
  sendFriendRequest,
  getPendingRequests,
  getSentRequests,
  getSuggestions,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getUserFriends,
  unfriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../controllers/friendController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All friend routes require authentication
router.use(authenticate);

// Suggestions
router.get('/suggestions', getSuggestions);

// Friend requests
router.post('/requests', sendFriendRequest);
router.get('/requests/pending', getPendingRequests);
router.get('/requests/sent', getSentRequests);
router.post('/requests/:requestId/accept', acceptFriendRequest);
router.post('/requests/:requestId/decline', declineFriendRequest);

// Friends
router.get('/', getFriends);
router.get('/:id/friends', getUserFriends);
router.delete('/:friendId', unfriend);

// Blocking
router.post('/block', blockUser);
router.delete('/block/:userId', unblockUser);
router.get('/blocked', getBlockedUsers);

export default router;
