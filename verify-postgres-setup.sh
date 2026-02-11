#!/bin/bash

# ============================================================================
# Transcendence PostgreSQL Setup - Verification Script
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         PostgreSQL Setup Verification                         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check 1: PostgreSQL dependency
echo -e "${YELLOW}[1/7] Checking PostgreSQL dependency...${NC}"
if grep -q '"pg"' backend/package.json; then
    echo -e "${GREEN}✅ pg dependency found in package.json${NC}"
else
    echo -e "${RED}❌ pg dependency missing${NC}"
    exit 1
fi

# Check 2: Database configuration files
echo -e "${YELLOW}[2/7] Checking database configuration files...${NC}"
if [ -f "backend/src/config/database.js" ] && [ -f "backend/src/config/database.pg.js" ]; then
    echo -e "${GREEN}✅ Database configuration files exist${NC}"
else
    echo -e "${RED}❌ Database configuration files missing${NC}"
    exit 1
fi

# Check 3: Docker Compose production config
echo -e "${YELLOW}[3/7] Checking Docker Compose production config...${NC}"
if grep -q "postgres:" docker-compose.prod.yml; then
    echo -e "${GREEN}✅ PostgreSQL service found in docker-compose.prod.yml${NC}"
else
    echo -e "${RED}❌ PostgreSQL service missing from docker-compose.prod.yml${NC}"
    exit 1
fi

# Check 4: Environment files
echo -e "${YELLOW}[4/7] Checking environment configuration...${NC}"
if [ -f ".env.production" ] && grep -q "DB_TYPE" .env.production; then
    echo -e "${GREEN}✅ Production environment file configured${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production needs configuration${NC}"
fi

# Check 5: Database scripts
echo -e "${YELLOW}[5/7] Checking database management scripts...${NC}"
if [ -f "scripts/backup-db.sh" ] && [ -f "scripts/restore-db.sh" ] && [ -f "scripts/test-db.sh" ]; then
    echo -e "${GREEN}✅ Database management scripts exist${NC}"
    if [ -x "scripts/backup-db.sh" ]; then
        echo -e "${GREEN}✅ Scripts are executable${NC}"
    else
        echo -e "${YELLOW}⚠️  Scripts need execute permissions (run: chmod +x scripts/*.sh)${NC}"
    fi
else
    echo -e "${RED}❌ Database management scripts missing${NC}"
    exit 1
fi

# Check 6: Documentation
echo -e "${YELLOW}[6/7] Checking documentation...${NC}"
if [ -f "DATABASE_MIGRATION.md" ] && [ -f "DEPLOYMENT.md" ] && [ -f "MIGRATION_SUMMARY.md" ]; then
    echo -e "${GREEN}✅ Documentation files exist${NC}"
else
    echo -e "${YELLOW}⚠️  Some documentation files missing${NC}"
fi

# Check 7: Makefile commands
echo -e "${YELLOW}[7/7] Checking Makefile commands...${NC}"
if grep -q "db-backup-postgres" Makefile && grep -q "db-test" Makefile; then
    echo -e "${GREEN}✅ PostgreSQL make commands added${NC}"
else
    echo -e "${RED}❌ PostgreSQL make commands missing${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Setup Verification Complete!                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}For Development (SQLite):${NC}"
echo "  1. npm install"
echo "  2. npm run dev"
echo ""
echo -e "${YELLOW}For Production (PostgreSQL):${NC}"
echo "  1. Update .env.production with your settings"
echo "  2. make prod-build"
echo "  3. make prod-up"
echo "  4. make db-test"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • DATABASE_MIGRATION.md  - Complete migration guide"
echo "  • DEPLOYMENT.md          - Production deployment guide"  
echo "  • DATABASE_QUICKSTART.md - Quick reference"
echo "  • MIGRATION_SUMMARY.md   - Summary of all changes"
echo ""
echo -e "${BLUE}🛠️  Useful Commands:${NC}"
echo "  • make help              - Show all available commands"
echo "  • make db-backup-postgres - Backup PostgreSQL database"
echo "  • make db-test           - Test database connection"
echo "  • make prod-logs         - View production logs"
echo ""
