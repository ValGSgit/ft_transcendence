import express from 'express';
import {
  getUserRooms,
  createRoom,
  getRoomMessages,
  sendMessage,
  getOrCreateDirectRoom,
  getRoomMembers,
  addRoomMember,
  removeRoomMember,
  searchMessages,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Rooms
router.get('/rooms', getUserRooms);
router.post('/rooms', createRoom);
router.get('/rooms/:roomId/messages', getRoomMessages);
router.post('/rooms/:roomId/messages', sendMessage);
router.get('/rooms/:roomId/members', getRoomMembers);
router.post('/rooms/:roomId/members', addRoomMember);
router.delete('/rooms/:roomId/members/:userId', removeRoomMember);

// Direct messages
router.get('/direct/:userId', getOrCreateDirectRoom);

// Search
router.get('/messages/search', searchMessages);

export default router;
