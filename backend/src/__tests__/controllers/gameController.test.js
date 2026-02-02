import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getGameConfig,
  createGame,
  getGame,
  startGame,
  updateScore
} from '../../controllers/gameController.js';
import User from '../../models/User.js';

describe('Game Controller', () => {
  let req, res, testUser;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser = User.create({
      username: `gameuser${uniqueId}`,
      email: `gameuser${uniqueId}@example.com`,
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

  describe('getGameConfig', () => {
    it('should return game configuration', async () => {
      await getGameConfig(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.config).toBeDefined();
    });
  });

  describe('createGame', () => {
    it('should create AI game successfully', async () => {
      req.body = {
        isAI: true,
        aiDifficulty: 'medium'
      };

      await createGame(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.data.game).toBeDefined();
    });

    it('should create AI game with mode parameter', async () => {
      req.body = {
        mode: 'ai',
        difficulty: 'hard'
      };

      await createGame(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
    });

    it('should create PvP game successfully', async () => {
      const uniqueId = Date.now() + Math.random();
      const opponent = User.create({
        username: `opponent${uniqueId}`,
        email: `opponent${uniqueId}@example.com`,
        password: 'hashedpassword'
      });

      req.body = {
        opponentId: opponent.id,
        isAI: false
      };

      await createGame(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
    });

    it('should reject PvP game without opponent', async () => {
      req.body = {
        isAI: false
      };

      await createGame(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('Opponent ID');
    });

    it('should reject AI game with invalid difficulty', async () => {
      req.body = {
        isAI: true,
        aiDifficulty: 'invalid'
      };

      await createGame(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('Invalid AI difficulty');
    });
  });

  describe('getGame', () => {
    it('should return 404 for non-existent game', async () => {
      req.params = { gameId: '99999' };

      await getGame(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data.message).toBe('Game not found');
    });
  });

  describe('startGame', () => {
    it('should return 404 for non-existent game', async () => {
      req.params = { gameId: '99999' };

      await startGame(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data.message).toBe('Game not found');
    });
  });

  describe('updateScore', () => {
    it('should reject without scores', async () => {
      req.params = { gameId: '1' };
      req.body = {};

      await updateScore(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.message).toContain('required');
    });
  });
});
