#!/bin/bash

# ============================================================================
# PostgreSQL Database Backup Script for Transcendence
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="transcendence_postgres_prod"

# Database credentials from environment or defaults
DB_NAME="${DB_NAME:-transcendence}"
DB_USER="${DB_USER:-transcendence}"

echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  PostgreSQL Database Backup${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: PostgreSQL container is not running!${NC}"
    echo "Start it with: make prod-up"
    exit 1
fi

# Perform backup
BACKUP_FILE="$BACKUP_DIR/transcendence_${TIMESTAMP}.sql"
echo -e "${YELLOW}Creating backup...${NC}"

docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "$BACKUP_FILE"

echo ""
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "Backup file: ${BACKUP_FILE}.gz"
echo -e "Size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"
echo ""

# Clean up old backups (keep last 10)
echo -e "${YELLOW}Cleaning up old backups (keeping last 10)...${NC}"
ls -t "$BACKUP_DIR"/transcendence_*.sql.gz | tail -n +11 | xargs -r rm

echo -e "${GREEN}Done!${NC}"
