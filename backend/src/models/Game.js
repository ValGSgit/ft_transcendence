import db from '../config/database.js';

export class Game {
  static create(player1Id, player2Id = null, isAiGame = false, aiDifficulty = null) {
    const stmt = db.prepare(`
      INSERT INTO games (player1_id, player2_id, is_ai_game, ai_difficulty, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);
    const result = stmt.run(player1Id, player2Id, isAiGame ? 1 : 0, aiDifficulty);
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT g.*,
             p1.username as player1_username,
             p1.avatar as player1_avatar,
             p2.username as player2_username,
             p2.avatar as player2_avatar,
             w.username as winner_username
      FROM games g
      JOIN users p1 ON g.player1_id = p1.id
      LEFT JOIN users p2 ON g.player2_id = p2.id
      LEFT JOIN users w ON g.winner_id = w.id
      WHERE g.id = ?
    `);
    return stmt.get(id);
  }

  static startGame(gameId) {
    const stmt = db.prepare(`
      UPDATE games
      SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(gameId);
    return this.findById(gameId);
  }

  static updateScore(gameId, player1Score, player2Score) {
    const stmt = db.prepare(`
      UPDATE games
      SET player1_score = ?, player2_score = ?
      WHERE id = ?
    `);
    stmt.run(player1Score, player2Score, gameId);
    return this.findById(gameId);
  }

  static endGame(gameId, winnerId) {
    const game = this.findById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const transaction = db.transaction(() => {
      // Update game
      db.prepare(`
        UPDATE games
        SET status = 'completed', winner_id = ?, ended_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(winnerId, gameId);

      // Update stats for player 1
      this.updatePlayerStats(game.player1_id, game.player1_score, winnerId === game.player1_id);

      // Update stats for player 2 (if not AI)
      if (game.player2_id && !game.is_ai_game) {
        this.updatePlayerStats(game.player2_id, game.player2_score, winnerId === game.player2_id);
      }
    });

    transaction();
    return this.findById(gameId);
  }

  static updatePlayerStats(userId, score, won) {
    const stats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    const gamesPlayed = stats.games_played + 1;
    const gamesWon = stats.games_won + (won ? 1 : 0);
    const gamesLost = stats.games_lost + (won ? 0 : 1);
    const totalScore = stats.total_score + score;
    const highestScore = Math.max(stats.highest_score, score);
    const currentStreak = won ? stats.current_streak + 1 : 0;
    const winStreak = Math.max(stats.win_streak, currentStreak);

    db.prepare(`
      UPDATE user_stats
      SET games_played = ?,
          games_won = ?,
          games_lost = ?,
          total_score = ?,
          highest_score = ?,
          win_streak = ?,
          current_streak = ?
      WHERE user_id = ?
    `).run(gamesPlayed, gamesWon, gamesLost, totalScore, highestScore, winStreak, currentStreak, userId);
  }

  static getUserGames(userId, limit = 20, offset = 0) {
    const stmt = db.prepare(`
      SELECT g.*,
             p1.username as player1_username,
             p1.avatar as player1_avatar,
             p2.username as player2_username,
             p2.avatar as player2_avatar,
             w.username as winner_username
      FROM games g
      JOIN users p1 ON g.player1_id = p1.id
      LEFT JOIN users p2 ON g.player2_id = p2.id
      LEFT JOIN users w ON g.winner_id = w.id
      WHERE g.player1_id = ? OR g.player2_id = ?
      ORDER BY g.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, userId, limit, offset);
  }

  static getLeaderboard(limit = 100) {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.avatar,
             s.games_played, s.games_won, s.games_lost,
             s.total_score, s.highest_score, s.win_streak,
             CAST(s.games_won AS FLOAT) / NULLIF(s.games_played, 0) as win_rate
      FROM user_stats s
      JOIN users u ON s.user_id = u.id
      WHERE s.games_played > 0
      ORDER BY s.games_won DESC, win_rate DESC, s.total_score DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  static abandonGame(gameId) {
    const stmt = db.prepare(`
      UPDATE games
      SET status = 'abandoned', ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(gameId);
    return this.findById(gameId);
  }

  static getActiveGames() {
    const stmt = db.prepare(`
      SELECT g.*,
             p1.username as player1_username,
             p1.avatar as player1_avatar,
             p2.username as player2_username,
             p2.avatar as player2_avatar
      FROM games g
      JOIN users p1 ON g.player1_id = p1.id
      LEFT JOIN users p2 ON g.player2_id = p2.id
      WHERE g.status IN ('pending', 'in_progress')
      ORDER BY g.created_at DESC
    `);
    return stmt.all();
  }
}

export default Game;
