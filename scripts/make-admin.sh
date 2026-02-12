#!/bin/bash
# ==========================================================================
# Make User Admin - PostgreSQL Script
# ==========================================================================
# Usage: ./scripts/make-admin.sh <email>
# Or: make admin EMAIL=your@email.com
# ==========================================================================

set -e

EMAIL="$1"

if [ -z "$EMAIL" ]; then
  echo ""
  echo "❌ Error: Email required"
  echo ""
  echo "Usage:"
  echo "  ./scripts/make-admin.sh <email>"
  echo "  make admin EMAIL=your@email.com"
  echo ""
  exit 1
fi

echo ""
echo "🔐 Making user admin: $EMAIL"
echo ""

# Check if user exists
USER_EXISTS=$(docker compose exec -T postgres psql -U transcendence -d transcendence -t -c "SELECT COUNT(*) FROM users WHERE email = '$EMAIL';" | tr -d ' ')

if [ "$USER_EXISTS" -eq 0 ]; then
  echo "❌ User not found with email: $EMAIL"
  echo ""
  echo "Available users:"
  docker compose exec -T postgres psql -U transcendence -d transcendence -c "SELECT id, username, email FROM users LIMIT 10;"
  echo ""
  exit 1
fi

# Update user to admin
docker compose exec -T postgres psql -U transcendence -d transcendence -c "UPDATE users SET is_admin = TRUE WHERE email = '$EMAIL';" > /dev/null

# Verify
echo "✅ User is now an admin!"
echo ""
echo "📝 User details:"
docker compose exec -T postgres psql -U transcendence -d transcendence -c "SELECT id, username, email, is_admin FROM users WHERE email = '$EMAIL';"
echo ""
echo "All admin users:"
docker compose exec -T postgres psql -U transcendence -d transcendence -c "SELECT id, username, email FROM users WHERE is_admin = TRUE;"
echo ""
echo "🎯 Admin can now access: http://localhost:8080/admin/dashboard"
echo ""
  exit 1
fi
