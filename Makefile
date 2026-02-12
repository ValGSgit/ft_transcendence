# ==========================================================================
# TRANSCENDENCE - Makefile
# ==========================================================================
# A clean build system for Docker-based development with nginx + PostgreSQL
# ==========================================================================

# Colors for terminal output
RED    := \033[0;31m
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
CYAN   := \033[0;36m
RESET  := \033[0m

# Project configuration
PROJECT_NAME := transcendence
BACKEND_DIR  := backend
FRONTEND_DIR := frontend

# Docker
DOCKER_COMPOSE := docker compose

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# HELP
# ============================================================================

help:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║              🎮  TRANSCENDENCE MAKEFILE  🎮                   ║$(RESET)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)📦 INSTALLATION$(RESET)"
	@echo "  $(GREEN)make install$(RESET)          Install all dependencies"
	@echo "  $(GREEN)make setup$(RESET)            Full project setup (install + env check)"
	@echo ""
	@echo "$(YELLOW)🐳 DOCKER$(RESET)"
	@echo "  $(GREEN)make up$(RESET)               Start all containers"
	@echo "  $(GREEN)make down$(RESET)             Stop all containers"
	@echo "  $(GREEN)make build$(RESET)            Build containers"
	@echo "  $(GREEN)make restart$(RESET)          Restart all containers"
	@echo "  $(GREEN)make logs$(RESET)             View container logs"
	@echo "  $(GREEN)make ps$(RESET)               Show container status"
	@echo "  $(GREEN)make shell-backend$(RESET)    Shell into backend container"
	@echo "  $(GREEN)make shell-frontend$(RESET)   Shell into frontend container"
	@echo "  $(GREEN)make shell-db$(RESET)         PostgreSQL shell"
	@echo ""
	@echo "$(YELLOW)🧪 TESTING$(RESET)"
	@echo "  $(GREEN)make test$(RESET)             Run all tests"
	@echo "  $(GREEN)make test-watch$(RESET)       Run tests in watch mode"
	@echo "  $(GREEN)make test-coverage$(RESET)    Generate coverage report"
	@echo ""
	@echo "$(YELLOW)🗄️  DATABASE$(RESET)"
	@echo "  $(GREEN)make admin EMAIL=<email>$(RESET)  Make a user admin"
	@echo "  $(GREEN)make db-backup$(RESET)        Backup PostgreSQL database"
	@echo "  $(GREEN)make db-restore$(RESET)       Restore PostgreSQL database"
	@echo "  $(GREEN)make db-reset$(RESET)         Reset database (remove volume)"
	@echo ""
	@echo "$(YELLOW)🧹 CLEANUP$(RESET)"
	@echo "  $(GREEN)make clean$(RESET)            Remove node_modules"
	@echo "  $(GREEN)make clean-all$(RESET)        Remove everything (modules + volumes + images)"
	@echo ""
	@echo "$(YELLOW)🔧 UTILITIES$(RESET)"
	@echo "  $(GREEN)make lint$(RESET)             Run linters"
	@echo "  $(GREEN)make format$(RESET)           Format code"
	@echo "  $(GREEN)make status$(RESET)           Show project status"
	@echo "  $(GREEN)make info$(RESET)             Show system information"
	@echo ""
	@echo "$(CYAN)💡 Quick Start:$(RESET)"
	@echo "   $(GREEN)make up$(RESET)              → Start the app at http://localhost:8080"
	@echo ""

# ============================================================================
# INSTALLATION
# ============================================================================

install:
	@echo "$(BLUE)📦 Installing all dependencies...$(RESET)"
	@cd $(BACKEND_DIR) && npm install
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

setup: install
	@echo ""
	@echo "$(GREEN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(GREEN)║              ✓ PROJECT SETUP COMPLETE!                        ║$(RESET)"
	@echo "$(GREEN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(CYAN)Next steps:$(RESET)"
	@echo "  1. Run $(YELLOW)make up$(RESET) to start all services"
	@echo "  2. Open $(YELLOW)http://localhost:8080$(RESET) in your browser"
	@echo ""

# ============================================================================
# DOCKER
# ============================================================================

up:
	@echo "$(BLUE)🐳 Starting all containers...$(RESET)"
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ All services started$(RESET)"
	@echo "$(CYAN)  Application: http://localhost:8080$(RESET)"
	@echo "$(CYAN)  (nginx :8080 → frontend:5173, backend:3000, postgres)$(RESET)"

down:
	@echo "$(BLUE)🐳 Stopping containers...$(RESET)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Containers stopped$(RESET)"

build:
	@echo "$(BLUE)🐳 Building containers...$(RESET)"
	@$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Containers built$(RESET)"

restart: down up
	@echo "$(GREEN)✓ Containers restarted$(RESET)"

logs:
	@$(DOCKER_COMPOSE) logs -f

ps:
	@echo "$(BLUE)🐳 Container status:$(RESET)"
	@$(DOCKER_COMPOSE) ps

shell-backend:
	@echo "$(BLUE)🐳 Opening shell in backend container...$(RESET)"
	@$(DOCKER_COMPOSE) exec backend sh

shell-frontend:
	@echo "$(BLUE)🐳 Opening shell in frontend container...$(RESET)"
	@$(DOCKER_COMPOSE) exec frontend sh

shell-db:
	@echo "$(BLUE)🐘 Opening PostgreSQL shell...$(RESET)"
	@$(DOCKER_COMPOSE) exec postgres psql -U transcendence -d transcendence

# ============================================================================
# TESTING
# ============================================================================

test:
	@echo "$(BLUE)🧪 Running backend tests...$(RESET)"
	@cd $(BACKEND_DIR) && npm test

test-watch:
	@echo "$(BLUE)🧪 Running tests in watch mode...$(RESET)"
	@cd $(BACKEND_DIR) && npm test -- --watch

test-coverage:
	@echo "$(BLUE)🧪 Generating coverage report...$(RESET)"
	@cd $(BACKEND_DIR) && npm test -- --coverage
	@echo "$(GREEN)✓ Coverage: $(BACKEND_DIR)/coverage/lcov-report/index.html$(RESET)"

# ============================================================================
# LINTING & FORMATTING
# ============================================================================

lint:
	@echo "$(BLUE)🔍 Linting backend...$(RESET)"
	@cd $(BACKEND_DIR) && npm run lint 2>/dev/null || echo "$(YELLOW)⚠ No lint script$(RESET)"
	@echo "$(BLUE)🔍 Linting frontend...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run lint 2>/dev/null || echo "$(YELLOW)⚠ No lint script$(RESET)"
	@echo "$(GREEN)✓ Linting complete$(RESET)"

format:
	@echo "$(BLUE)✨ Formatting code...$(RESET)"
	@cd $(BACKEND_DIR) && npx prettier --write "src/**/*.js" 2>/dev/null || true
	@cd $(FRONTEND_DIR) && npx prettier --write "src/**/*.{js,vue}" 2>/dev/null || true
	@echo "$(GREEN)✓ Code formatted$(RESET)"

# ============================================================================
# DATABASE
# ============================================================================

admin:
	@if [ -z "$(EMAIL)" ]; then \
		echo "$(RED)❌ Error: EMAIL required$(RESET)"; \
		echo ""; \
		echo "$(YELLOW)Usage:$(RESET)"; \
		echo "  make admin EMAIL=your@email.com"; \
		echo ""; \
		exit 1; \
	fi
	@./scripts/make-admin.sh "$(EMAIL)"

db-backup:
	@echo "$(BLUE)🐘 Backing up PostgreSQL database...$(RESET)"
	@./scripts/backup-db.sh

db-restore:
	@echo "$(BLUE)🐘 PostgreSQL restore utility$(RESET)"
	@./scripts/restore-db.sh

db-reset:
	@echo "$(RED)⚠️  WARNING: This will delete all data!$(RESET)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or wait 5 seconds...$(RESET)"
	@sleep 5
	@echo "$(BLUE)🐘 Removing PostgreSQL volume...$(RESET)"
	@$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✓ Database reset (will be recreated on next start)$(RESET)"

# ============================================================================
# CLEANUP
# ============================================================================

clean:
	@echo "$(BLUE)🧹 Removing node_modules...$(RESET)"
	@rm -rf $(BACKEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/node_modules
	@echo "$(GREEN)✓ node_modules removed$(RESET)"

clean-all: clean
	@echo "$(BLUE)🧹 Removing Docker volumes and images...$(RESET)"
	@$(DOCKER_COMPOSE) down -v --rmi local 2>/dev/null || true
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(BACKEND_DIR)/coverage
	@echo "$(GREEN)✓ All artifacts removed$(RESET)"

# ============================================================================
# UTILITIES
# ============================================================================

status:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║                    PROJECT STATUS                             ║$(RESET)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)📦 Backend Dependencies:$(RESET)"
	@[ -d "$(BACKEND_DIR)/node_modules" ] && echo "  $(GREEN)✓ Installed$(RESET)" || echo "  $(RED)✗ Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)📦 Frontend Dependencies:$(RESET)"
	@[ -d "$(FRONTEND_DIR)/node_modules" ] && echo "  $(GREEN)✓ Installed$(RESET)" || echo "  $(RED)✗ Not installed$(RESET)"
	@echo ""
	@echo "$(YELLOW)🐳 Docker Containers:$(RESET)"
	@$(DOCKER_COMPOSE) ps 2>/dev/null || echo "  $(YELLOW)○ Not running$(RESET)"
	@echo ""

info:
	@echo ""
	@echo "$(CYAN)╔═══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║                    SYSTEM INFORMATION                         ║$(RESET)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)Node.js:$(RESET) $$(node --version 2>/dev/null || echo 'Not installed')"
	@echo "$(YELLOW)npm:$(RESET) $$(npm --version 2>/dev/null || echo 'Not installed')"
	@echo "$(YELLOW)Docker:$(RESET) $$(docker --version 2>/dev/null || echo 'Not installed')"
	@echo "$(YELLOW)Docker Compose:$(RESET) $$(docker compose version 2>/dev/null || echo 'Not installed')"
	@echo ""

# ============================================================================
# ALIASES (42 project convention)
# ============================================================================

.PHONY: all re fclean
all: install
re: clean-all install
fclean: clean-all
