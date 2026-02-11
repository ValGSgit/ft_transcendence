import pkg from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';
const { Pool } = pkg;

// Async local storage for transaction context
const transactionStorage = new AsyncLocalStorage();

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'transcendence',
  user: process.env.DB_USER || 'transcendence',
  password: process.env.DB_PASSWORD || 'transcendence_password',
  max: 20, // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

// Get the current query target (transaction client or pool)
const getQueryTarget = () => {
  const store = transactionStorage.getStore();
  return store?.client || pool;
};

// Translate SQLite SQL to PostgreSQL SQL
function translateSQL(sql) {
  let translated = sql;
  let hasInsertOrIgnore = false;

  // Convert INSERT OR IGNORE → INSERT INTO ... ON CONFLICT DO NOTHING
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(translated)) {
    hasInsertOrIgnore = true;
    translated = translated.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
  }

  // Convert ? placeholders to $1, $2, $3, ...
  let paramIndex = 0;
  translated = translated.replace(/\?/g, () => `$${++paramIndex}`);

  // Convert datetime('now') → NOW()
  translated = translated.replace(/datetime\s*\(\s*'now'\s*\)/gi, 'NOW()');

  // Convert LIKE to ILIKE for case-insensitive search (matching SQLite behavior)
  translated = translated.replace(/\bLIKE\b/gi, 'ILIKE');

  // Convert BOOLEAN 1/0 in SET clauses to TRUE/FALSE
  // This handles patterns like: SET online = $1 where param is 1 or 0
  // PostgreSQL accepts 0/1 for boolean columns, so this is optional

  // Add ON CONFLICT DO NOTHING for INSERT OR IGNORE
  if (hasInsertOrIgnore) {
    translated = translated.trimEnd().replace(/;?\s*$/, '') + ' ON CONFLICT DO NOTHING';
  }

  // Add RETURNING * to INSERT statements (for lastInsertRowid)
  if (/^\s*INSERT\s+/i.test(translated) && !/RETURNING/i.test(translated)) {
    translated = translated.trimEnd().replace(/;?\s*$/, '') + ' RETURNING *';
  }

  return translated;
}

// Initialize database schema
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table with 2FA support
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar TEXT DEFAULT '/avatars/default.png',
        bio TEXT DEFAULT '',
        status TEXT DEFAULT 'Hey there! I am using Transcendence',
        online BOOLEAN DEFAULT FALSE,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret TEXT,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Friend requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(sender_id, receiver_id)
      )
    `);

    // Friends table (for accepted friendships)
    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user1_id, user2_id)
      )
    `);

    // Blocked users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id SERIAL PRIMARY KEY,
        blocker_id INTEGER NOT NULL,
        blocked_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(blocker_id, blocked_id)
      )
    `);

    // Chat rooms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'channel' CHECK(type IN ('direct', 'channel')),
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Chat room members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_room_members (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(room_id, user_id)
      )
    `);

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create index on messages for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
    `);

    // Games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        player1_id INTEGER NOT NULL,
        player2_id INTEGER,
        player1_score INTEGER DEFAULT 0,
        player2_score INTEGER DEFAULT 0,
        winner_id INTEGER,
        is_ai_game BOOLEAN DEFAULT FALSE,
        ai_difficulty VARCHAR(20) CHECK(ai_difficulty IN ('easy', 'medium', 'hard')),
        status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'abandoned')),
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Game statistics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
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
        farm_blob JSONB DEFAULT '{}'::jsonb,
        farm_visits INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL CHECK(type IN ('friend_request', 'game_invite', 'message', 'system')),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Password reset tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Matchmaking queue table
    await client.query(`
      CREATE TABLE IF NOT EXISTS matchmaking_queue (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        skill_rating INTEGER DEFAULT 1000,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Posts table for social feed
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text' CHECK(type IN ('text', 'farm', 'achievement', 'game')),
        visibility VARCHAR(20) DEFAULT 'public' CHECK(visibility IN ('public', 'friends', 'private')),
        image TEXT,
        farm_data JSONB,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Post likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Post comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing PostgreSQL database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database adapter interface (compatible with SQLite methods)
const db = {
  // Execute a query (SELECT)
  query: (sql, params = []) => {
    const target = getQueryTarget();
    return target.query(translateSQL(sql), params);
  },

  // Execute and return all results
  all: async (sql, params = []) => {
    const target = getQueryTarget();
    const result = await target.query(translateSQL(sql), params);
    return result.rows;
  },

  // Execute and return first result
  get: async (sql, params = []) => {
    const target = getQueryTarget();
    const result = await target.query(translateSQL(sql), params);
    return result.rows[0];
  },

  // Execute without returning results (INSERT, UPDATE, DELETE)
  run: async (sql, params = []) => {
    const target = getQueryTarget();
    const translated = translateSQL(sql);
    const result = await target.query(translated, params);
    return {
      changes: result.rowCount,
      lastInsertRowid: result.rows[0]?.id || null,
    };
  },

  // Prepare statement (compatible with SQLite's db.prepare().get/all/run pattern)
  prepare: (sql) => {
    const translated = translateSQL(sql);
    return {
      get: async (...params) => {
        const target = getQueryTarget();
        const result = await target.query(translated, params);
        return result.rows[0];
      },
      all: async (...params) => {
        const target = getQueryTarget();
        const result = await target.query(translated, params);
        return result.rows;
      },
      run: async (...params) => {
        const target = getQueryTarget();
        const result = await target.query(translated, params);
        return {
          changes: result.rowCount,
          lastInsertRowid: result.rows[0]?.id || null,
        };
      },
    };
  },

  // Execute raw SQL (for CREATE TABLE, etc.)
  exec: async (sql) => {
    const target = getQueryTarget();
    await target.query(sql);
  },

  // Transaction support using AsyncLocalStorage for proper client scoping
  transaction: (callback) => {
    // Returns a function (matching SQLite's db.transaction() API)
    // When called, executes the callback within a transaction
    return async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await transactionStorage.run({ client }, async () => {
          return await callback();
        });
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    };
  },

  // Unified async transaction method (works identically on both SQLite and PG)
  runTransaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await transactionStorage.run({ client }, async () => {
        return await callback();
      });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Close pool
  close: async () => {
    await pool.end();
  },

  // Get pool for direct access
  pool,
};

export { initDatabase, pool };
export default db;
