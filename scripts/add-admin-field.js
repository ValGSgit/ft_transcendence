#!/usr/bin/env node

/**
 * Database Migration: Add is_admin field to users table
 * 
 * This migration adds an is_admin boolean column to the users table
 * to support admin-only features like the system diagram view.
 * 
 * Usage:
 *   node scripts/add-admin-field.js
 * 
 * To make a user admin:
 *   UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com';
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../backend/data/transcendence.db');

if (!existsSync(dbPath)) {
  console.error('❌ Database not found at:', dbPath);
  console.error('   Make sure to run the backend first to initialize the database');
  process.exit(1);
}

const db = new Database(dbPath);

try {
  console.log('🔄 Starting migration: Add is_admin field to users table');
  
  // Check if column already exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasAdminField = tableInfo.some(col => col.name === 'is_admin');
  
  if (hasAdminField) {
    console.log('ℹ️  Column is_admin already exists, skipping migration');
  } else {
    // Add is_admin column
    db.exec(`
      ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;
    `);
    console.log('✅ Added is_admin column to users table');
  }
  
  // Show current admin users
  const admins = db.prepare("SELECT id, username, email, is_admin FROM users WHERE is_admin = 1").all();
  
  if (admins.length === 0) {
    console.log('\n⚠️  No admin users found.');
    console.log('   To make a user admin, run:');
    console.log('   UPDATE users SET is_admin = 1 WHERE email = \'your-email@example.com\';');
  } else {
    console.log('\n✅ Current admin users:');
    admins.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.email})`);
    });
  }
  
  console.log('\n✨ Migration completed successfully');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
