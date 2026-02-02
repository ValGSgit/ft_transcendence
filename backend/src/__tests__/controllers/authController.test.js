import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getMe
} from '../../controllers/authController.js';
import User from '../../models/User.js';
import * as authUtils from '../../utils/auth.js';

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
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
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      req.body = {
        username: `newuser${uniqueId}`,
        email: `newuser${uniqueId}@example.com`,
        password: 'Password123!'
      };

      await register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user).toBeDefined();
      expect(res.data.data.token).toBeDefined();
      expect(res.data.data.user.password).toBeUndefined();
    });

    it('should reject registration with missing fields', async () => {
      req.body = { username: 'test' };

      await register(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });

    it('should reject registration with invalid email', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      req.body = {
        username: `testuser${uniqueId}`,
        email: 'invalid-email',
        password: 'Password123!'
      };

      await register(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('Invalid email');
    });

    it('should reject registration with invalid username', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      req.body = {
        username: 'ab',
        email: `valid${uniqueId}@example.com`,
        password: 'Password123!'
      };

      await register(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('Username');
    });

    it('should reject registration with weak password', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      req.body = {
        username: `validuser${uniqueId}`,
        email: `valid${uniqueId}@example.com`,
        password: 'weak'
      };

      await register(req, res);

      expect(res.statusCode).toBe(400);
    });

    it('should reject duplicate email', async () => {
      const uniqueId = Math.floor(Date.now() % 10000);  // Keep it short
      const hashedPassword = await authUtils.hashPassword('Password123!');
      User.create({
        username: `exist${uniqueId}`,
        email: `dup${uniqueId}@test.com`,
        password: hashedPassword
      });

      req.body = {
        username: `new${uniqueId}`,
        email: `dup${uniqueId}@test.com`,
        password: 'Password123!'
      };

      await register(req, res);

      expect(res.statusCode).toBe(409);
      expect(res.data.message).toContain('Email already registered');
    });

    it('should reject duplicate username', async () => {
      const uniqueId = Math.floor(Date.now() % 10000);  // Keep it short
      const hashedPassword = await authUtils.hashPassword('Password123!');
      const firstUser = User.create({
        username: `dupuser${uniqueId}`,
        email: `existing${uniqueId}@example.com`,
        password: hashedPassword
      });

      req.body = {
        username: `dupuser${uniqueId}`,
        email: `new${uniqueId}@example.com`,
        password: 'Password123!'
      };

      await register(req, res);

      expect(res.statusCode).toBe(409);
      expect(res.data.message).toContain('Username already taken');
    });
  });

  describe('login', () => {
    it('should reject login with missing credentials', async () => {
      req.body = { email: 'test@example.com' };

      await login(req, res);

      expect(res.statusCode).toBe(400);
    });

    it('should reject login with invalid email', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      await login(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.data.message).toBe('Invalid credentials');
    });

    it('should login successfully with valid credentials', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      const hashedPassword = await authUtils.hashPassword('Password123!');
      User.create({
        username: `loginuser${uniqueId}`,
        email: `login${uniqueId}@example.com`,
        password: hashedPassword
      });

      req.body = {
        email: `login${uniqueId}@example.com`,
        password: 'Password123!'
      };

      await login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user).toBeDefined();
      expect(res.data.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      const hashedPassword = await authUtils.hashPassword('Password123!');
      User.create({
        username: `loginuser2${uniqueId}`,
        email: `login2${uniqueId}@example.com`,
        password: hashedPassword
      });

      req.body = {
        email: `login2${uniqueId}@example.com`,
        password: 'WrongPassword!'
      };

      await login(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.data.message).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      req.user = { id: 1 };

      await logout(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('refreshToken', () => {
    it('should reject without refresh token', async () => {
      req.body = {};

      await refreshToken(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });

    it('should reject invalid refresh token', async () => {
      req.body = { refreshToken: 'invalid.token.here' };

      await refreshToken(req, res);

      expect(res.statusCode).toBe(401);
    });

    it('should refresh token successfully', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      const user = User.create({
        username: `refreshuser${uniqueId}`,
        email: `refresh${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      const oldRefreshToken = authUtils.generateRefreshToken({ id: user.id });
      req.body = { refreshToken: oldRefreshToken };

      await refreshToken(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.data.token).toBeDefined();
      expect(res.data.data.refreshToken).toBeDefined();
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      const uniqueId = Math.floor(Date.now() + Math.random() * 1000);
      const user = User.create({
        username: `meuser${uniqueId}`,
        email: `me${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      req.user = { id: user.id };

      await getMe(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.data.user).toBeDefined();
      expect(res.data.data.stats).toBeDefined();
    });
  });
});

