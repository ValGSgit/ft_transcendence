import { describe, it, expect, beforeEach } from '@jest/globals';
import Game from '../../models/Game.js';
import User from '../../models/User.js';

describe('Game Model', () => {
  let testUser1, testUser2;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser1 = User.create({
      username: `gamemodel1${uniqueId}`,
      email: `gamemodel1${uniqueId}@example.com`,
      password: 'hashedpassword'
    });

    testUser2 = User.create({
      username: `gamemodel2${uniqueId}`,
      email: `gamemodel2${uniqueId}@example.com`,
      password: 'hashedpassword'
    });
  });

  describe('create', () => {
    it('should create AI game', () => {
      const game = Game.create(testUser1.id, null, true, 'medium');

      expect(game).toBeDefined();
      expect(game.player1_id).toBe(testUser1.id);
      expect(game.is_ai_game).toBe(1);
      expect(game.ai_difficulty).toBe('medium');
    });

    it('should create PvP game', () => {
      const game = Game.create(testUser1.id, testUser2.id, false, null);

      expect(game).toBeDefined();
      expect(game.player1_id).toBe(testUser1.id);
      expect(game.player2_id).toBe(testUser2.id);
      expect(game.is_ai_game).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find game by ID', () => {
      const game = Game.create(testUser1.id, null, true, 'easy');
      const found = Game.findById(game.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(game.id);
    });
  });

  describe('startGame', () => {
    it('should start a game', () => {
      const game = Game.create(testUser1.id, null, true, 'medium');
      const started = Game.startGame(game.id);

      expect(started.status).toBe('in_progress');
    });
  });

  describe('updateScore', () => {
    it('should update game score', () => {
      const game = Game.create(testUser1.id, null, true, 'medium');
      Game.startGame(game.id);
      
      const updated = Game.updateScore(game.id, 5, 3);

      expect(updated.player1_score).toBe(5);
      expect(updated.player2_score).toBe(3);
    });
  });

  describe('endGame', () => {
    it('should end a game with winner', () => {
      const game = Game.create(testUser1.id, null, true, 'medium');
      Game.startGame(game.id);
      
      const ended = Game.endGame(game.id, testUser1.id);

      expect(ended.status).toBe('completed');
      expect(ended.winner_id).toBe(testUser1.id);
    });
  });

  describe('getUserGames', () => {
    it('should get user games', () => {
      Game.create(testUser1.id, null, true, 'medium');
      Game.create(testUser1.id, testUser2.id, false, null);

      const games = Game.getUserGames(testUser1.id);
      expect(games.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getActiveGames', () => {
    it('should get active games for user', () => {
      const game = Game.create(testUser1.id, null, true, 'medium');
      Game.startGame(game.id);

      const activeGames = Game.getActiveGames(testUser1.id);
      expect(activeGames.length).toBeGreaterThanOrEqual(1);
    });
  });
});
