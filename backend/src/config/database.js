// ==========================================================================
// Database Configuration — PostgreSQL
// ==========================================================================
// All environments use PostgreSQL. The adapter in database.pg.js exposes
// a SQLite-compatible interface (prepare, run, get, all) so every model
// works without changes.
// ==========================================================================

import db, { initDatabase, pool } from './database.pg.js';

console.log('🐘 Using PostgreSQL database');

// Initialize database schema
const initResult = initDatabase();
if (initResult && typeof initResult.then === 'function') {
  await initResult;
}

export { initDatabase, pool };
export default db;
