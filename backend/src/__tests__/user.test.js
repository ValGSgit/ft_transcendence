import { describe, it, expect, beforeAll } from '@jest/globals';
import Database from 'better-sqlite3';
import User from '../models/User.js';
import { hashPassword } from '../utils/auth.js';

describe('User Model', () => {
  let db;
  let originalDb;

  beforeAll(async () => {
    // Create in-memory database for testing
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    
    // Create tables
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT '/avatars/default.png',
        bio TEXT DEFAULT '',
        status TEXT DEFAULT 'Hey there! I am using Transcendence',
        online BOOLEAN DEFAULT 0,
        two_factor_enabled BOOLEAN DEFAULT 0,
        two_factor_secret TEXT,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

    // Replace the actual db import with our test db
    originalDb = await import('../config/database.js');
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const hashedPassword = await hashPassword('Test123!');
      const timestamp = Date.now();
      const user = User.create({
        username: 'testuser_' + timestamp,
        email: 'test_' + timestamp + '@example.com',
        password: hashedPassword
      });

      expect(user).toBeDefined();
      expect(user.username).toContain('testuser_');
      expect(user.email).toContain('@example.com');
      expect(user.id).toBeDefined();
    });

    it('should not create duplicate username', async () => {
      const hashedPassword = await hashPassword('Test123!');
      const timestamp = Date.now();
      const username = 'duplicate_' + timestamp;
      
      User.create({
        username: username,
        email: 'email1_' + timestamp + '@example.com',
        password: hashedPassword
      });
      
      expect(() => {
        User.create({
          username: username,
          email: 'email2_' + timestamp + '@example.com',
          password: hashedPassword
        });
      }).toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by id', () => {
      const user = User.findById(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.password).toBeUndefined(); // Password should not be returned
    });

    it('should return null for non-existent id', () => {
      const user = User.findById(999999999);
      expect(user).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', () => {
      const user = User.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', () => {
      const user = User.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', () => {
      const user = User.findByUsername('testuser');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });
  });

  describe('findByEmailOrUsername', () => {
    it('should find user by email', () => {
      const user = User.findByEmailOrUsername('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should find user by username', () => {
      const user = User.findByEmailOrUsername('testuser');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });
  });

  describe('update', () => {
    it('should update user bio', () => {
      const updatedUser = User.update(1, { bio: 'New bio' });
      expect(updatedUser.bio).toBe('New bio');
    });
  });

  describe('2FA functions', () => {
    it('should enable 2FA', () => {
      const user = User.enable2FA(1, 'test_secret');
      expect(user.two_factor_enabled).toBe(1);
    });

    it('should get 2FA secret', () => {
      const secret = User.get2FASecret(1);
      expect(secret).toBe('test_secret');
    });

    it('should disable 2FA', () => {
      const user = User.disable2FA(1);
      expect(user.two_factor_enabled).toBe(0);
    });
  });

  describe('setOnline', () => {
    it('should set user online status', () => {
      User.setOnline(1, true);
      const user = User.findById(1);
      expect(user.online).toBe(1);
    });
  });
});
