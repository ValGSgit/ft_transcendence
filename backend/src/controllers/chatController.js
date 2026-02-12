import Chat from '../models/Chat.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Chat.getUserRooms(req.user.id);
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

    const room = await Chat.createRoom(name, type, req.user.id);

    // Add creator as member
    await Chat.addMember(room.id, req.user.id);

    // Add other members
    for (const memberId of members) {
      if (memberId !== req.user.id) {
        await Chat.addMember(room.id, parseInt(memberId));
      }
    }

    return successResponse(res, { room }, 'Room created', 201);
  } catch (error) {
    console.error('Create room error:', error);
    return errorResponse(res, 'Failed to create room', 500);
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, page, offset } = req.query;

    // Verify user is a member of this room
    const members = await Chat.getRoomMembers(parseInt(roomId));
    const isMember = members.some(m => m.user_id === req.user.id || m.id === req.user.id);
    if (!isMember) {
      return errorResponse(res, 'You are not a member of this room', 403);
    }

    // Support both page and offset parameters
    const finalLimit = parseInt(limit);
    const finalOffset = offset !== undefined 
      ? parseInt(offset) 
      : ((parseInt(page) || 1) - 1) * finalLimit;

    const messages = await Chat.getRoomMessages(
      parseInt(roomId),
      finalLimit,
      finalOffset
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

    // Verify user is a member of this room
    const members = await Chat.getRoomMembers(parseInt(roomId));
    const isMember = members.some(m => m.user_id === req.user.id || m.id === req.user.id);
    if (!isMember) {
      return errorResponse(res, 'You are not a member of this room', 403);
    }

    if (!content || !content.trim()) {
      return errorResponse(res, 'Message content is required', 400);
    }

    const trimmedContent = content.trim();
    
    // Enforce maximum message length (4000 characters)
    const MAX_MESSAGE_LENGTH = 4000;
    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(res, `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`, 400);
    }

    const message = await Chat.createMessage(
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

    const room = await Chat.getOrCreateDirectRoom(req.user.id, parseInt(userId));

    return successResponse(res, { room });
  } catch (error) {
    console.error('Get/create direct room error:', error);
    return errorResponse(res, 'Failed to get or create direct room', 500);
  }
};

export const getRoomMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const members = await Chat.getRoomMembers(parseInt(roomId));

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

    // Only existing members can add new members
    const members = await Chat.getRoomMembers(parseInt(roomId));
    const isMember = members.some(m => m.user_id === req.user.id || m.id === req.user.id);
    if (!isMember) {
      return errorResponse(res, 'Only room members can add new members', 403);
    }

    await Chat.addMember(parseInt(roomId), parseInt(userId));
    return successResponse(res, null, 'Member added');
  } catch (error) {
    console.error('Add member error:', error);
    return errorResponse(res, 'Failed to add member', 500);
  }
};

export const removeRoomMember = async (req, res) => {
  try {
    const { roomId, userId } = req.params;

    // Only allow self-removal or room creator removal
    const requestUserOwnsAction = parseInt(userId) === req.user.id;
    if (!requestUserOwnsAction) {
      const members = await Chat.getRoomMembers(parseInt(roomId));
      const isMember = members.some(m => m.user_id === req.user.id || m.id === req.user.id);
      if (!isMember) {
        return errorResponse(res, 'Not authorized to remove members from this room', 403);
      }
    }

    await Chat.removeMember(parseInt(roomId), parseInt(userId));
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

    const messages = await Chat.searchMessages(q, req.user.id, parseInt(limit));
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
