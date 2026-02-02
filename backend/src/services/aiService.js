import config from '../config/index.js';

/**
 * AI Service for Pong Game
 * Provides intelligent opponent gameplay with adjustable difficulty
 */
export class AIService {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.config = config.game.ai[difficulty];
    this.paddleY = 0;
    this.targetY = 0;
    this.lastReactionTime = 0;
    this.reactionDelay = 0;
  }

  /**
   * Calculate the AI paddle's next move
   * @param {Object} gameState - Current game state
   * @returns {Object} - AI move decision
   */
  calculateMove(gameState) {
    const { ball, aiPaddle, timestamp } = gameState;
    
    // Simulate reaction time
    const timeSinceLastReaction = (timestamp || Date.now()) - this.lastReactionTime;
    if (timeSinceLastReaction < this.reactionDelay) {
      return { direction: 0, paddleY: this.paddleY };
    }

    // Determine if AI should react
    if (this.shouldReact(ball)) {
      this.lastReactionTime = timestamp || Date.now();
      this.reactionDelay = this.config.reactionTime * 1000;
      
      // Predict ball position
      this.targetY = this.predictBallPosition(ball, aiPaddle);
      
      // Add inaccuracy based on difficulty
      this.targetY = this.applyAccuracy(this.targetY);
    }

    // Calculate movement direction
    const direction = this.calculateDirection(aiPaddle, this.targetY);
    
    // Update paddle position
    this.paddleY = this.updatePaddlePosition(aiPaddle, direction);

    return {
      direction,
      paddleY: this.paddleY,
      targetY: this.targetY,
    };
  }

  /**
   * Determine if AI should react to the ball
   */
  shouldReact(ball) {
    // Only react if ball is moving towards AI
    return ball.velocityX > 0;
  }

  /**
   * Predict where the ball will be when it reaches the AI paddle
   */
  predictBallPosition(ball, paddle) {
    const { x, y, velocityX, velocityY, radius } = ball;
    const paddleX = paddle.x;
    
    if (velocityX === 0) return y;

    // Calculate time until ball reaches paddle
    const timeToReach = (paddleX - x) / velocityX;
    
    if (timeToReach < 0) return y; // Ball moving away

    // Predict Y position with basic physics
    let predictedY = y + (velocityY * timeToReach);
    
    // Account for bounces off top/bottom walls
    const fieldHeight = config.game.fieldHeight;
    const ballRadius = radius || config.game.ballRadius;
    
    // Limit iterations to prevent infinite loops
    let iterations = 0;
    const maxIterations = 10;
    
    while ((predictedY < ballRadius || predictedY > fieldHeight - ballRadius) && iterations < maxIterations) {
      if (predictedY < ballRadius) {
        predictedY = ballRadius + (ballRadius - predictedY);
      } else if (predictedY > fieldHeight - ballRadius) {
        predictedY = (fieldHeight - ballRadius) - (predictedY - (fieldHeight - ballRadius));
      }
      iterations++;
    }
    
    // Clamp to valid range as a safety net
    return Math.max(ballRadius, Math.min(fieldHeight - ballRadius, predictedY));
  }

  /**
   * Apply accuracy variation based on difficulty
   */
  applyAccuracy(targetY) {
    const accuracy = this.config.accuracy;
    const maxError = (1 - accuracy) * 2; // Maximum error in units
    const error = (Math.random() - 0.5) * maxError;
    
    return targetY + error;
  }

  /**
   * Calculate which direction the paddle should move
   */
  calculateDirection(paddle, targetY) {
    const paddleCenter = paddle.y;
    const threshold = 0.1; // Dead zone to prevent jittering

    if (Math.abs(targetY - paddleCenter) < threshold) {
      return 0; // Don't move
    }

    return targetY > paddleCenter ? 1 : -1;
  }

  /**
   * Update paddle position based on direction
   */
  updatePaddlePosition(paddle, direction) {
    if (direction === 0) return paddle.y;

    const speed = this.config.speed;
    const paddleHeight = config.game.paddleHeight;
    const fieldHeight = config.game.fieldHeight;
    
    let newY = paddle.y + (direction * speed);

    // Keep paddle within bounds
    const minY = paddleHeight / 2;
    const maxY = fieldHeight - (paddleHeight / 2);
    
    newY = Math.max(minY, Math.min(maxY, newY));

    return newY;
  }

  /**
   * Reset AI state for a new game
   */
  reset() {
    this.paddleY = config.game.fieldHeight / 2;
    this.targetY = this.paddleY;
    this.lastReactionTime = 0;
    this.reactionDelay = 0;
  }

  /**
   * Change AI difficulty mid-game
   */
  setDifficulty(difficulty) {
    if (config.game.ai[difficulty]) {
      this.difficulty = difficulty;
      this.config = config.game.ai[difficulty];
    }
  }

  /**
   * Get current AI stats
   */
  getStats() {
    return {
      difficulty: this.difficulty,
      config: this.config,
      paddleY: this.paddleY,
      targetY: this.targetY,
    };
  }
}

/**
 * Factory function to create AI opponents
 */
export const createAI = (difficulty = 'medium') => {
  return new AIService(difficulty);
};

export default {
  AIService,
  createAI,
};
