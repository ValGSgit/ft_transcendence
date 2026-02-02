// TypeScript declarations for PongGame
export class PongGame {
  constructor(container: HTMLElement);
  movePaddle(paddleNumber: number, direction: number): void;
  getScore(): { player1: number; player2: number };
  resize(): void;
  dispose(): void;
}
