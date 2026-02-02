import { describe, it, expect, beforeEach } from '@jest/globals';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { generateToken } from '../../utils/auth.js';
import User from '../../models/User.js';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
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
    next = () => {};
  });

  describe('authenticate', () => {
    it('should reject request without authorization header', async () => {
      await authenticate(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('No token provided');
    });

    it('should reject request with invalid bearer format', async () => {
      req.headers.authorization = 'InvalidFormat token';
      
      await authenticate(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(res.data.message).toBe('No token provided');
    });

    it('should reject request with invalid token', async () => {
      req.headers.authorization = 'Bearer invalid.token.here';
      
      await authenticate(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(res.data.message).toBe('Invalid or expired token');
    });

    it('should reject request for non-existent user', async () => {
      const token = generateToken({ id: 99999, username: 'nonexistent' });
      req.headers.authorization = `Bearer ${token}`;
      
      await authenticate(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(res.data.message).toBe('User not found');
    });

    it('should attach user to request with valid token', async () => {
      // Create a test user first
      const uniqueId = Date.now() + Math.random();
      const testUser = User.create({
        username: `testuser_auth${uniqueId}`,
        email: `testauth${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      const token = generateToken({ id: testUser.id, username: testUser.username });
      req.headers.authorization = `Bearer ${token}`;
      
      let nextCalled = false;
      const testNext = () => { nextCalled = true; };
      
      await authenticate(req, res, testNext);
      
      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(testUser.id);
      expect(req.user.username).toBe(testUser.username);
    });
  });

  describe('optionalAuth', () => {
    it('should continue without auth if no token provided', async () => {
      let nextCalled = false;
      const testNext = () => { nextCalled = true; };
      
      await optionalAuth(req, res, testNext);
      
      expect(nextCalled).toBe(true);
      expect(req.user).toBeNull();
    });

    it('should continue without auth if invalid token', async () => {
      req.headers.authorization = 'Bearer invalid.token';
      
      let nextCalled = false;
      const testNext = () => { nextCalled = true; };
      
      await optionalAuth(req, res, testNext);
      
      expect(nextCalled).toBe(true);
    });

    it('should attach user if valid token provided', async () => {
      const uniqueId = Date.now() + Math.random();
      const testUser = User.create({
        username: `testuser_optional${uniqueId}`,
        email: `testoptional${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      const token = generateToken({ id: testUser.id, username: testUser.username });
      req.headers.authorization = `Bearer ${token}`;
      
      let nextCalled = false;
      const testNext = () => { nextCalled = true; };
      
      await optionalAuth(req, res, testNext);
      
      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(testUser.id);
    });
  });
});
