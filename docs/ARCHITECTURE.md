# Architecture Documentation

## 🏗️ Overview

Transcendence is a full-stack web application built with a **clean, Docker-based architecture**. Everything runs through a single entry point (`nginx` on port 80) with PostgreSQL as the only database.

## 📦 Technology Stack

### Frontend
- **Framework**: Vue 3.5+ (Composition API)
- **Build Tool**: Vite 5.4+
- **3D Graphics**: Three.js 0.182+ (Alpaca Farm game)
- **State Management**: Pinia
- **Routing**: Vue Router 4.6+
- **Real-time**: Socket.io Client 4.8+

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL 16 (with SQL translation adapter)
- **Authentication**: JWT + OAuth 2.0 (Google, GitHub) + TOTP 2FA
- **Real-time**: Socket.io Server 4.8+
- **Security**: Helmet, bcrypt, rate limiting

### Infrastructure
- **Reverse Proxy**: Nginx (Alpine)
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 16 (Alpine)

---

## 🐳 Docker Architecture

All services run in isolated Docker containers within a single network:

```
Browser → http://localhost:8080 (nginx:8080)
              ↓
         [Nginx Reverse Proxy]
              ↓
         ┌────┴─────┐
         ↓          ↓
    [Frontend]  [Backend]
    Vite :5173  Express :3000
                    ↓
               [PostgreSQL]
                  :5432
```

### Services

#### 1. **nginx** (Port 8080)
- **Purpose**: Single entry point for all traffic
- **Routes**:
  - `/` → Frontend (Vite dev server)
  - `/api` → Backend (Express API)
  - `/socket.io` → Backend (WebSocket)
- **Features**: HTTP/1.1 upgrade for WebSocket (HMR + Socket.io)

#### 2. **frontend**
- **Image**: Node 20 Alpine
- **Port**: 5173 (internal)
- **Environment**: Vite dev server with hot module replacement
- **Volume**: `./frontend:/app` (live code sync)

#### 3. **backend**
- **Image**: Node 20 Alpine
- **Port**: 3000 (internal)
- **Environment**: Express.js with auto-reload
- **Volume**: `./backend:/app` (live code sync)
- **Dependencies**: PostgreSQL (waits for health check)

#### 4. **postgres**
- **Image**: PostgreSQL 16 Alpine
- **Port**: 5432 (internal)
- **Volume**: `postgres_data` (persistent storage)
- **Health Check**: `pg_isready`

---

## 🗂️ Database Architecture

### PostgreSQL-Only Design

All environments (development & production) use **PostgreSQL**. This eliminates the complexity of dual-database support.

#### SQL Translation Layer

The backend uses a **SQLite-compatible adapter** in `backend/src/config/database.pg.js`:

- Translates `?` placeholders → `$1, $2, $3...` (PostgreSQL format)
- Converts `INSERT OR IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`
- Converts `LIKE` → `ILIKE` (case-insensitive)
- Converts `datetime('now')` → `NOW()`
- Auto-adds `RETURNING *` to INSERT statements

This allows all models to use SQLite-style syntax while running on PostgreSQL.

#### Schema

Tables:
- `users` — User accounts (with 2FA, OAuth, admin flag)
- `friend_requests`, `friends`, `blocked_users` — Social features
- `chat_rooms`, `chat_room_members`, `messages` — Real-time chat
- `games`, `user_stats` — Game data & statistics
- `posts`, `post_likes`, `post_comments` — Social feed
- `notifications` — Real-time notifications
- `password_reset_tokens` — Secure password reset
- `matchmaking_queue` — Game matchmaking

---

## 🔌 API Communication

### Development Workflow

1. **Browser** sends requests to `http://localhost:8080` (nginx)
2. **Nginx** routes based on path:
   - Static files, Vue SPA → `frontend:5173`
   - API calls → `backend:3000/api`
   - WebSocket → `backend:3000/socket.io`
3. **Backend** connects to `postgres:5432`

### Frontend API Client

All API calls use **relative URLs** (`/api/*`) which nginx routes to the backend.

**frontend/src/services/api.js**:
```javascript
const api = axios.create({
  baseURL: '/api',  // Relative URL (nginx handles routing)
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})
```

### Socket.io Connection

**frontend/src/services/socket.js**:
```javascript
this.socket = io({
  auth: { token },
  transports: ['websocket', 'polling'],
  path: '/socket.io/'  // Nginx proxies to backend
})
```

### CORS Configuration

`backend/src/config/index.js` allows:
- `http://localhost:8080` (nginx)
- `http://127.0.0.1:8080`
- `http://localhost:5173` (for local dev without Docker)

---

## 🚀 Development Workflow

### Quick Start

```bash
# 1. Install dependencies
make install   # or: npm install in backend/ and frontend/

# 2. Start all services
make up        # or: docker compose up -d

# 3. Open in browser
open http://localhost:8080
```

### Hot Module Replacement (HMR)

Vite HMR works seamlessly through nginx:
- File changes in `frontend/src/` auto-refresh the browser
- Nginx proxies WebSocket connections for HMR
- `vite.config.js` sets `hmr.clientPort: 8080` so browser connects through nginx

### Database Access

```bash
# PostgreSQL shell
make shell-db  # or: docker compose exec postgres psql -U transcendence -d transcendence

# Backup
make db-backup

# Reset (delete all data)
make db-reset
```

### Logs

```bash
# All services
make logs

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f nginx
```

---

## 🔐 Authentication Flow

### Standard Login

1. User submits credentials (`POST /api/auth/login`)
2. Backend verifies password (bcrypt)
3. If 2FA enabled, request TOTP code
4. Generate JWT (access + refresh tokens)
5. Frontend stores tokens in localStorage + Pinia store
6. All requests include `Authorization: Bearer <token>` header

### OAuth 2.0 (Google/GitHub)

1. User clicks "Login with Google"
2. Redirect to `GET /api/auth/google` (Passport.js)
3. Google consent screen
4. Callback to `GET /api/auth/google/callback`
5. Backend creates/finds user, generates JWT
6. Redirect to frontend with tokens

### Two-Factor Authentication (2FA)

1. User enables 2FA in settings
2. Backend generates TOTP secret (speakeasy)
3. QR code displayed (user scans with authenticator app)
4. User verifies 6-digit code
5. On login, after password verification, request TOTP code
6. Verify TOTP → issue JWT

### Token Refresh

- Access tokens expire in 24h
- Refresh tokens expire in 7d
- Frontend automatically refreshes when access token expires
- Interceptor in `api.js` handles refresh logic

---

## 📁 Project Structure

```
transcendence/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, environment, passport
│   │   ├── controllers/    # Business logic (auth, chat, game, etc.)
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # AI, Socket.io
│   │   └── utils/          # Auth, validation, response helpers
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/         # Images, styles
│   │   ├── components/     # Vue components
│   │   ├── router/         # Vue Router config
│   │   ├── services/       # API client, Socket.io
│   │   ├── stores/         # Pinia stores
│   │   └── views/          # Page components
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
│
├── nginx/
│   └── nginx.conf          # Reverse proxy config
│
├── docs/                   # All documentation
├── docker-compose.yml      # Single compose file for all services
├── Makefile                # Development commands
└── .env                    # Environment variables
```

---

## 🎯 Design Principles

### 1. **Single Entry Point**
- Everything goes through nginx on port 80
- No CORS issues (same origin)
- Clean, predictable URLs

### 2. **Database Simplicity**
- PostgreSQL everywhere (no SQLite/PostgreSQL dual-DB)
- SQL translation adapter keeps models simple
- Easy to add an ORM later (Sequelize/Prisma)

### 3. **Developer Experience**
- One command to start: `make up`
- Hot reload for frontend & backend
- Persistent database (Docker volume)
- Clean Makefile with helpful commands

### 4. **Production-Ready Patterns**
- Environment-based configuration
- Health checks for all services
- Graceful error handling
- Security best practices (Helmet, bcrypt, rate limiting)

### 5. **Real-time First**
- WebSocket connections for game, chat, notifications
- Optimistic updates in frontend
- Server-authoritative game state

---

## 📊 Module Coverage (42 Subject)

### Implemented (31+ points)

**Web (13 pts)**
- ✅ Frontend + Backend framework (Vue + Express)
- ✅ Real-time WebSockets (Socket.io)
- ✅ User interaction (chat, profiles, friends)
- ✅ Notification system

**User Management (7 pts)**
- ✅ Standard auth (JWT)
- ✅ Remote auth (OAuth 2.0)
- ✅ 2FA (TOTP)

**Gaming (8+ pts)**
- ✅ Web-based game (Alpaca Farm with Three.js)
- ✅ Advanced 3D graphics

**Infrastructure**
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ PostgreSQL database
- ✅ Real-time communication

### Roadmap (Future Modules)

**Web**
- 🔜 Public API (Swagger/OpenAPI documentation)
- 🔜 ORM (Sequelize or Prisma)
- 🔜 Design system (10+ reusable components)
- 🔜 Advanced search (filters, sorting, pagination)
- 🔜 File upload system

**User Management**
- 🔜 Organization system
- 🔜 User analytics dashboard

**Gaming**
- 🔜 Second game with matchmaking
- 🔜 Multiplayer (3+ players)
- 🔜 Remote players
- 🔜 Game customization
- 🔜 Gamification system

**Data & Analytics**
- 🔜 Data export/import
- 🔜 GDPR compliance

---

## 🔧 Configuration

### Environment Variables

**Root `.env`** (for docker-compose):
```env
DB_NAME=transcendence
DB_USER=transcendence
DB_PASSWORD=transcendence_password
JWT_SECRET=dev-secret-please-change-in-production
```

**Backend** (set in docker-compose.yml):
```env
NODE_ENV=development
PORT=3000
DB_TYPE=postgres
DB_HOST=postgres
FRONTEND_URL=http://localhost
CORS_ORIGINS=http://localhost,http://127.0.0.1
```

**Frontend** (vite.config.js):
- No environment variables needed!
- All requests use relative URLs
- Vite proxy (for local dev) routes to `localhost:3000`

### OAuth Setup

1. **Google**: https://console.cloud.google.com/
   - Create OAuth 2.0 credentials
   - Callback URL: `http://localhost:8080/api/auth/google/callback`
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

2. **GitHub**: https://github.com/settings/developers
   - Register new OAuth app
   - Callback URL: `http://localhost:8080/api/auth/github/callback`
   - Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`

---

## 🧪 Testing

```bash
# Run all backend tests
make test

# Watch mode
make test-watch

# Coverage report
make test-coverage
```

Test files:
- `backend/src/__tests__/` — Unit & integration tests
- `backend/postman_collection.json` — API tests (Postman/Insomnia)

---

## 📚 Additional Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** — Get started in 5 minutes
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** — Auth system deep dive
- **[DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)** — Database schema changes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Production deployment guide
- **[OAUTH_SETUP.md](./OAUTH_SETUP.md)** — OAuth configuration
- **[SECURITY.md](./SECURITY.md)** — Security best practices
- **[TESTING.md](./TESTING.md)** — Testing guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Development workflow

---

## 🎓 For Your Teammates

### "How do I start?"

```bash
make install  # Install dependencies
make up       # Start everything
```

Open http://localhost:8080 in your browser. Done!

### "Where do I add new features?"

- **API endpoint**: Add to `backend/src/routes/`
- **Business logic**: Add to `backend/src/controllers/`
- **Database query**: Add to `backend/src/models/`
- **Frontend page**: Add to `frontend/src/views/`
- **Component**: Add to `frontend/src/components/`
- **State management**: Add to `frontend/src/stores/`

### "How does authentication work?"

Read [AUTHENTICATION.md](./AUTHENTICATION.md) for the full flow. TL;DR:
1. User logs in → backend generates JWT
2. Frontend stores JWT in localStorage + Pinia
3. All API requests include `Authorization: Bearer <token>`
4. Backend middleware verifies JWT

### "How do I use the database?"

Models in `backend/src/models/` use the database adapter:

```javascript
import db from '../config/database.js';

// Query
const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// Insert
await db.prepare('INSERT INTO users (username, email) VALUES (?, ?)').run(username, email);
```

The adapter translates SQLite syntax to PostgreSQL automatically.

### "How do I debug?"

```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Database
make shell-db
SELECT * FROM users;

# Backend shell
make shell-backend
node --version
```

---

## 🚨 Common Issues

### Port 80 already in use

**This is already fixed!** The project uses port 8080 by default.

If you need to change it again:

```bash
# Edit docker-compose.yml
ports:
  - "3080:80"  # Change 8080 to any available port

# Update vite.config.js
hmr: {
  clientPort: 3080  // Match your chosen port
}
```

### HMR not working

Check `frontend/vite.config.js`:
```javascript
server: {
  hmr: {
    clientPort: 8080  // Should match nginx port
  }
}
```

### Database connection error

```bash
# Check if postgres is healthy
docker compose ps

# View postgres logs
docker compose logs postgres

# Wait for postgres to start (health check can take 30s)
```

---

## 📞 Support

For questions or issues:
1. Check this document
2. Read the specific doc in `docs/`
3. Check the code (it's well-commented!)
4. Ask your teammates (collaboration is key!)

---

**Built with ❤️ for the 42 Transcendence project**
