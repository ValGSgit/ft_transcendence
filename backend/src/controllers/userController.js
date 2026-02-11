import User from '../models/User.js';
import { sanitizeUser } from '../utils/validation.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { hashPassword } from '../utils/auth.js';

export const getAllUsers = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const users = await User.findAll(parseInt(limit), parseInt(offset));

    return successResponse(res, {
      users: users.map(sanitizeUser),
      count: users.length,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, 'Failed to get users', 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(parseInt(id));

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const stats = await User.getStats(parseInt(id));

    return successResponse(res, {
      user: sanitizeUser(user),
      stats,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(res, 'Failed to get user', 500);
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findByUsername(username);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const stats = await User.getStats(user.id);

    return successResponse(res, {
      user: sanitizeUser(user),
      stats,
      isOwnProfile: req.user.id === user.id
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    return errorResponse(res, 'Failed to get user', 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, avatar, bio, status, password } = req.body;

    const updateData = {};

    if (username) {
      // Check if username is already taken
      const existing = await User.findByUsername(username);
      if (existing && existing.id !== userId) {
        return errorResponse(res, 'Username already taken', 409);
      }
      updateData.username = username;
    }

    if (email) {
      // Check if email is already taken
      const existing = await User.findByEmail(email);
      if (existing && existing.id !== userId) {
        return errorResponse(res, 'Email already registered', 409);
      }
      updateData.email = email;
    }

    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (status !== undefined) updateData.status = status;

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await User.update(userId, updateData);

    return successResponse(res, {
      user: sanitizeUser(updatedUser),
    }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', 400);
    }

    const users = await User.search(q);

    return successResponse(res, {
      users: users.map(sanitizeUser),
      count: users.length,
    });
  } catch (error) {
    console.error('Search users error:', error);
    return errorResponse(res, 'Failed to search users', 500);
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await User.getStats(parseInt(id));

    if (!stats) {
      return errorResponse(res, 'Stats not found', 404);
    }

    return successResponse(res, { stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse(res, 'Failed to get stats', 500);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const stats = await User.getStats(userId);

    return successResponse(res, {
      user: sanitizeUser(user),
      stats,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user profile', 500);
  }
};

export const updateFarmStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { coins, alpacas, blob } = req.body;

    // Validate input
    if (coins !== undefined && (typeof coins !== 'number' || coins < 0)) {
      return errorResponse(res, 'Invalid coins value', 400);
    }
    if (alpacas !== undefined && (typeof alpacas !== 'number' || alpacas < 1)) {
      return errorResponse(res, 'Invalid alpacas value', 400);
    }

    const stats = await User.updateFarmStats(userId, { coins, alpacas ,blob });
    
    if (!stats) {
      return errorResponse(res, 'Stats not found', 404);
    }

    return successResponse(res, { stats }, 'Farm stats updated successfully');
  } catch (error) {
    console.error('Update farm stats error:', error);
    return errorResponse(res, 'Failed to update farm stats', 500);
  }
};

export default {
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateProfile,
  searchUsers,
  getUserStats,
  getCurrentUser,
  updateFarmStats,
};
