#!/bin/bash

# transcendence Project Verification Script
# This script checks if the project meets all ft_transcendence requirements

echo "=================================="
echo "transcendence Project Verification"
echo "=================================="
echo ""

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAILED++))
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} Directory missing: $1"
        ((FAILED++))
        return 1
    fi
}

echo "1. Checking Project Structure"
echo "------------------------------"
check_dir "backend"
check_dir "frontend"
check_dir "shared"
check_dir "backend/src"
check_dir "frontend/src"
echo ""

echo "2. Checking Required Files"
echo "---------------------------"
check_file "README.md"
check_file "package.json"
check_file "docker-compose.yml"
check_file "Makefile"
check_file ".gitignore"
check_file "backend/package.json"
check_file "frontend/package.json"
check_file "backend/Dockerfile"
echo ""

echo "3. Checking Documentation"
echo "-------------------------"
check_file "README.md"
check_file "MODULE_COMPLIANCE.md"
check_file "QUICKSTART.md"
check_file "CONTRIBUTING.md"
check_file "SECURITY.md"
check_file "MERGE_SUMMARY.md"

# Check README content
if grep -q "This project has been created as part of the 42 curriculum" README.md; then
    echo -e "${GREEN}✓${NC} README has 42 attribution"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README missing 42 attribution"
    ((FAILED++))
fi

if grep -q "Description" README.md && grep -q "Instructions" README.md && grep -q "Resources" README.md; then
    echo -e "${GREEN}✓${NC} README has required sections"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README missing required sections"
    ((FAILED++))
fi

if grep -q "Team Information" README.md; then
    echo -e "${GREEN}✓${NC} README has Team Information section"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README missing Team Information"
    ((FAILED++))
fi

if grep -q "Technical Stack" README.md; then
    echo -e "${GREEN}✓${NC} README has Technical Stack section"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README missing Technical Stack"
    ((FAILED++))
fi

if grep -q "Database Schema" README.md; then
    echo -e "${GREEN}✓${NC} README has Database Schema section"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README missing Database Schema"
    ((FAILED++))
fi

if grep -q "Modules" README.md; then
    echo -e "${GREEN}✓${NC} README has Modules section"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README missing Modules section"
    ((FAILED++))
fi

if grep -q "Individual Contributions" README.md; then
    echo -e "${GREEN}✓${NC} README has Individual Contributions section"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README missing Individual Contributions"
    ((FAILED++))
fi

echo ""

echo "4. Checking Backend Structure"
echo "------------------------------"
check_dir "backend/src/controllers"
check_dir "backend/src/models"
check_dir "backend/src/routes"
check_dir "backend/src/services"
check_dir "backend/src/middleware"
check_file "backend/src/index.js"
check_file "backend/src/controllers/authController.js"
check_file "backend/src/controllers/gameController.js"
check_file "backend/src/models/User.js"
check_file "backend/src/models/Game.js"
check_file "backend/src/services/socketService.js"
check_file "backend/src/services/aiService.js"
echo ""

echo "5. Checking Frontend Structure"
echo "-------------------------------"
check_file "frontend/src/App.vue"
check_file "frontend/src/main.js"
check_file "frontend/vite.config.js"
check_file "frontend/index.html"
echo ""

echo "6. Checking Security Files"
echo "---------------------------"
check_file "backend/.env.example"
check_file "frontend/.env.example"

# Check for credentials in repo (look for actual password values, not function names)
if grep -rE "password\s*=\s*['\"][^'\"]+['\"]" --exclude-dir=node_modules --exclude="*.md" --exclude="*.example" . 2>/dev/null | grep -v "example" > /dev/null; then
    echo -e "${RED}✗${NC} WARNING: Possible credentials in repository!"
    ((FAILED++))
else
    echo -e "${GREEN}✓${NC} No hardcoded credentials found"
    ((PASSED++))
fi
echo ""

echo "7. Checking Module Requirements"
echo "--------------------------------"

# Check if modules are documented
if grep -q "Backend Framework" README.md; then
    echo -e "${GREEN}✓${NC} Backend Framework module documented"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Backend Framework module not documented"
    ((FAILED++))
fi

if grep -q "User Management" README.md || grep -q "Authentication" README.md; then
    echo -e "${GREEN}✓${NC} User Management module documented"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} User Management module not documented"
    ((FAILED++))
fi

if grep -q "Remote Players" README.md || grep -q "Socket.io" README.md; then
    echo -e "${GREEN}✓${NC} Remote Players module documented"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Remote Players module not documented"
    ((FAILED++))
fi

if grep -q "AI Opponent" README.md; then
    echo -e "${GREEN}✓${NC} AI Opponent module documented"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} AI Opponent module not documented"
    ((FAILED++))
fi

# Check for minimum points
if grep -q "15 points" README.md || grep -q "Total Points: 15" README.md; then
    echo -e "${GREEN}✓${NC} Points calculation shows 15 points (exceeds minimum)"
    ((PASSED++))
else
    echo -e "${YELLOW}!${NC} Points calculation should be verified"
fi

echo ""

echo "8. Checking Git Configuration"
echo "------------------------------"
if [ -f ".gitignore" ]; then
    if grep -q "node_modules" .gitignore && grep -q ".env" .gitignore; then
        echo -e "${GREEN}✓${NC} .gitignore properly configured"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} .gitignore incomplete"
        ((FAILED++))
    fi
fi
echo ""

echo "9. Checking Docker Configuration"
echo "---------------------------------"
if grep -q "backend:" docker-compose.yml && grep -q "frontend:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} docker-compose.yml has both services"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} docker-compose.yml incomplete"
    ((FAILED++))
fi

if grep -q "3000" docker-compose.yml && grep -q "5173" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} Correct ports configured"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Ports not properly configured"
    ((FAILED++))
fi
echo ""

echo "10. Final Summary"
echo "-----------------"
echo -e "Checks passed: ${GREEN}$PASSED${NC}"
echo -e "Checks failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}=================================="
    echo -e "✓ ALL CHECKS PASSED!"
    echo -e "Project is ready for submission"
    echo -e "==================================${NC}"
    exit 0
else
    echo -e "${YELLOW}=================================="
    echo -e "! Some checks failed"
    echo -e "Please review the issues above"
    echo -e "==================================${NC}"
    exit 1
fi
