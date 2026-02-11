#!/bin/bash

# ============================================================================
# PostgreSQL Connection Test Script for Transcendence
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

CONTAINER_NAME="transcendence_postgres_prod"
DB_NAME="${DB_NAME:-transcendence}"
DB_USER="${DB_USER:-transcendence}"

echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  PostgreSQL Connection Test${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ PostgreSQL container is not running!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL container is running${NC}"

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

# Show database info
echo ""
echo -e "${YELLOW}Database Information:${NC}"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version;
"

# Show tables
echo ""
echo -e "${YELLOW}Tables in database:${NC}"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
"

# Show database size
echo ""
echo -e "${YELLOW}Database size:${NC}"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;
"

echo ""
echo -e "${GREEN}All checks passed!${NC}"
