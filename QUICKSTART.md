# 🚀 Quick Start Guide

**For Teammates: Getting Started with Transcendence**

*This guide helps you quickly understand the repository structure and where to work on tasks.*

---

## 📁 Repository Structure (Simplified)

```
transcendence/
├── backend/           # Express.js API server
│   └── src/          # All backend code (controllers, models, routes, etc.)
├── frontend/          # Vue 3 web app
│   └── src/          # All frontend code (views, components, stores, etc.)
├── docs/              # Technical documentation
├── scripts/           # Database & admin utility scripts
├── nginx/             # Production reverse proxy config
├── Makefile           # Build commands (make dev, make test, etc.)
├── BACKLOG.md         # Sprint planning & module tracker
├── CONTRIBUTING.md    # How to contribute code
└── README.md          # Full project documentation
```

---

## 🏃 Running the Project

### Option 1: Docker (Recommended)

```bash
# First time setup
make install          # Install all dependencies

# Start all services (nginx + frontend + backend + postgres)
make up

# Application: http://localhost:8080
```

### Option 2: Local Development (Without Docker)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev          # Runs on localhost:3000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev          # Runs on localhost:5173

# Note: You'll need PostgreSQL running locally
# Frontend: http://localhost:5173
```

### Option 3: Manual

```bash
# Backend (Terminal 1)
cd backend
npm install
npm run dev          # Runs on port 3000

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev          # Runs on port 5173
```

---

## 👥 Team Roles & Where to Work

### **vagarcia** — Product Owner & Lead Developer
- **Primary**: Architecture decisions, code review, deployment, sprint planning
- **Works in**: All areas, focuses on integration and production readiness
- **Key files**: BACKLOG.md, Makefile, docker configs, database migrations

### **kfan** — Backend Developer
- **Primary**: API endpoints, database models, authentication, WebSocket
- **Works in**: `backend/src/`
- **Key folders**:
  - `backend/src/controllers/` — Request handlers (authController.js, gameController.js, etc.)
  - `backend/src/models/` — Database operations (User.js, Game.js, Chat.js, etc.)
  - `backend/src/routes/` — API routes
  - `backend/src/services/` — Business logic (Socket.io, AI service)

### **dpotsch** — Frontend Developer
- **Primary**: Vue components, pages, UI/UX, state management
- **Works in**: `frontend/src/`
- **Key folders**:
  - `frontend/src/views/` — Page components (Game.vue, Profile.vue, Login.vue, etc.)
  - `frontend/src/components/` — Reusable components (PostCard.vue, etc.)
  - `frontend/src/stores/` — Pinia state management (auth.js, chat.js, social.js)
  - `frontend/src/router/` — Page routing

### **lstefane** — Full-Stack Developer
- **Primary**: Integration, testing, bug fixes, features spanning backend + frontend
- **Works in**: Both `backend/` and `frontend/`
- **Key focus**:
  - `backend/src/__tests__/` — Jest tests
  - Feature integration (e.g., chat system = backend routes + frontend UI)
  - Bug fixes across the stack

---

## 🗂️ Where is Everything?

### Documentation

All technical docs are in the **`docs/`** folder:

| File | Purpose |
|------|---------|
| [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) | JWT, OAuth 2.0, 2FA setup |
| [docs/DATABASE_MIGRATION.md](docs/DATABASE_MIGRATION.md) | SQLite → PostgreSQL migration |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment & SSL |
| [docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md) | Google & GitHub OAuth config |
| [docs/SECURITY.md](docs/SECURITY.md) | Security best practices |
| [docs/TESTING.md](docs/TESTING.md) | Testing guide & coverage |
| [docs/transubject.pdf](docs/transubject.pdf) | 42 School subject PDF |

### Backend Structure

```
backend/src/
├── __tests__/         # Jest tests (run: npm test)
├── config/            # Database, Passport OAuth, app config
├── controllers/       # Request handlers (the "C" in MVC)
├── middleware/        # Auth middleware, error handling
├── models/            # Database operations (the "M" in MVC)
├── routes/            # API routes (maps URLs to controllers)
├── services/          # Business logic (Socket.io, AI opponent)
└── utils/             # Helper functions (JWT, validation, response formatting)
```

**Common tasks:**
- Add new API endpoint: Create in `routes/`, controller in `controllers/`, model in `models/`
- Add database table/column: Update `config/database.js` + `config/database.pg.js`, create migration script in `scripts/`
- Fix auth bug: Check `controllers/authController.js`, `middleware/auth.js`, `utils/auth.js`

### Frontend Structure

```
frontend/src/
├── assets/            # Images, fonts, static files
├── components/        # Reusable Vue components
├── router/            # Vue Router config (page navigation)
├── services/          # API client (api.js), Socket.io client (socket.js)
├── stores/            # Pinia state management (auth, chat, social)
├── views/             # Page components (Login, Game, Profile, etc.)
├── App.vue            # Root component
├── main.js            # App entry point
└── style.css          # Global CSS
```

**Common tasks:**
- Add new page: Create in `views/`, add route in `router/index.js`
- Add reusable component: Create in `components/`
- Add state management: Create Pinia store in `stores/`
- Fix API call: Check `services/api.js` or the relevant store

### Scripts & Utilities

```
scripts/
├── add-admin-field.js    # Migration script for admin system
├── backup-db.sh          # PostgreSQL backup
├── make-admin.sh         # CLI tool to make user admin
├── restore-db.sh         # PostgreSQL restore
└── test-db.sh            # Test PostgreSQL connection
```

**Usage:**
```bash
# Test PostgreSQL connection
./scripts/test-db.sh

# Make a user admin
./scripts/make-admin.sh <username>

# Backup production database
./scripts/backup-db.sh
```

---

## 🛠️ Common Commands (Makefile)

The **Makefile** provides shortcuts for common tasks:

```bash
# Development
make dev              # Start backend + frontend dev servers
make dev-backend      # Start backend only
make dev-frontend     # Start frontend only

# Testing
make test             # Run backend tests
make test-watch       # Run tests in watch mode
make test-coverage    # Generate coverage report

# Docker
make docker-up        # Start dev containers
make docker-down      # Stop dev containers
make docker-logs      # View container logs

# Production
make prod-build       # Build production images
make prod-up          # Start production containers
make prod-down        # Stop production

# Database
make db-reset         # Reset SQLite database (dev)
make db-backup        # Backup SQLite (dev)
make db-test          # Test PostgreSQL connection

# Cleanup
make clean            # Remove node_modules
make clean-all        # Remove everything (modules, builds, db)

# Utilities
make lint             # Run linters
make check            # Run lint + tests
make status           # Show project status
make help             # Show all commands
```

---

## 📋 Sprint Planning & Tasks

Check **[BACKLOG.md](BACKLOG.md)** for:

- **Module Point Tracker**: Which modules are done, in progress, or to-do
- **Sprint Plans**: What features to implement next
- **Task Division**: Who is working on what
- **Decision Log**: Important architectural decisions

---

## 🔥 Quick Workflows

### Adding a New Feature (Full-Stack)

**Example: Add "like alpaca" feature**

1. **Backend** (kfan or lstefane):
   - Create route: `backend/src/routes/alpacas.js`
   - Create controller: `backend/src/controllers/alpacaController.js`
   - Create model: `backend/src/models/Alpaca.js`
   - Add database table in `backend/src/config/database.js`
   - Write tests: `backend/src/__tests__/controllers/alpacaController.test.js`

2. **Frontend** (dpotsch or lstefane):
   - Create component: `frontend/src/components/AlpacaCard.vue`
   - Add to page: Edit `frontend/src/views/Game.vue`
   - Add API call: Update `frontend/src/services/api.js`
   - Add state management: Update `frontend/src/stores/social.js` (or create `alpaca.js`)

3. **Integration** (vagarcia or lstefane):
   - Test end-to-end flow
   - Update BACKLOG.md
   - Create PR for review

### Fixing a Bug

1. Identify where the bug is:
   - **Frontend UI bug**: Check `frontend/src/views/` or `frontend/src/components/`
   - **API not returning data**: Check `backend/src/controllers/` and `backend/src/models/`
   - **Authentication issue**: Check `backend/src/middleware/auth.js` and `backend/src/controllers/authController.js`
   - **Database issue**: Check `backend/src/config/database.js` or `backend/src/models/`

2. Write a test that reproduces the bug (if backend):
   - Add to `backend/src/__tests__/`

3. Fix the bug, run tests, commit

### Running Tests

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm test -- user.test.js    # Run specific test file
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage report
```

---

## 🌐 Environment Variables

### Backend `.env`

Located at: `backend/.env`

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production

# Database (production)
DATABASE_URL=postgresql://user:password@localhost:5432/transcendence

# OAuth (optional, for Google/GitHub login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Template**: `backend/.env.example`

### Frontend `.env`

Located at: `frontend/.env.production`

```env
VITE_API_URL=http://localhost:3000
```

**Template**: `frontend/.env.example`

---

## 🐞 Troubleshooting

### "Cannot connect to backend"

- Check backend is running: `http://localhost:3000/api/health`
- Check `frontend/.env.production` has correct `VITE_API_URL`
- CORS issue? Check `backend/src/config/index.js` CORS config

### "Database error"

- **Dev (SQLite)**: Delete `backend/data/transcendence.db` and restart
- **Prod (PostgreSQL)**: Check connection with `./scripts/test-db.sh`

### "npm install fails"

- Delete `node_modules/` and `package-lock.json`, then `npm install` again
- Or use: `make clean && make install`

### "Tests failing"

- Make sure backend is NOT running when testing (tests use their own database)
- Check `backend/.env` has `NODE_ENV=development`

### "Docker permission denied"

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📚 More Documentation

- **Full README**: [README.md](README.md) — Complete project documentation
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md) — Code standards, branching, PR process
- **Backlog**: [BACKLOG.md](BACKLOG.md) — Sprint planning, module tracker, decision log

**Technical Docs** (in `docs/`):
- [Authentication Guide](docs/AUTHENTICATION.md)
- [Database Migration](docs/DATABASE_MIGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [OAuth Setup](docs/OAUTH_SETUP.md)
- [Security Best Practices](docs/SECURITY.md)
- [Testing Guide](docs/TESTING.md)

---

## 💡 Pro Tips

1. **Use the Makefile**: `make dev`, `make test`, `make help` — saves time
2. **Check BACKLOG.md**: Always updated with what needs to be done
3. **Write tests**: Backend tests are in `backend/src/__tests__/`
4. **Ask the PO**: vagarcia reviews all PRs and handles architecture decisions
5. **Keep it clean**: Run `make lint` before committing
6. **Commit often**: Small, focused commits are easier to review
7. **Update docs**: If you change behavior, update relevant `.md` files

---

## 🎯 Getting Help

- **Architecture questions**: Ask vagarcia (Product Owner)
- **Backend questions**: Ask kfan or lstefane
- **Frontend questions**: Ask dpotsch or lstefane
- **Testing questions**: Check [docs/TESTING.md](docs/TESTING.md) or ask lstefane
- **Deployment questions**: Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) or ask vagarcia

---

**Happy coding! 🎮**
