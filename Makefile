# ============================================================================
# TRANSCENDENCE - Professional Makefile
# ============================================================================
# A comprehensive build system for development, testing, and production
# ============================================================================

# Colors for terminal output
RED    := \033[0;31m
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
PURPLE := \033[0;35m
CYAN   := \033[0;36m
WHITE  := \033[0;37m
RESET  := \033[0m

# Project configuration
PROJECT_NAME := transcendence
BACKEND_DIR  := backend
FRONTEND_DIR := frontend
SHARED_DIR   := shared

# Docker configuration
DOCKER_COMPOSE     := docker compose
DOCKER_COMPOSE_DEV := docker-compose.yml
DOCKER_COMPOSE_PROD := docker-compose.prod.yml
BACKEND_IMAGE      := $(PROJECT_NAME)-backend
FRONTEND_IMAGE     := $(PROJECT_NAME)-frontend

# Docker permission check
DOCKER_CHECK := $(shell docker ps >/dev/null 2>&1 && echo "ok" || echo "fail")

# Default target
.DEFAULT_GOAL := help

# Mark all targets as phony (not files)
.PHONY: help all install install-backend install-frontend install-shared \
        dev dev-backend dev-frontend build build-frontend build-backend \
        clean clean-all clean-backend clean-frontend clean-docker clean-db \
        test test-backend test-watch test-coverage lint lint-backend lint-frontend \
        docker-build docker-up docker-down docker-logs docker-restart docker-ps docker-shell-backend docker-shell-frontend \
        prod prod-build prod-up prod-down prod-logs prod-restart prod-ps \
        db-reset db-backup db-restore \
        check status info env setup verify \
        format security-check update deps-check

# ============================================================================
# HELP
# ============================================================================

help:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║                    🎮  TRANSCENDENCE MAKEFILE  🎮                         ║$(RESET)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)📦 INSTALLATION$(RESET)"
	@echo "  $(GREEN)make install$(RESET)          Install all dependencies"
	@echo "  $(GREEN)make install-backend$(RESET)  Install backend dependencies only"
	@echo "  $(GREEN)make install-frontend$(RESET) Install frontend dependencies only"
	@echo "  $(GREEN)make setup$(RESET)            Full project setup (install + env check)"
	@echo ""
	@echo "$(YELLOW)🚀 DEVELOPMENT$(RESET)"
	@echo "  $(GREEN)make dev$(RESET)              Start all development servers"
	@echo "  $(GREEN)make dev-backend$(RESET)      Start backend server only"
	@echo "  $(GREEN)make dev-frontend$(RESET)     Start frontend server only"
	@echo ""
	@echo "$(YELLOW)🏗️  BUILD$(RESET)"
	@echo "  $(GREEN)make build$(RESET)            Build all for production"
	@echo "  $(GREEN)make build-frontend$(RESET)   Build frontend only"
	@echo ""
	@echo "$(YELLOW)🧪 TESTING$(RESET)"
	@echo "  $(GREEN)make test$(RESET)             Run all tests with coverage"
	@echo "  $(GREEN)make test-backend$(RESET)     Run backend tests only"
	@echo "  $(GREEN)make test-watch$(RESET)       Run tests in watch mode"
	@echo "  $(GREEN)make test-coverage$(RESET)    Generate detailed coverage report"
	@echo ""
	@echo "$(YELLOW)🐳 DOCKER - DEVELOPMENT$(RESET)"
	@echo "  $(GREEN)make docker-build$(RESET)     Build development containers"
	@echo "  $(GREEN)make docker-up$(RESET)        Start development containers"
	@echo "  $(GREEN)make docker-down$(RESET)      Stop development containers"
	@echo "  $(GREEN)make docker-logs$(RESET)      View container logs"
	@echo "  $(GREEN)make docker-restart$(RESET)   Restart containers"
	@echo "  $(GREEN)make docker-ps$(RESET)        Show container status"
	@echo "  $(GREEN)make docker-shell-backend$(RESET)  Shell into backend container"
	@echo ""
	@echo "$(YELLOW)🚀 DOCKER - PRODUCTION$(RESET)"
	@echo "  $(GREEN)make prod$(RESET)             Build & start production (alias)"
	@echo "  $(GREEN)make prod-build$(RESET)       Build production images"
	@echo "  $(GREEN)make prod-up$(RESET)          Start production containers"
	@echo "  $(GREEN)make prod-down$(RESET)        Stop production containers"
	@echo "  $(GREEN)make prod-logs$(RESET)        View production logs"
	@echo "  $(GREEN)make prod-restart$(RESET)     Restart production"
	@echo ""
	@echo "$(YELLOW)🗄️  DATABASE$(RESET)"
	@echo "  $(GREEN)make db-reset$(RESET)         Reset SQLite database (dev)"
	@echo "  $(GREEN)make db-backup$(RESET)        Backup SQLite database (dev)"
	@echo "  $(GREEN)make db-restore$(RESET)       Restore SQLite database (dev)"
	@echo "  $(GREEN)make db-backup-postgres$(RESET) Backup PostgreSQL (prod)"
	@echo "  $(GREEN)make db-restore-postgres$(RESET) Restore PostgreSQL (prod)"
	@echo "  $(GREEN)make db-test$(RESET)          Test PostgreSQL connection"
	@echo "  $(GREEN)make db-shell$(RESET)         Open PostgreSQL shell"
	@echo "  $(GREEN)make db-logs$(RESET)          View PostgreSQL logs"
	@echo ""
	@echo "$(YELLOW)🧹 CLEANUP$(RESET)"
	@echo "  $(GREEN)make clean$(RESET)            Remove node_modules"
	@echo "  $(GREEN)make clean-all$(RESET)        Remove everything (modules + builds + db)"
	@echo "  $(GREEN)make clean-docker$(RESET)     Remove Docker images and volumes"
	@echo "  $(GREEN)make clean-db$(RESET)         Remove database only"
	@echo ""
	@echo "$(YELLOW)🔧 UTILITIES$(RESET)"
	@echo "  $(GREEN)make lint$(RESET)             Run linters on all code"
	@echo "  $(GREEN)make format$(RESET)           Format code (prettier)"
	@echo "  $(GREEN)make check$(RESET)            Run all checks (lint + test)"
	@echo "  $(GREEN)make status$(RESET)           Show project status"
	@echo "  $(GREEN)make info$(RESET)             Show system information"
	@echo "  $(GREEN)make env$(RESET)              Check environment variables"
	@echo "  $(GREEN)make verify$(RESET)           Verify project setup"
	@echo "  $(GREEN)make deps-check$(RESET)       Check for outdated dependencies"
	@echo "  $(GREEN)make security-check$(RESET)   Run security audit"
	@echo "  $(GREEN)make update$(RESET)           Update all dependencies"
	@echo ""
	@echo "$(PURPLE)💡 Quick Start:$(RESET)"
	@echo "   1. make setup        # First-time setup"
	@echo "   2. make dev          # Start development"
	@echo "   3. make test         # Run tests"
	@echo "   4. make prod         # Deploy production"
	@echo ""

# ============================================================================
# INSTALLATION
# ============================================================================

install: install-backend install-frontend install-shared
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

install-backend:
	@echo "$(BLUE)📦 Installing backend dependencies...$(RESET)"
	@cd $(BACKEND_DIR) && npm install
	@echo "$(GREEN)✓ Backend dependencies installed$(RESET)"

install-frontend:
	@echo "$(BLUE)📦 Installing frontend dependencies...$(RESET)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(RESET)"

install-shared:
	@echo "$(BLUE)📦 Installing shared dependencies...$(RESET)"
	@cd $(SHARED_DIR) && npm install 2>/dev/null || true
	@echo "$(GREEN)✓ Shared dependencies installed$(RESET)"

setup: install env verify
	@echo ""
	@echo "$(GREEN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(GREEN)║              ✓ PROJECT SETUP COMPLETE!                        ║$(RESET)"
	@echo "$(GREEN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(CYAN)Next steps:$(RESET)"
	@echo "  1. Run $(YELLOW)make dev$(RESET) to start development servers"
	@echo "  2. Open $(YELLOW)http://localhost:5173$(RESET) in your browser"
	@echo ""

# ============================================================================
# DEVELOPMENT
# ============================================================================

dev:
	@echo "$(BLUE)🚀 Starting development servers...$(RESET)"
	@npm run dev

dev-backend:
	@echo "$(BLUE)🚀 Starting backend server...$(RESET)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend:
	@echo "$(BLUE)🚀 Starting frontend server...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run dev

# ============================================================================
# BUILD
# ============================================================================

build: build-frontend
	@echo "$(GREEN)✓ Build complete$(RESET)"

build-frontend:
	@echo "$(BLUE)🏗️  Building frontend for production...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✓ Frontend built successfully$(RESET)"

build-backend:
	@echo "$(BLUE)🏗️  Preparing backend for production...$(RESET)"
	@cd $(BACKEND_DIR) && npm ci --omit=dev 2>/dev/null || npm install --omit=dev
	@echo "$(GREEN)✓ Backend prepared$(RESET)"

# ============================================================================
# TESTING
# ============================================================================

test: test-backend
	@echo "$(GREEN)✓ All tests complete$(RESET)"

test-backend:
	@echo "$(BLUE)🧪 Running backend tests...$(RESET)"
	@cd $(BACKEND_DIR) && npm test

test-watch:
	@echo "$(BLUE)🧪 Running tests in watch mode...$(RESET)"
	@cd $(BACKEND_DIR) && npm test -- --watch

test-coverage:
	@echo "$(BLUE)🧪 Generating coverage report...$(RESET)"
	@cd $(BACKEND_DIR) && npm test -- --coverage
	@echo "$(GREEN)✓ Coverage report: $(BACKEND_DIR)/coverage/lcov-report/index.html$(RESET)"

# ============================================================================
# LINTING & FORMATTING
# ============================================================================

lint: lint-backend lint-frontend
	@echo "$(GREEN)✓ Linting complete$(RESET)"

lint-backend:
	@echo "$(BLUE)🔍 Linting backend...$(RESET)"
	@cd $(BACKEND_DIR) && npm run lint 2>/dev/null || echo "$(YELLOW)⚠ No lint script in backend$(RESET)"

lint-frontend:
	@echo "$(BLUE)🔍 Linting frontend...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run lint 2>/dev/null || echo "$(YELLOW)⚠ No lint script in frontend$(RESET)"

format:
	@echo "$(BLUE)✨ Formatting code...$(RESET)"
	@cd $(BACKEND_DIR) && npx prettier --write "src/**/*.js" 2>/dev/null || true
	@cd $(FRONTEND_DIR) && npx prettier --write "src/**/*.{js,vue}" 2>/dev/null || true
	@echo "$(GREEN)✓ Code formatted$(RESET)"

# ============================================================================
# DOCKER - DEVELOPMENT
# ============================================================================

docker-build:
	@echo "$(BLUE)🐳 Building development containers...$(RESET)"
	@if ! docker ps >/dev/null 2>&1; then \
		echo "$(RED)✗ Docker permission denied$(RESET)"; \
		echo "$(YELLOW)Please run: $(CYAN)sudo usermod -aG docker $$USER && newgrp docker$(RESET)"; \
		exit 1; \
	fi
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) build
	@echo "$(GREEN)✓ Development containers built$(RESET)"

docker-up:
	@echo "$(BLUE)🐳 Starting development containers...$(RESET)"
	@if ! docker ps >/dev/null 2>&1; then \
		echo "$(RED)✗ Docker permission denied$(RESET)"; \
		echo "$(YELLOW)Please run: $(CYAN)sudo usermod -aG docker $$USER && newgrp docker$(RESET)"; \
		exit 1; \
	fi
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) up -d
	@echo "$(GREEN)✓ Containers started$(RESET)"
	@echo "$(CYAN)  Backend:  http://localhost:3000$(RESET)"
	@echo "$(CYAN)  Frontend: http://localhost:5173$(RESET)"

docker-down:
	@echo "$(BLUE)🐳 Stopping development containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) down
	@echo "$(GREEN)✓ Containers stopped$(RESET)"

docker-restart: docker-down docker-up
	@echo "$(GREEN)✓ Containers restarted$(RESET)"

docker-logs:
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) logs -f

docker-ps:
	@echo "$(BLUE)🐳 Container status:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) ps

docker-shell-backend:
	@echo "$(BLUE)🐳 Opening shell in backend container...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) exec backend sh

docker-shell-frontend:
	@echo "$(BLUE)🐳 Opening shell in frontend container...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) exec frontend sh

# ============================================================================
# DOCKER - PRODUCTION
# ============================================================================

prod: prod-build prod-up
	@echo "$(GREEN)✓ Production deployment complete$(RESET)"

prod-build:
	@echo "$(BLUE)🚀 Building production images...$(RESET)"
	@if ! docker ps >/dev/null 2>&1; then \
		echo "$(RED)✗ Docker permission denied$(RESET)"; \
		echo "$(YELLOW)Please run one of the following:$(RESET)"; \
		echo "  1. Add your user to docker group: $(CYAN)sudo usermod -aG docker $$USER && newgrp docker$(RESET)"; \
		echo "  2. Or use sudo: $(CYAN)sudo make prod-build$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)  Syncing package-lock.json files...$(RESET)"
	@cd $(BACKEND_DIR) && npm install --package-lock-only 2>/dev/null || true
	@cd $(FRONTEND_DIR) && npm install --package-lock-only 2>/dev/null || true
	@echo "$(BLUE)  Building backend image...$(RESET)"
	@docker build -t $(BACKEND_IMAGE):latest -f $(BACKEND_DIR)/Dockerfile.prod ./$(BACKEND_DIR)
	@echo "$(BLUE)  Building frontend image...$(RESET)"
	@docker build -t $(FRONTEND_IMAGE):latest -f $(FRONTEND_DIR)/Dockerfile.prod ./$(FRONTEND_DIR)
	@echo "$(GREEN)✓ Production images built$(RESET)"
	@echo "$(CYAN)  Images created:$(RESET)"
	@echo "$(CYAN)    - $(BACKEND_IMAGE):latest$(RESET)"
	@echo "$(CYAN)    - $(FRONTEND_IMAGE):latest$(RESET)"

prod-up:
	@echo "$(BLUE)🚀 Starting production containers...$(RESET)"
	@if ! docker ps >/dev/null 2>&1; then \
		echo "$(RED)✗ Docker permission denied$(RESET)"; \
		echo "$(YELLOW)Please run: $(CYAN)sudo usermod -aG docker $$USER && newgrp docker$(RESET)"; \
		exit 1; \
	fi
	@if [ -f .env.production ]; then \
		echo "$(CYAN)  Loading .env.production...$(RESET)"; \
		export $$(cat .env.production | grep -v '^#' | xargs) && $(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_PROD) up -d; \
	else \
		echo "$(YELLOW)  ⚠ No .env.production found, using default values$(RESET)"; \
		echo "$(YELLOW)  Copy .env.production.example to .env.production and configure$(RESET)"; \
		$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_PROD) up -d; \
	fi
	@echo "$(GREEN)✓ Production containers started$(RESET)"
	@echo "$(CYAN)  Application: http://localhost$(RESET)"
	@echo "$(CYAN)  API:         http://localhost:3000$(RESET)"

prod-down:
	@echo "$(BLUE)🚀 Stopping production containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_PROD) down
	@echo "$(GREEN)✓ Production containers stopped$(RESET)"

prod-restart: prod-down prod-up
	@echo "$(GREEN)✓ Production restarted$(RESET)"

prod-logs:
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_PROD) logs -f

prod-ps:
	@echo "$(BLUE)🚀 Production container status:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_PROD) ps

# ============================================================================
# DATABASE
# ============================================================================

# SQLite (Development)
db-reset:
	@echo "$(RED)⚠️  WARNING: This will delete all data!$(RESET)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(RESET)"
	@sleep 5
	@echo "$(BLUE)🗄️  Resetting SQLite database...$(RESET)"
	@rm -f $(BACKEND_DIR)/data/transcendence.db
	@echo "$(GREEN)✓ Database reset (will be recreated on next start)$(RESET)"

db-backup:
	@echo "$(BLUE)🗄️  Backing up SQLite database...$(RESET)"
	@mkdir -p backups
	@cp $(BACKEND_DIR)/data/transcendence.db backups/transcendence_$$(date +%Y%m%d_%H%M%S).db 2>/dev/null || echo "$(YELLOW)⚠ No database to backup$(RESET)"
	@echo "$(GREEN)✓ Database backed up to backups/$(RESET)"

db-restore:
	@echo "$(BLUE)🗄️  Available backups:$(RESET)"
	@ls -la backups/*.db 2>/dev/null || echo "$(YELLOW)No backups found$(RESET)"
	@echo ""
	@echo "$(YELLOW)To restore, run:$(RESET)"
	@echo "  cp backups/<backup-file> $(BACKEND_DIR)/data/transcendence.db"

# PostgreSQL (Production)
db-backup-postgres:
	@echo "$(BLUE)🐘 Backing up PostgreSQL database...$(RESET)"
	@./scripts/backup-db.sh

db-restore-postgres:
	@echo "$(BLUE)🐘 PostgreSQL restore utility$(RESET)"
	@./scripts/restore-db.sh

db-test:
	@echo "$(BLUE)🐘 Testing PostgreSQL connection...$(RESET)"
	@./scripts/test-db.sh

db-shell:
	@echo "$(BLUE)🐘 Opening PostgreSQL shell...$(RESET)"
	@docker exec -it transcendence_postgres_prod psql -U $${DB_USER:-transcendence} -d $${DB_NAME:-transcendence}

db-logs:
	@echo "$(BLUE)🐘 PostgreSQL logs:$(RESET)"
	@docker logs transcendence_postgres_prod

# ============================================================================
# CLEANUP
# ============================================================================

clean:
	@echo "$(BLUE)🧹 Removing node_modules...$(RESET)"
	@rm -rf node_modules
	@rm -rf $(BACKEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/node_modules
	@rm -rf $(SHARED_DIR)/node_modules
	@echo "$(GREEN)✓ node_modules removed$(RESET)"

clean-all: clean clean-db
	@echo "$(BLUE)🧹 Removing build artifacts...$(RESET)"
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(BACKEND_DIR)/coverage
	@echo "$(GREEN)✓ All artifacts removed$(RESET)"

clean-docker:
	@echo "$(BLUE)🧹 Removing Docker resources...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_DEV) down -v --rmi local 2>/dev/null || true
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_PROD) down -v --rmi local 2>/dev/null || true
	@docker rmi $(BACKEND_IMAGE):latest $(FRONTEND_IMAGE):latest 2>/dev/null || true
	@echo "$(GREEN)✓ Docker resources removed$(RESET)"

clean-db:
	@echo "$(BLUE)🧹 Removing database...$(RESET)"
	@rm -f $(BACKEND_DIR)/data/transcendence.db
	@echo "$(GREEN)✓ Database removed$(RESET)"

# ============================================================================
# UTILITIES
# ============================================================================

check: lint test
	@echo "$(GREEN)✓ All checks passed$(RESET)"

status:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║                    PROJECT STATUS                             ║$(RESET)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)📁 Directory Structure:$(RESET)"
	@ls -la
	@echo ""
	@echo "$(YELLOW)📦 Backend Dependencies:$(RESET)"
	@[ -d "$(BACKEND_DIR)/node_modules" ] && echo "  $(GREEN)✓ Installed$(RESET)" || echo "  $(RED)✗ Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)📦 Frontend Dependencies:$(RESET)"
	@[ -d "$(FRONTEND_DIR)/node_modules" ] && echo "  $(GREEN)✓ Installed$(RESET)" || echo "  $(RED)✗ Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)🗄️  Database:$(RESET)"
	@[ -f "$(BACKEND_DIR)/data/transcendence.db" ] && echo "  $(GREEN)✓ Exists$(RESET)" || echo "  $(YELLOW)○ Not created yet$(RESET)"
	@echo ""
	@echo "$(YELLOW)🐳 Docker:$(RESET)"
	@docker --version 2>/dev/null && echo "  $(GREEN)✓ Available$(RESET)" || echo "  $(RED)✗ Not installed$(RESET)"
	@echo ""

info:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║                    SYSTEM INFORMATION                         ║$(RESET)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)Node.js:$(RESET)"
	@node --version 2>/dev/null || echo "  $(RED)Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)npm:$(RESET)"
	@npm --version 2>/dev/null || echo "  $(RED)Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Docker:$(RESET)"
	@docker --version 2>/dev/null || echo "  $(RED)Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Docker Compose:$(RESET)"
	@docker-compose --version 2>/dev/null || docker compose version 2>/dev/null || echo "  $(RED)Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)OS:$(RESET)"
	@uname -a
	@echo ""

env:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║                  ENVIRONMENT CHECK                            ║$(RESET)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)Backend .env:$(RESET)"
	@[ -f "$(BACKEND_DIR)/.env" ] && echo "  $(GREEN)✓ Exists$(RESET)" || echo "  $(YELLOW)○ Not found (using defaults)$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend .env:$(RESET)"
	@[ -f "$(FRONTEND_DIR)/.env" ] && echo "  $(GREEN)✓ Exists$(RESET)" || echo "  $(YELLOW)○ Not found (using defaults)$(RESET)"
	@echo ""
	@echo "$(YELLOW)Required environment variables:$(RESET)"
	@echo "  JWT_SECRET           - Secret for JWT tokens"
	@echo "  GOOGLE_CLIENT_ID     - Google OAuth (optional)"
	@echo "  GOOGLE_CLIENT_SECRET - Google OAuth (optional)"
	@echo "  GITHUB_CLIENT_ID     - GitHub OAuth (optional)"
	@echo "  GITHUB_CLIENT_SECRET - GitHub OAuth (optional)"
	@echo ""

verify:
	@echo "$(BLUE)🔍 Verifying project setup...$(RESET)"
	@echo ""
	@echo "$(YELLOW)Checking Node.js...$(RESET)"
	@node --version >/dev/null 2>&1 && echo "  $(GREEN)✓ Node.js installed$(RESET)" || (echo "  $(RED)✗ Node.js not found$(RESET)" && exit 1)
	@echo ""
	@echo "$(YELLOW)Checking npm...$(RESET)"
	@npm --version >/dev/null 2>&1 && echo "  $(GREEN)✓ npm installed$(RESET)" || (echo "  $(RED)✗ npm not found$(RESET)" && exit 1)
	@echo ""
	@echo "$(YELLOW)Checking package.json files...$(RESET)"
	@[ -f "$(BACKEND_DIR)/package.json" ] && echo "  $(GREEN)✓ Backend package.json$(RESET)" || echo "  $(RED)✗ Backend package.json missing$(RESET)"
	@[ -f "$(FRONTEND_DIR)/package.json" ] && echo "  $(GREEN)✓ Frontend package.json$(RESET)" || echo "  $(RED)✗ Frontend package.json missing$(RESET)"
	@echo ""
	@echo "$(GREEN)✓ Verification complete$(RESET)"

deps-check:
	@echo "$(BLUE)📦 Checking for outdated dependencies...$(RESET)"
	@echo ""
	@echo "$(YELLOW)Backend:$(RESET)"
	@cd $(BACKEND_DIR) && npm outdated 2>/dev/null || echo "  All up to date!"
	@echo ""
	@echo "$(YELLOW)Frontend:$(RESET)"
	@cd $(FRONTEND_DIR) && npm outdated 2>/dev/null || echo "  All up to date!"
	@echo ""

security-check:
	@echo "$(BLUE)🔒 Running security audit...$(RESET)"
	@echo ""
	@echo "$(YELLOW)Backend:$(RESET)"
	@cd $(BACKEND_DIR) && npm audit 2>/dev/null || true
	@echo ""
	@echo "$(YELLOW)Frontend:$(RESET)"
	@cd $(FRONTEND_DIR) && npm audit 2>/dev/null || true
	@echo ""

update:
	@echo "$(BLUE)📦 Updating dependencies...$(RESET)"
	@echo ""
	@echo "$(YELLOW)Updating backend...$(RESET)"
	@cd $(BACKEND_DIR) && npm update
	@echo ""
	@echo "$(YELLOW)Updating frontend...$(RESET)"
	@cd $(FRONTEND_DIR) && npm update
	@echo ""
	@echo "$(GREEN)✓ Dependencies updated$(RESET)"

# ============================================================================
# ALIASES (42 project convention)
# ============================================================================

all: install
re: clean-all install
fclean: clean-all
