import db from '../config/database.js';
import crypto from 'crypto';

export class User {
  static create({ username, email, password, avatar, bio }) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, avatar, bio)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      username, 
      email, 
      password,
      avatar || '/avatars/default.png',
      bio || 'Hey there! I am using Transcendence'
    );
    
    // Create user stats
    const statsStmt = db.prepare(`
      INSERT INTO user_stats (user_id) VALUES (?)
    `);
    statsStmt.run(result.lastInsertRowid);
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar, bio, status, online, two_factor_enabled, last_seen, created_at, updated_at
      FROM users WHERE id = ?
    `);
    return stmt.get(id);
  }

  static findByIdWithPassword(id) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);
    return stmt.get(id);
  }

  static findByEmail(email) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `);
    return stmt.get(email);
  }

  static findByUsername(username) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE username = ?
    `);
    return stmt.get(username);
  }

  static findByEmailOrUsername(identifier) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE email = ? OR username = ?
    `);
    return stmt.get(identifier, identifier);
  }

  static findAll(limit = 100, offset = 0) {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar, bio, status, online, last_seen, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }

  static update(id, data) {
    const fields = [];
    const values = [];

    if (data.username) {
      fields.push('username = ?');
      values.push(data.username);
    }
    if (data.email) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(data.avatar);
    }
    if (data.bio !== undefined) {
      fields.push('bio = ?');
      values.push(data.bio);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.password) {
      fields.push('password = ?');
      values.push(data.password);
    }
    if (data.two_factor_enabled !== undefined) {
      fields.push('two_factor_enabled = ?');
      values.push(data.two_factor_enabled ? 1 : 0);
    }
    if (data.two_factor_secret !== undefined) {
      fields.push('two_factor_secret = ?');
      values.push(data.two_factor_secret);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);
    stmt.run(...values);
    return this.findById(id);
  }

  static setOnline(id, online) {
    const stmt = db.prepare(`
      UPDATE users
      SET online = ?, last_seen = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(online ? 1 : 0, id);
  }

  static enable2FA(id, secret) {
    const stmt = db.prepare(`
      UPDATE users
      SET two_factor_enabled = 1, two_factor_secret = ?
      WHERE id = ?
    `);
    stmt.run(secret, id);
    return this.findById(id);
  }

  static disable2FA(id) {
    const stmt = db.prepare(`
      UPDATE users
      SET two_factor_enabled = 0, two_factor_secret = NULL
      WHERE id = ?
    `);
    stmt.run(id);
    return this.findById(id);
  }

  static get2FASecret(id) {
    const stmt = db.prepare(`
      SELECT two_factor_secret FROM users WHERE id = ?
    `);
    const result = stmt.get(id);
    return result?.two_factor_secret;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }

  static getStats(userId) {
    const stmt = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `);
    return stmt.get(userId);
  }

  static updateFarmStats(userId, { coins, alpacas }) {
    const stats = this.getStats(userId);
    if (!stats) return null;

    const newCoins = coins !== undefined ? coins : stats.farm_coins;
    const newAlpacas = alpacas !== undefined ? alpacas : stats.farm_alpacas;

    const stmt = db.prepare(`
      UPDATE user_stats
      SET farm_coins = ?, farm_alpacas = ?
      WHERE user_id = ?
    `);
    stmt.run(newCoins, newAlpacas, userId);
    return this.getStats(userId);
  }

  static incrementFarmVisits(userId) {
    const stmt = db.prepare(`
      UPDATE user_stats
      SET farm_visits = farm_visits + 1
      WHERE user_id = ?
    `);
    stmt.run(userId);
  }

  static search(query, limit = 20) {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar, bio, status, online, last_seen
      FROM users
      WHERE username LIKE ? OR email LIKE ?
      LIMIT ?
    `);
    return stmt.all(`%${query}%`, `%${query}%`, limit);
  }

  // Password Reset Methods
  static generatePasswordResetToken(userId) {
    // Invalidate any existing tokens
    const invalidateStmt = db.prepare(`
      UPDATE password_reset_tokens
      SET used = 1
      WHERE user_id = ? AND used = 0
    `);
    invalidateStmt.run(userId);

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    const stmt = db.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(userId, token, expiresAt);

    return token;
  }

  static verifyPasswordResetToken(token) {
    const stmt = db.prepare(`
      SELECT prt.*, u.email, u.username
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? 
        AND prt.used = 0 
        AND prt.expires_at > datetime('now')
    `);
    const result = stmt.get(token);
    
    if (result) {
      // Mark token as used
      const updateStmt = db.prepare(`
        UPDATE password_reset_tokens SET used = 1 WHERE id = ?
      `);
      updateStmt.run(result.id);
      return { id: result.user_id, email: result.email, username: result.username };
    }
    return null;
  }

  static updatePassword(userId, hashedPassword) {
    const stmt = db.prepare(`
      UPDATE users
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(hashedPassword, userId);
    return this.findById(userId);
  }
}

export default User;
