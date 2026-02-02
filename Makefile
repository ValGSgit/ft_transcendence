.PHONY: help install dev build clean docker-build docker-up docker-down docker-logs test docker-prod docker-prod-up docker-prod-down

help:
	@echo "transcendence - Available commands:"
	@echo ""
	@echo "  make install        Install all dependencies"
	@echo "  make dev            Start development servers (backend + frontend)"
	@echo "  make build          Build frontend for production"
	@echo "  make clean          Remove all node_modules"
	@echo ""
	@echo "  make docker-build   Build Docker containers for development"
	@echo "  make docker-up      Start Docker containers for development"
	@echo "  make docker-down    Stop Docker containers"
	@echo "  make docker-logs    View Docker logs"
	@echo ""
	@echo "  make docker-prod    Build production Docker images"
	@echo "  make docker-prod-up Start production containers (detached)"
	@echo "  make docker-prod-down Stop production containers"
	@echo ""
	@echo "  make test           Run backend tests with coverage"
	@echo "  make test-watch     Run backend tests in watch mode"

install:
	@echo "Installing dependencies..."
	npm install
	cd backend && npm install
	cd frontend && npm install
	cd shared && npm install
	@echo "✓ All dependencies installed"

dev:
	@echo "Starting development servers..."
	npm run dev

dev-backend:
	@echo "Starting backend only..."
	cd backend && npm run dev

dev-frontend:
	@echo "Starting frontend only..."
	cd frontend && npm run dev

build:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✓ Build complete"

clean:
	@echo "Cleaning node_modules..."
	rm -rf node_modules backend/node_modules frontend/node_modules shared/node_modules
	@echo "✓ Clean complete"

docker-build:
	@echo "Building Docker containers..."
	docker-compose build
	@echo "✓ Docker build complete"

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "✓ Containers started"
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:5173"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down
	@echo "✓ Containers stopped"

docker-logs:
	docker-compose logs -f

# Production containerization
docker-prod:
	@echo "Building production Docker images..."
	@echo "This creates optimized, multi-stage builds for deployment"
	docker build -t transcendence-backend:latest -f backend/Dockerfile.prod ./backend
	docker build -t transcendence-frontend:latest -f frontend/Dockerfile.prod ./frontend
	@echo "✓ Production images built successfully"
	@echo ""
	@echo "Images created:"
	@echo "  - transcendence-backend:latest"
	@echo "  - transcendence-frontend:latest"

docker-prod-up:
	@echo "Starting production containers..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✓ Production containers started"
	@echo "Access the application at: http://localhost"

docker-prod-down:
	@echo "Stopping production containers..."
	docker-compose -f docker-compose.prod.yml down
	@echo "✓ Production containers stopped"

docker-prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Testing
test:
	@echo "Running backend tests with coverage..."
	cd backend && npm test
	@echo "✓ Tests complete"
	@echo "Check backend/coverage/index.html for detailed coverage report"

test-watch:
	@echo "Running tests in watch mode..."
	cd backend && npm run test:watch
