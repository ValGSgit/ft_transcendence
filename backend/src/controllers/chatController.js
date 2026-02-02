import Chat from '../models/Chat.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getUserRooms = async (req, res) => {
  try {
    const rooms = Chat.getUserRooms(req.user.id);
    return successResponse(res, { rooms, count: rooms.length });
  } catch (error) {
    console.error('Get rooms error:', error);
    return errorResponse(res, 'Failed to get rooms', 500);
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, type = 'channel', members = [] } = req.body;

    if (!name) {
      return errorResponse(res, 'Room name is required', 400);
    }

    const room = Chat.createRoom(name, type, req.user.id);

    // Add creator as member
    Chat.addMember(room.id, req.user.id);

    // Add other members
    members.forEach(memberId => {
      if (memberId !== req.user.id) {
        Chat.addMember(room.id, parseInt(memberId));
      }
    });

    return successResponse(res, { room }, 'Room created', 201);
  } catch (error) {
    console.error('Create room error:', error);
    return errorResponse(res, 'Failed to create room', 500);
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = Chat.getRoomMessages(
      parseInt(roomId),
      parseInt(limit),
      parseInt(offset)
    );

    return successResponse(res, { messages, count: messages.length });
  } catch (error) {
    console.error('Get messages error:', error);
    return errorResponse(res, 'Failed to get messages', 500);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return errorResponse(res, 'Message content is required', 400);
    }

    const trimmedContent = content.trim();
    
    // Enforce maximum message length (4000 characters)
    const MAX_MESSAGE_LENGTH = 4000;
    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(res, `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`, 400);
    }

    const message = Chat.createMessage(
      parseInt(roomId),
      req.user.id,
      trimmedContent
    );

    return successResponse(res, { message }, 'Message sent', 201);
  } catch (error) {
    console.error('Send message error:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

export const getOrCreateDirectRoom = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (parseInt(userId) === req.user.id) {
      return errorResponse(res, 'Cannot create direct room with yourself', 400);
    }

    const room = Chat.getOrCreateDirectRoom(req.user.id, parseInt(userId));

    return successResponse(res, { room });
  } catch (error) {
    console.error('Get/create direct room error:', error);
    return errorResponse(res, 'Failed to get or create direct room', 500);
  }
};

export const getRoomMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const members = Chat.getRoomMembers(parseInt(roomId));

    return successResponse(res, { members, count: members.length });
  } catch (error) {
    console.error('Get room members error:', error);
    return errorResponse(res, 'Failed to get room members', 500);
  }
};

export const addRoomMember = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return errorResponse(res, 'User ID is required', 400);
    }

    Chat.addMember(parseInt(roomId), parseInt(userId));
    return successResponse(res, null, 'Member added');
  } catch (error) {
    console.error('Add member error:', error);
    return errorResponse(res, 'Failed to add member', 500);
  }
};

export const removeRoomMember = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    Chat.removeMember(parseInt(roomId), parseInt(userId));
    return successResponse(res, null, 'Member removed');
  } catch (error) {
    console.error('Remove member error:', error);
    return errorResponse(res, 'Failed to remove member', 500);
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', 400);
    }

    const messages = Chat.searchMessages(q, req.user.id, parseInt(limit));
    return successResponse(res, { messages, count: messages.length });
  } catch (error) {
    console.error('Search messages error:', error);
    return errorResponse(res, 'Failed to search messages', 500);
  }
};

export default {
  getUserRooms,
  createRoom,
  getRoomMessages,
  sendMessage,
  getOrCreateDirectRoom,
  getRoomMembers,
  addRoomMember,
  removeRoomMember,
  searchMessages,
};
