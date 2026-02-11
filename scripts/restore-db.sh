#!/bin/bash

# ============================================================================
# PostgreSQL Database Restore Script for Transcendence
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="transcendence_postgres_prod"

# Database credentials from environment or defaults
DB_NAME="${DB_NAME:-transcendence}"
DB_USER="${DB_USER:-transcendence}"

echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  PostgreSQL Database Restore${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh "$BACKUP_DIR"/transcendence_*.sql.gz 2>/dev/null || echo "No backups found"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 $BACKUP_DIR/transcendence_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: PostgreSQL container is not running!${NC}"
    echo "Start it with: make prod-up"
    exit 1
fi

# Confirm restoration
echo -e "${RED}WARNING: This will replace all data in the database!${NC}"
read -p "Are you sure you want to restore from $BACKUP_FILE? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_TO_RESTORE="$TEMP_FILE"
else
    BACKUP_TO_RESTORE="$BACKUP_FILE"
fi

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_TO_RESTORE"

# Clean up temp file
if [[ "$BACKUP_FILE" == *.gz ]]; then
    rm "$TEMP_FILE"
fi

echo ""
echo -e "${GREEN}✅ Database restored successfully!${NC}"
echo -e "${YELLOW}You may need to restart the backend: make prod-restart${NC}"
echo ""
