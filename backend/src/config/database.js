// Database configuration - chooses between SQLite (dev) and PostgreSQL (prod)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USE_POSTGRES = process.env.DB_TYPE === 'postgres' || process.env.NODE_ENV === 'production';

let db;
let initDatabase;

if (USE_POSTGRES) {
  // Use PostgreSQL for production
  const pgModule = await import('./database.pg.js');
  db = pgModule.default;
  initDatabase = pgModule.initDatabase;
  console.log('🐘 Using PostgreSQL database');
} else {
  // Use SQLite for development
  const Database = (await import('better-sqlite3')).default;
  
  // Determine database path
  const dataDir = process.env.DATABASE_PATH 
    ? dirname(process.env.DATABASE_PATH)
    : join(__dirname, '../../data');

  // Create data directory if it doesn't exist
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DATABASE_PATH || join(dataDir, 'transcendence.db');

  // Use file-based database for persistence
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  console.log('💾 Using SQLite database:', dbPath);

  // SQLite initialization function
  initDatabase = () => {
    // Users table with 2FA support
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT '/avatars/default.png',
        bio TEXT DEFAULT '',
        status TEXT DEFAULT 'Hey there! I am using Transcendence',
        online BOOLEAN DEFAULT 0,
        is_admin BOOLEAN DEFAULT 0,
        two_factor_enabled BOOLEAN DEFAULT 0,
        two_factor_secret TEXT,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

  // Friend requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(sender_id, receiver_id)
    )
  `);

  // Friends table (for accepted friendships)
  db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user1_id, user2_id)
    )
  `);

  // Blocked users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocked_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blocker_id INTEGER NOT NULL,
      blocked_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(blocker_id, blocked_id)
    )
  `);

  // Chat rooms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'channel' CHECK(type IN ('direct', 'channel')),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Chat room members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_room_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(room_id, user_id)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Games table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER,
      player1_score INTEGER DEFAULT 0,
      player2_score INTEGER DEFAULT 0,
      winner_id INTEGER,
      is_ai_game BOOLEAN DEFAULT 0,
      ai_difficulty TEXT CHECK(ai_difficulty IN ('easy', 'medium', 'hard')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'abandoned')),
      started_at DATETIME,
      ended_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Game statistics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      games_played INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0,
      games_lost INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      highest_score INTEGER DEFAULT 0,
      win_streak INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      farm_coins INTEGER DEFAULT 0,
      farm_alpacas INTEGER DEFAULT 1,
      farm_blob TEXT NOT NULL DEFAULT '{}',
      farm_visits INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

const columns = [
  'ALTER TABLE user_stats ADD COLUMN farm_coins INTEGER DEFAULT 0',
  'ALTER TABLE user_stats ADD COLUMN farm_alpacas INTEGER DEFAULT 1',
  'ALTER TABLE user_stats ADD COLUMN farm_blob TEXT NOT NULL DEFAULT "{}"',
  'ALTER TABLE user_stats ADD COLUMN farm_visits INTEGER DEFAULT 0'
];

columns.forEach(query => {
  try {
    db.exec(query);
  } catch (e) {
    // Ignore "duplicate column name" errors specifically
  }
});

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('friend_request', 'game_invite', 'message', 'system')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Password reset tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Matchmaking queue table
  db.exec(`
    CREATE TABLE IF NOT EXISTS matchmaking_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      skill_rating INTEGER DEFAULT 1000,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Posts table for social feed
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'text' CHECK(type IN ('text', 'farm', 'achievement', 'game')),
      visibility TEXT DEFAULT 'public' CHECK(visibility IN ('public', 'friends', 'private')),
      image TEXT,
      farm_data TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Post likes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Post comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_games_status ON games(status)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id)`);
  } catch (e) {
    // Indexes may already exist
  }

    console.log('✅ SQLite database initialized successfully');
  };
}

// Initialize database
const initResult = initDatabase();
if (initResult && typeof initResult.then === 'function') {
  // PostgreSQL returns a promise
  await initResult;
}

// Add unified runTransaction method for SQLite
if (!USE_POSTGRES && db && !db.runTransaction) {
  db.runTransaction = async (callback) => {
    // For SQLite, use manual BEGIN/COMMIT so we can await async callbacks
    // This allows the same async model code to work with both SQLite and PG
    db.exec('BEGIN');
    try {
      const result = await callback();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };
}

export { initDatabase };
export default db;
