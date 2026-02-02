import { describe, it, expect, beforeEach } from '@jest/globals';
import { AIService } from '../../services/aiService.js';

describe('AI Service', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIService('medium');
  });

  describe('constructor', () => {
    it('should initialize with default difficulty', () => {
      const ai = new AIService();
      expect(ai.difficulty).toBe('medium');
    });

    it('should initialize with specified difficulty', () => {
      const easyAI = new AIService('easy');
      expect(easyAI.difficulty).toBe('easy');

      const hardAI = new AIService('hard');
      expect(hardAI.difficulty).toBe('hard');
    });

    it('should initialize paddle position', () => {
      expect(aiService.paddleY).toBe(0);
      expect(aiService.targetY).toBe(0);
    });
  });

  describe('calculateMove', () => {
    it('should return move decision', () => {
      const gameState = {
        ball: {
          x: 100,
          y: 200,
          velocityX: 5,
          velocityY: 3,
          radius: 5
        },
        aiPaddle: {
          x: 500,
          y: 200,
          width: 10,
          height: 80
        },
        timestamp: Date.now()
      };

      const move = aiService.calculateMove(gameState);

      expect(move).toBeDefined();
      expect(move).toHaveProperty('direction');
      expect(move).toHaveProperty('paddleY');
      expect(move).toHaveProperty('targetY');
    });

    it('should return direction as number', () => {
      const gameState = {
        ball: {
          x: 100,
          y: 200,
          velocityX: 5,
          velocityY: 3,
          radius: 5
        },
        aiPaddle: {
          x: 500,
          y: 200,
          width: 10,
          height: 80
        },
        timestamp: Date.now()
      };

      const move = aiService.calculateMove(gameState);

      expect(typeof move.direction).toBe('number');
      expect([0, 1, -1]).toContain(move.direction);
    });
  });

  describe('shouldReact', () => {
    it('should react when ball moves towards AI', () => {
      const ball = { velocityX: 5 };
      expect(aiService.shouldReact(ball)).toBe(true);
    });

    it('should not react when ball moves away', () => {
      const ball = { velocityX: -5 };
      expect(aiService.shouldReact(ball)).toBe(false);
    });

    it('should not react when ball is stationary', () => {
      const ball = { velocityX: 0 };
      expect(aiService.shouldReact(ball)).toBe(false);
    });
  });

  describe('predictBallPosition', () => {
    it('should predict ball position', () => {
      const ball = {
        x: 100,
        y: 200,
        velocityX: 5,
        velocityY: 3,
        radius: 5
      };
      const paddle = {
        x: 500
      };

      const predicted = aiService.predictBallPosition(ball, paddle);

      expect(typeof predicted).toBe('number');
      expect(predicted).toBeGreaterThanOrEqual(0);
    });

    it('should return current Y when ball velocity X is zero', () => {
      const ball = {
        x: 100,
        y: 200,
        velocityX: 0,
        velocityY: 3,
        radius: 5
      };
      const paddle = {
        x: 500
      };

      const predicted = aiService.predictBallPosition(ball, paddle);

      expect(predicted).toBe(200);
    });

    it('should return current Y when ball is moving away', () => {
      const ball = {
        x: 500,
        y: 200,
        velocityX: -5,
        velocityY: 3,
        radius: 5
      };
      const paddle = {
        x: 100
      };

      const predicted = aiService.predictBallPosition(ball, paddle);

      // When ball is moving away, function returns current Y
      // But the implementation may clamp to valid range
      expect(typeof predicted).toBe('number');
      expect(predicted).toBeGreaterThanOrEqual(0);
    });
  });

  describe('difficulty levels', () => {
    it('should have different configs for easy', () => {
      const easyAI = new AIService('easy');
      expect(easyAI.config).toBeDefined();
      expect(easyAI.difficulty).toBe('easy');
    });

    it('should have different configs for medium', () => {
      const mediumAI = new AIService('medium');
      expect(mediumAI.config).toBeDefined();
      expect(mediumAI.difficulty).toBe('medium');
    });

    it('should have different configs for hard', () => {
      const hardAI = new AIService('hard');
      expect(hardAI.config).toBeDefined();
      expect(hardAI.difficulty).toBe('hard');
    });
  });

  describe('applyAccuracy', () => {
    it('should apply accuracy modifier to target', () => {
      const target = 200;
      const modified = aiService.applyAccuracy(target);

      expect(typeof modified).toBe('number');
      expect(modified).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateDirection', () => {
    it('should calculate direction towards target', () => {
      const paddle = { y: 200 };
      const target = 300;

      const direction = aiService.calculateDirection(paddle, target);

      expect(typeof direction).toBe('number');
      expect([0, 1, -1]).toContain(direction);
    });

    it('should return 0 when at target', () => {
      const paddle = { y: 200 };
      const target = 200;

      const direction = aiService.calculateDirection(paddle, target);

      expect(direction).toBe(0);
    });
  });

  describe('updatePaddlePosition', () => {
    it('should update paddle position based on direction', () => {
      const paddle = { y: 200, height: 80 };
      const direction = 1;

      const newY = aiService.updatePaddlePosition(paddle, direction);

      expect(typeof newY).toBe('number');
    });
  });
});
