import Friend from '../models/Friend.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return errorResponse(res, 'Receiver ID is required', 400);
    }

    if (senderId === parseInt(receiverId)) {
      return errorResponse(res, 'Cannot send friend request to yourself', 400);
    }

    // Check if users are blocked
    if (await Friend.isBlocked(senderId, parseInt(receiverId))) {
      return errorResponse(res, 'Cannot send friend request', 403);
    }

    const request = await Friend.sendRequest(senderId, parseInt(receiverId));

    // Create notification
    await Notification.create(
      parseInt(receiverId),
      'friend_request',
      'New Friend Request',
      `${req.user.username} sent you a friend request`,
      { requestId: request.id, senderId }
    );

    return successResponse(res, { request }, 'Friend request sent', 201);
  } catch (error) {
    console.error('Send friend request error:', error);
    return errorResponse(res, error.message || 'Failed to send friend request', 500);
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Friend.getPendingRequests(req.user.id);
    return successResponse(res, { requests, count: requests.length });
  } catch (error) {
    console.error('Get pending requests error:', error);
    return errorResponse(res, 'Failed to get pending requests', 500);
  }
};

export const getSentRequests = async (req, res) => {
  try {
    const requests = await Friend.getSentRequests(req.user.id);
    return successResponse(res, { requests, count: requests.length });
  } catch (error) {
    console.error('Get sent requests error:', error);
    return errorResponse(res, 'Failed to get sent requests', 500);
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const suggestions = await Friend.getSuggestions(req.user.id, limit);
    return successResponse(res, { suggestions, count: suggestions.length });
  } catch (error) {
    console.error('Get suggestions error:', error);
    return errorResponse(res, 'Failed to get suggestions', 500);
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Friend.acceptRequest(parseInt(requestId), req.user.id);

    // Create notification for sender
    await Notification.create(
      request.sender_id,
      'friend_request',
      'Friend Request Accepted',
      `${req.user.username} accepted your friend request`,
      { userId: req.user.id }
    );

    return successResponse(res, { request }, 'Friend request accepted');
  } catch (error) {
    console.error('Accept friend request error:', error);
    return errorResponse(res, error.message || 'Failed to accept friend request', 500);
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Friend.declineRequest(parseInt(requestId), req.user.id);

    return successResponse(res, { request }, 'Friend request declined');
  } catch (error) {
    console.error('Decline friend request error:', error);
    return errorResponse(res, error.message || 'Failed to decline friend request', 500);
  }
};

export const getFriends = async (req, res) => {
  try {
    const friends = await Friend.getFriends(req.user.id);
    return successResponse(res, { friends, count: friends.length });
  } catch (error) {
    console.error('Get friends error:', error);
    return errorResponse(res, 'Failed to get friends', 500);
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const friends = await Friend.getFriends(parseInt(id));
    return successResponse(res, { friends, count: friends.length });
  } catch (error) {
    console.error('Get user friends error:', error);
    return errorResponse(res, 'Failed to get friends', 500);
  }
};

export const unfriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    await Friend.unfriend(req.user.id, parseInt(friendId));
    return successResponse(res, null, 'Friend removed');
  } catch (error) {
    console.error('Unfriend error:', error);
    return errorResponse(res, 'Failed to unfriend', 500);
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return errorResponse(res, 'User ID is required', 400);
    }

    await Friend.blockUser(req.user.id, parseInt(userId));
    return successResponse(res, null, 'User blocked');
  } catch (error) {
    console.error('Block user error:', error);
    return errorResponse(res, 'Failed to block user', 500);
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await Friend.unblockUser(req.user.id, parseInt(userId));
    return successResponse(res, null, 'User unblocked');
  } catch (error) {
    console.error('Unblock user error:', error);
    return errorResponse(res, 'Failed to unblock user', 500);
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const blocked = await Friend.getBlockedUsers(req.user.id);
    return successResponse(res, { blocked, count: blocked.length });
  } catch (error) {
    console.error('Get blocked users error:', error);
    return errorResponse(res, 'Failed to get blocked users', 500);
  }
};

export default {
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getUserFriends,
  unfriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
};
