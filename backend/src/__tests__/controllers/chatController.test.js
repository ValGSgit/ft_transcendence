import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getUserRooms,
  createRoom,
  getRoomMessages,
  sendMessage,
  getOrCreateDirectRoom
} from '../../controllers/chatController.js';
import User from '../../models/User.js';

describe('Chat Controller', () => {
  let req, res, testUser;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser = User.create({
      username: `chatuser${uniqueId}`,
      email: `chatuser${uniqueId}@example.com`,
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

  describe('getUserRooms', () => {
    it('should get user rooms successfully', async () => {
      await getUserRooms(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.rooms).toBeDefined();
      expect(Array.isArray(res.data.data.rooms)).toBe(true);
    });
  });

  describe('createRoom', () => {
    it('should create room successfully', async () => {
      req.body = {
        name: 'Test Room',
        type: 'channel'
      };

      await createRoom(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data.room).toBeDefined();
    });

    it('should reject room creation without name', async () => {
      req.body = {};

      await createRoom(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });

    it('should create room with default type', async () => {
      req.body = {
        name: 'Default Type Room'
      };

      await createRoom(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
    });

    it('should create room with members', async () => {
      const uniqueId = Date.now() + Math.random();
      const otherUser = User.create({
        username: `otheruser${uniqueId}`,
        email: `other${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      req.body = {
        name: 'Room with members',
        type: 'channel',
        members: [otherUser.id]
      };

      await createRoom(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
    });
  });

  describe('getRoomMessages', () => {
    it('should get room messages successfully', async () => {
      req.params = { roomId: '1' };
      req.query = {};

      await getRoomMessages(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.messages).toBeDefined();
    });

    it('should respect limit and offset parameters', async () => {
      req.params = { roomId: '1' };
      req.query = { limit: '10', offset: '5' };

      await getRoomMessages(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      req.params = { roomId: '1' };
      req.body = { content: 'Hello, world!' };

      await sendMessage(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data.message).toBeDefined();
    });

    it('should reject empty message', async () => {
      req.params = { roomId: '1' };
      req.body = { content: '' };

      await sendMessage(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });

    it('should reject whitespace-only message', async () => {
      req.params = { roomId: '1' };
      req.body = { content: '   ' };

      await sendMessage(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });

    it('should reject message exceeding max length', async () => {
      req.params = { roomId: '1' };
      req.body = { content: 'a'.repeat(4001) };

      await sendMessage(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('maximum length');
    });

    it('should trim message content', async () => {
      req.params = { roomId: '1' };
      req.body = { content: '  Hello  ' };

      await sendMessage(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
    });

    it('should handle missing content field', async () => {
      req.params = { roomId: '1' };
      req.body = {};

      await sendMessage(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('getOrCreateDirectRoom', () => {
    it('should get or create direct room successfully', async () => {
      const uniqueId = Date.now() + Math.random();
      const otherUser = User.create({
        username: `directuser${uniqueId}`,
        email: `direct${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      req.params = { userId: otherUser.id.toString() };

      await getOrCreateDirectRoom(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.room).toBeDefined();
    });

    it('should reject creating direct room with self', async () => {
      req.params = { userId: testUser.id.toString() };

      await getOrCreateDirectRoom(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('yourself');
    });
  });
});
