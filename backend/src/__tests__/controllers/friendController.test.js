import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getUserFriends,
  unfriend,
  blockUser,
  unblockUser,
  getBlockedUsers
} from '../../controllers/friendController.js';
import User from '../../models/User.js';
import Friend from '../../models/Friend.js';

describe('Friend Controller', () => {
  let req, res, testUser, otherUser;

  beforeEach(() => {
    const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
    testUser = User.create({
      username: `frienduser1${uniqueId}`,
      email: `friend1${uniqueId}@example.com`,
      password: 'hashedpassword'
    });

    otherUser = User.create({
      username: `frienduser2${uniqueId}`,
      email: `friend2${uniqueId}@example.com`,
      password: 'hashedpassword'
    });

    req = {
      body: {},
      params: {},
      user: testUser
    };
    res = {
      statusCode: null,
      data: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };
  });

  describe('sendFriendRequest', () => {
    it('should send friend request successfully', async () => {
      req.body = { receiverId: otherUser.id };

      await sendFriendRequest(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data.request).toBeDefined();
    });

    it('should reject request without receiverId', async () => {
      req.body = {};

      await sendFriendRequest(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });

    it('should reject friend request to self', async () => {
      req.body = { receiverId: testUser.id };

      await sendFriendRequest(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('yourself');
    });
  });

  describe('getPendingRequests', () => {
    it('should get pending requests successfully', async () => {
      await getPendingRequests(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.requests).toBeDefined();
      expect(Array.isArray(res.data.data.requests)).toBe(true);
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept friend request successfully', async () => {
      const request = Friend.sendRequest(otherUser.id, testUser.id);
      req.params = { requestId: request.id.toString() };

      await acceptFriendRequest(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('declineFriendRequest', () => {
    it('should decline friend request successfully', async () => {
      const request = Friend.sendRequest(otherUser.id, testUser.id);
      req.params = { requestId: request.id.toString() };

      await declineFriendRequest(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('getFriends', () => {
    it('should get friends list successfully', async () => {
      await getFriends(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.friends).toBeDefined();
      expect(Array.isArray(res.data.data.friends)).toBe(true);
    });
  });

  describe('getUserFriends', () => {
    it('should get user friends successfully', async () => {
      req.params = { id: otherUser.id.toString() };

      await getUserFriends(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.friends).toBeDefined();
    });
  });

  describe('unfriend', () => {
    it('should unfriend successfully', async () => {
      const request = Friend.sendRequest(testUser.id, otherUser.id);
      Friend.acceptRequest(request.id, otherUser.id);
      req.params = { friendId: otherUser.id.toString() };

      await unfriend(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      req.body = { userId: otherUser.id };

      await blockUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });

    it('should reject blocking without userId', async () => {
      req.body = {};

      await blockUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      Friend.blockUser(testUser.id, otherUser.id);
      req.params = { userId: otherUser.id.toString() };

      await unblockUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('getBlockedUsers', () => {
    it('should get blocked users successfully', async () => {
      await getBlockedUsers(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.blocked).toBeDefined();
      expect(Array.isArray(res.data.data.blocked)).toBe(true);
    });
  });
});
