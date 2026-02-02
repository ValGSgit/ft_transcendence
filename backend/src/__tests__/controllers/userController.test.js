import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  searchUsers
} from '../../controllers/userController.js';
import User from '../../models/User.js';

describe('User Controller', () => {
  let req, res, testUser;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser = User.create({
      username: `userctrltest${uniqueId}`,
      email: `userctrl${uniqueId}@example.com`,
      password: 'hashedpassword'
    });

    req = {
      body: {},
      params: {},
      query: {},
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

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      await getAllUsers(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.users).toBeDefined();
      expect(Array.isArray(res.data.data.users)).toBe(true);
    });

    it('should respect limit and offset', async () => {
      req.query = { limit: '10', offset: '5' };

      await getAllUsers(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      req.params = { id: testUser.id.toString() };

      await getUserById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user).toBeDefined();
      expect(res.data.data.stats).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      req.params = { id: '99999' };

      await getUserById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data.message).toBe('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      req.body = {
        bio: 'New bio',
        status: 'New status'
      };

      await updateProfile(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      const uniqueId = Date.now() + Math.random();
      const otherUser = User.create({
        username: `existinguser${uniqueId}`,
        email: `existing${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      req.body = {
        username: `existinguser${uniqueId}`
      };

      await updateProfile(req, res);

      expect(res.statusCode).toBe(409);
      expect(res.data.message).toContain('Username already taken');
    });

    it('should reject duplicate email', async () => {
      const uniqueId = Date.now() + Math.random();
      const otherUser = User.create({
        username: `otheruseremail${uniqueId}`,
        email: `existingemail${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      req.body = {
        email: `existingemail${uniqueId}@example.com`
      };

      await updateProfile(req, res);

      expect(res.statusCode).toBe(409);
      expect(res.data.message).toContain('Email already registered');
    });

    it('should allow updating own username', async () => {
      const uniqueId = Date.now() + Math.random();
      req.body = {
        username: `newusername${uniqueId}`
      };

      await updateProfile(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      req.query = { q: 'user' };

      await searchUsers(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.users).toBeDefined();
    });

    it('should reject short search query', async () => {
      req.query = { q: 'a' };

      await searchUsers(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('at least 2 characters');
    });

    it('should reject missing search query', async () => {
      req.query = {};

      await searchUsers(req, res);

      expect(res.statusCode).toBe(400);
    });
  });
});
