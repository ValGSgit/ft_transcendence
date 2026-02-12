#!/bin/bash

# Script to make a user admin in the ft_transcendence database
# Usage: ./scripts/make-admin.sh <email>

set -e

EMAIL="$1"

if [ -z "$EMAIL" ]; then
  echo "❌ Usage: $0 <email>"
  echo "   Example: $0 john@example.com"
  exit 1
fi

DB_PATH="${DATABASE_PATH:-backend/data/transcendence.db}"

if [ ! -f "$DB_PATH" ]; then
  echo "❌ Database not found at: $DB_PATH"
  echo "   Make sure the backend has been started at least once to initialize the database"
  exit 1
fi

echo "🔄 Making user admin: $EMAIL"

# Check if user exists
USER_EXISTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users WHERE email = '$EMAIL';")

if [ "$USER_EXISTS" -eq 0 ]; then
  echo "❌ User not found with email: $EMAIL"
  echo "   Available users:"
  sqlite3 "$DB_PATH" "SELECT email, username FROM users;" | head -10
  exit 1
fi

# Update user to admin
sqlite3 "$DB_PATH" "UPDATE users SET is_admin = 1 WHERE email = '$EMAIL';"

# Verify
IS_ADMIN=$(sqlite3 "$DB_PATH" "SELECT is_admin FROM users WHERE email = '$EMAIL';")

if [ "$IS_ADMIN" -eq 1 ]; then
  echo "✅ User is now an admin!"
  echo ""
  echo "📝 User details:"
  sqlite3 -header -column "$DB_PATH" "SELECT id, username, email, is_admin FROM users WHERE email = '$EMAIL';"
  echo ""
  echo "🎯 Admin can now access: http://localhost:5173/admin/diagram"
else
  echo "❌ Failed to make user admin"
  exit 1
fi
