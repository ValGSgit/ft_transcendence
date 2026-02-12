import db from '../config/database.js';
import crypto from 'crypto';

export class User {
  static async create({ username, email, password, avatar, bio }) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, avatar, bio)
      VALUES (?, ?, ?, ?, ?)
    `);
    const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>';
    const result = await stmt.run(
      username, 
      email, 
      password,
      avatar || defaultAvatar,
      bio || 'Hey there! I am using Transcendence'
    );
    
    // Create user stats
    const statsStmt = db.prepare(`
      INSERT INTO user_stats (user_id) VALUES (?)
    `);
    await statsStmt.run(result.lastInsertRowid);
    
    return await this.findById(result.lastInsertRowid);
  }

  static async findById(id) {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar, cover_photo as "coverPhoto", bio, status, online, is_admin, two_factor_enabled, last_seen, created_at, updated_at
      FROM users WHERE id = ?
    `);
    return await stmt.get(id);
  }

  static async findByIdWithPassword(id) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);
    return await stmt.get(id);
  }

  static async findByEmail(email) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `);
    return await stmt.get(email);
  }

  static async findByUsername(username) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE username = ?
    `);
    return await stmt.get(username);
  }

  static async findByEmailOrUsername(identifier) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE email = ? OR username = ?
    `);
    return await stmt.get(identifier, identifier);
  }

  static async findAll(limit = 100, offset = 0) {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar, cover_photo as "coverPhoto", bio, status, online, last_seen, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    return await stmt.all(limit, offset);
  }

  static async update(id, data) {
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

    if (fields.length === 0) return await this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);
    await stmt.run(...values);
    return await this.findById(id);
  }

  static async setOnline(id, online) {
    const stmt = db.prepare(`
      UPDATE users
      SET online = ?, last_seen = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    await stmt.run(online ? true : false, id);
  }

  static async enable2FA(id, secret) {
    const stmt = db.prepare(`
      UPDATE users
      SET two_factor_enabled = TRUE, two_factor_secret = ?
      WHERE id = ?
    `);
    await stmt.run(secret, id);
    return await this.findById(id);
  }

  static async disable2FA(id) {
    const stmt = db.prepare(`
      UPDATE users
      SET two_factor_enabled = FALSE, two_factor_secret = NULL
      WHERE id = ?
    `);
    await stmt.run(id);
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

  static async getStats(userId) {
    const stmt = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `);
    return await stmt.get(userId);
  }

  static async updateFarmStats(userId, { coins, alpacas, blob }) {
    const stats = await this.getStats(userId);
    if (!stats) return null;

    const newCoins = coins !== undefined ? coins : stats.farm_coins;
    const newAlpacas = alpacas !== undefined ? alpacas : stats.farm_alpacas;
    //const newBlob = blob !== undefined ? blob : stats.farm_blob;

    const stmt = db.prepare(`
      UPDATE user_stats
      SET farm_coins = ?, farm_alpacas = ?, farm_blob = ?
      WHERE user_id = ?
    `);
    await stmt.run(newCoins, newAlpacas, blob, userId);
    return await this.getStats(userId);
  }

  static async incrementFarmVisits(userId) {
    const stmt = db.prepare(`
      UPDATE user_stats
      SET farm_visits = farm_visits + 1
      WHERE user_id = ?
    `);
    await stmt.run(userId);
  }

  static async search(query, limit = 20) {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar, cover_photo as "coverPhoto", bio, status, online, last_seen
      FROM users
      WHERE username LIKE ? OR email LIKE ?
      LIMIT ?
    `);
    return await stmt.all(`%${query}%`, `%${query}%`, limit);
  }

  // Password Reset Methods
  static async generatePasswordResetToken(userId) {
    // Invalidate any existing tokens
    const invalidateStmt = db.prepare(`
      UPDATE password_reset_tokens
      SET used = TRUE
      WHERE user_id = ? AND used = FALSE
    `);
    await invalidateStmt.run(userId);

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    const stmt = db.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `);
    await stmt.run(userId, token, expiresAt);

    return token;
  }

  static async verifyPasswordResetToken(token) {
    const stmt = db.prepare(`
      SELECT prt.*, u.email, u.username
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? 
        AND prt.used = 0 
        AND prt.expires_at > datetime('now')
    `);
    const result = await stmt.get(token);
    
    if (result) {
      // Mark token as used
      const updateStmt = db.prepare(`
        UPDATE password_reset_tokens SET used = 1 WHERE id = ?
      `);
      await updateStmt.run(result.id);
      return { id: result.user_id, email: result.email, username: result.username };
    }
    return null;
  }

  static async updatePassword(userId, hashedPassword) {
    const stmt = db.prepare(`
      UPDATE users
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    await stmt.run(hashedPassword, userId);
    return await this.findById(userId);
  }
}

export default User;
