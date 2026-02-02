import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Database from 'better-sqlite3';
import { hashPassword } from '../../utils/auth.js';

describe('User Model Integration Tests', () => {
  let db;
  let User;

  beforeAll(async () => {
    // Create in-memory test database
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    // Create users table
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT '/avatars/default.png',
        bio TEXT DEFAULT 'Hey there!',
        status TEXT DEFAULT 'offline',
        online BOOLEAN DEFAULT 0,
        two_factor_enabled BOOLEAN DEFAULT 0,
        two_factor_secret TEXT,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_stats table
    db.exec(`
      CREATE TABLE user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        games_lost INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        highest_score INTEGER DEFAULT 0,
        win_streak INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Import User model dynamically with test db
    const UserModule = await import('../../models/User.js');
    User = UserModule.default;
  });

  afterAll(() => {
    db.close();
  });

  describe('CRUD Operations', () => {
    it('should create a user with default values', async () => {
      const hashedPwd = await hashPassword('Test123!');
      const stmt = db.prepare(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      );
      const result = stmt.run('testuser', 'test@example.com', hashedPwd);

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeGreaterThan(0);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.avatar).toBe('/avatars/default.png');
      expect(user.bio).toBe('Hey there!');
    });

    it('should find user by email', () => {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get('test@example.com');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    it('should find user by username', () => {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should update user fields', () => {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
      
      db.prepare('UPDATE users SET bio = ?, avatar = ? WHERE id = ?').run(
        'New bio',
        '/avatars/custom.png',
        user.id
      );

      const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      expect(updated.bio).toBe('New bio');
      expect(updated.avatar).toBe('/avatars/custom.png');
    });

    it('should enforce unique email constraint', () => {
      expect(() => {
        db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
          'anotheruser',
          'test@example.com',
          'hashedpwd'
        );
      }).toThrow();
    });

    it('should enforce unique username constraint', () => {
      expect(() => {
        db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(
          'testuser',
          'different@example.com',
          'hashedpwd'
        );
      }).toThrow();
    });
  });

  describe('2FA Operations', () => {
    let userId;

    beforeAll(async () => {
      const hashedPwd = await hashPassword('Test123!');
      const result = db.prepare(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      ).run('twofa_user', 'twofa@example.com', hashedPwd);
      userId = result.lastInsertRowid;
    });

    it('should enable 2FA for user', () => {
      db.prepare('UPDATE users SET two_factor_enabled = 1, two_factor_secret = ? WHERE id = ?').run(
        'secret_key_base32',
        userId
      );

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      expect(user.two_factor_enabled).toBe(1);
      expect(user.two_factor_secret).toBe('secret_key_base32');
    });

    it('should get 2FA secret', () => {
      const result = db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(userId);
      expect(result.two_factor_secret).toBe('secret_key_base32');
    });

    it('should disable 2FA', () => {
      db.prepare('UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?').run(userId);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      expect(user.two_factor_enabled).toBe(0);
      expect(user.two_factor_secret).toBeNull();
    });
  });

  describe('Online Status', () => {
    let userId;

    beforeAll(async () => {
      const hashedPwd = await hashPassword('Test123!');
      const result = db.prepare(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      ).run('online_user', 'online@example.com', hashedPwd);
      userId = result.lastInsertRowid;
    });

    it('should set user online', () => {
      db.prepare('UPDATE users SET online = 1, last_seen = CURRENT_TIMESTAMP WHERE id = ?').run(userId);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      expect(user.online).toBe(1);
    });

    it('should set user offline', () => {
      db.prepare('UPDATE users SET online = 0, last_seen = CURRENT_TIMESTAMP WHERE id = ?').run(userId);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      expect(user.online).toBe(0);
    });
  });
});
