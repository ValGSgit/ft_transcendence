# Transcendence

*Full-stack social gaming platform — 42 School Project*

## Description

**Transcendence** is a web application combining an interactive Alpaca Farm game with comprehensive social networking features. Built with Vue 3, Express.js, and Three.js, it features secure authentication (including 2FA and OAuth), real-time chat, and a dual-database architecture (SQLite for development, PostgreSQL for production).

### Key Features

- **Alpaca Farm Game**: Three.js-based open world with farm building, alpaca management, and a shop system
- **Social Feed**: Posts with likes, comments, and visibility controls
- **Real-time Chat**: Socket.io-powered direct messages and group channels
- **Friends System**: Requests, blocking, online status, friend suggestions
- **Advanced Auth**: JWT + OAuth 2.0 (Google, GitHub) + TOTP 2FA
- **Dual Database**: SQLite for dev, PostgreSQL 16 for production
- **Docker**: Containerized dev and production environments with Nginx and SSL

## 👥 Team

**Product Owner**: vagarcia  
**Project Type**: 42 School ft_transcendence  
**Target Modules**: 35 points (16+ modules)

### Roles
- **Product Owner**: Project vision, backlog management, module strategy
- **Lead Developer**: Architecture, code review, deployment
- **Developer**: Full-stack implementation, testing
- **DevOps**: Docker, CI/CD, database management

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker & Docker Compose (for containerized deployment)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd transcendence

# Install all dependencies (backend + frontend)
make install

# Start development servers
make dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/api/health

### Docker (Recommended for Production)

```bash
# Development
docker compose up --build

# Production (with PostgreSQL, Nginx, SSL)
docker compose -f docker-compose.prod.yml up --build -d
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for SSL and production setup.
See [docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md) for OAuth provider configuration.

## Technical Stack

### Frontend
- **Framework**: Vue 3.5+ (Composition API)
- **Build Tool**: Vite 5.4+
- **3D Graphics**: Three.js 0.182+ (Alpaca Farm engine)
- **State Management**: Pinia
- **Routing**: Vue Router 4.6+
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.21+
- **Authentication**: Passport.js (OAuth), jsonwebtoken (JWT), bcrypt (hashing), speakeasy (TOTP 2FA)
- **Database**: 
  - **Development**: better-sqlite3 (SQLite, zero-config)
  - **Production**: PostgreSQL 16 via `pg` driver
  - **Adapter**: Custom SQL translation layer (auto-converts `?` → `$1`, `LIKE` → `ILIKE`, etc.)
- **Real-time**: Socket.io 4.8+
- **Security**: Helmet.js, CORS, rate limiting, express-validator
- **Testing**: Jest 29+, Supertest (>80% coverage target)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx (SSL termination, WebSocket proxy)
- **SSL**: Certbot / DuckDNS

### Architecture Decisions

| Choice | Rationale |
|--------|-----------|
| **Vue 3** | Composition API, excellent Vite integration, Pinia state management |
| **Dual Database** | SQLite for instant dev setup, PostgreSQL for production reliability |
| **Socket.io** | Built-in rooms for chat, auto-fallback, easy Express integration |
| **Three.js** | WebGL rendering for the Alpaca Farm 3D experience |

## 🗄️ Database Schema

### Tables

```sql
-- Users with authentication and profile
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT DEFAULT '/avatars/default.png',
  bio TEXT DEFAULT 'Hey there!',
  status TEXT DEFAULT 'offline',
  online BOOLEAN DEFAULT 0,
  two_factor_enabled BOOLEAN DEFAULT 0,
  two_factor_secret TEXT,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User game statistics
CREATE TABLE user_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Friend relationships
CREATE TABLE friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT DEFAULT 'accepted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Friend requests
CREATE TABLE friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blocked users
CREATE TABLE blocked_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Game matches
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player1_id INTEGER NOT NULL,
  player2_id INTEGER,
  is_ai BOOLEAN DEFAULT 0,
  ai_difficulty TEXT,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id INTEGER,
  status TEXT DEFAULT 'pending',
  started_at DATETIME,
  finished_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player1_id) REFERENCES users(id),
  FOREIGN KEY (player2_id) REFERENCES users(id),
  FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Chat rooms
CREATE TABLE chat_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  is_direct BOOLEAN DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Chat messages
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Relationships

- **Users ↔ Friends**: Many-to-many through `friends` table
- **Users ↔ Games**: One user can play many games
- **Users ↔ Messages**: One user can send many messages
- **Chat Rooms ↔ Messages**: One room contains many messages
- **Users ↔ Notifications**: One user can have many notifications

## 📋 Features List

### ✅ Implemented Features

#### Authentication & Security
- [x] User registration with validation
- [x] Login with email OR username
- [x] JWT authentication (access + refresh tokens)
- [x] Bcrypt password hashing (10 rounds)
- [x] TOTP-based Two-Factor Authentication (2FA)
- [x] OAuth 2.0 (Google & GitHub)
- [x] Secure password requirements
- [x] Rate limiting (100 req/15min)
- [x] CORS protection
- [x] Helmet.js security headers

#### User Management
- [x] User profiles (avatar, bio, status)
- [x] Online/offline status tracking
- [x] User search functionality
- [x] Profile updates
- [x] Password change

#### Social Features
- [x] Friend system (send/accept/decline requests)
- [x] View friends list with online status
- [x] Unfriend functionality
- [x] Block/unblock users
- [x] Real-time friend notifications

#### Chat System
- [x] Direct messages between users
- [x] Chat rooms/channels
- [x] Message history with pagination
- [x] Real-time message delivery (Socket.io)
- [x] Typing indicators
- [x] Message search

#### Game System
- [x] Pong game creation
- [x] AI opponents (Easy, Medium, Hard)
- [x] Real-time multiplayer matches
- [x] Game state synchronization
- [x] Score tracking and updates
- [x] Match history
- [x] Global leaderboard
- [x] User statistics (wins, losses, streaks)

#### Database & Storage
- [x] File-based SQLite at `backend/data/transcendence.db`
- [x] 10 database tables with relationships
- [x] Foreign key constraints
- [x] Automatic schema creation
- [x] Data persistence between restarts

#### Real-time Features (Socket.io)
- [x] WebSocket authentication
- [x] Game state synchronization
- [x] Live chat delivery
- [x] Online/offline broadcasts
- [x] Friend request updates
- [x] Notification delivery
- [x] User connection tracking

#### API & Documentation
- [x] RESTful API design
- [x] Consistent response formatting
- [x] Comprehensive error handling
- [x] Input validation
- [x] Request logging (dev mode)
- [x] API documentation

### 🔨 In Progress

- [ ] Advanced game customization
- [ ] Tournament system
- [ ] Spectator mode
- [ ] Enhanced mobile responsiveness

### 🎯 Planned Features

- [ ] Email verification
- [ ] Password reset via email
- [ ] Voice chat
- [ ] Game replays
- [ ] Achievement system
- [ ] Custom game modes

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login (supports 2FA) | No |
| POST | `/api/auth/logout` | Logout current user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### OAuth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/github` | Initiate GitHub OAuth |
| GET | `/api/auth/github/callback` | GitHub OAuth callback |

### Two-Factor Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/2fa/setup` | Generate 2FA QR code | Yes |
| POST | `/api/auth/2fa/verify` | Verify and enable 2FA | Yes |
| POST | `/api/auth/2fa/disable` | Disable 2FA | Yes |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Search users | Yes |
| GET | `/api/users/:id` | Get user profile | Yes |
| PUT | `/api/users/:id` | Update user profile | Yes (own profile) |
| GET | `/api/users/:id/stats` | Get user statistics | Yes |

### Friends
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/friends` | List friends | Yes |
| POST | `/api/friends/request` | Send friend request | Yes |
| GET | `/api/friends/requests` | Get pending requests | Yes |
| POST | `/api/friends/accept/:id` | Accept friend request | Yes |
| POST | `/api/friends/decline/:id` | Decline friend request | Yes |
| DELETE | `/api/friends/:id` | Remove friend | Yes |
| POST | `/api/friends/block/:id` | Block user | Yes |
| POST | `/api/friends/unblock/:id` | Unblock user | Yes |
| GET | `/api/friends/blocked` | List blocked users | Yes |

### Chat
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat/rooms` | List user's chat rooms | Yes |
| POST | `/api/chat/rooms` | Create chat room | Yes |
| GET | `/api/chat/rooms/:id/messages` | Get room messages | Yes |
| POST | `/api/chat/rooms/:id/messages` | Send message | Yes |
| GET | `/api/chat/direct/:userId` | Get or create DM room | Yes |
| GET | `/api/chat/search` | Search messages | Yes |

### Game
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/game/create` | Create new game | Yes |
| GET | `/api/game/:id` | Get game details | Yes |
| POST | `/api/game/:id/join` | Join game | Yes |
| POST | `/api/game/:id/leave` | Leave/abandon game | Yes |
| GET | `/api/game/history` | Get user's game history | Yes |
| GET | `/api/game/leaderboard` | Get global leaderboard | Yes |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

### Health
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | API health check | No |

## 📂 Project Structure

```
transcendence/
├── backend/
│   ├── data/
│   │   └── transcendence.db         # SQLite database (auto-created)
│   ├── src/
│   │   ├── __tests__/              # Test files
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── auth.test.js
│   │   │   ├── response.test.js
│   │   │   ├── user.test.js
│   │   │   └── validation.test.js
│   │   ├── config/
│   │   │   ├── database.js         # Database setup & schema
│   │   │   ├── index.js            # App configuration
│   │   │   └── passport.js         # OAuth strategies
│   │   ├── controllers/            # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── friendController.js
│   │   │   ├── gameController.js
│   │   │   ├── notificationController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   └── errorHandler.js     # Error handling
│   │   ├── models/                 # Database operations
│   │   │   ├── Chat.js
│   │   │   ├── Friend.js
│   │   │   ├── Game.js
│   │   │   ├── Notification.js
│   │   │   └── User.js
│   │   ├── routes/                 # API routes
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── friends.js
│   │   │   ├── game.js
│   │   │   ├── index.js
│   │   │   ├── notifications.js
│   │   │   └── users.js
│   │   ├── services/               # Business logic
│   │   │   ├── aiService.js        # AI opponent
│   │   │   └── socketService.js    # WebSocket handlers
│   │   ├── utils/
│   │   │   ├── auth.js             # JWT & bcrypt utilities
│   │   │   ├── response.js         # Response formatting
│   │   │   └── validation.js       # Input validation
│   │   └── index.js                # Server entry point
│   ├── .env                        # Environment variables
│   ├── .env.example                # Environment template
│   ├── Dockerfile                  # Container image
│   ├── jest.config.js              # Test configuration
│   └── package.json                # Dependencies
│
├── frontend/
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── assets/                 # Images, fonts
│   │   ├── components/             # Vue components
│   │   │   ├── HelloWorld.vue
│   │   │   └── PostCard.vue
│   │   ├── router/
│   │   │   └── index.js            # Vue Router config
│   │   ├── services/
│   │   │   ├── api.js              # Axios HTTP client
│   │   │   └── socket.js           # Socket.io client
│   │   ├── stores/                 # Pinia state stores
│   │   │   ├── auth.js             # Authentication state
│   │   │   ├── chat.js             # Chat state
│   │   │   └── social.js           # Social features state
│   │   ├── views/                  # Page components
│   │   │   ├── AuthCallback.vue    # OAuth callback
│   │   │   ├── Feed.vue
│   │   │   ├── Friends.vue
│   │   │   ├── Game.vue
│   │   │   ├── Home.vue
│   │   │   ├── Login.vue
│   │   │   ├── Messages.vue
│   │   │   ├── NotFound.vue
│   │   │   ├── Profile.vue
│   │   │   ├── Register.vue
│   │   │   └── Settings.vue
│   │   ├── App.vue                 # Root component
│   │   ├── main.js                 # App entry point
│   │   └── style.css               # Global styles
│   ├── .env                        # Environment variables
│   ├── Dockerfile                  # Container image
│   ├── index.html                  # HTML entry
│   ├── package.json                # Dependencies
│   └── vite.config.js              # Vite configuration
│
├── docs/                           # Documentation
│   ├── AUTHENTICATION.md           # Auth setup guide
│   ├── DATABASE_MIGRATION.md       # SQLite → PostgreSQL migration
│   ├── DEPLOYMENT.md               # Production deployment & SSL
│   ├── OAUTH_SETUP.md              # OAuth configuration
│   ├── SECURITY.md                 # Security best practices
│   ├── TESTING.md                  # Testing guide
│   └── transubject.pdf             # 42 School subject PDF
│
├── nginx/                          # Nginx configs
│   └── nginx.conf                  # Production reverse proxy
│
├── scripts/                        # Utility scripts
│   ├── add-admin-field.js          # DB migration for admin system
│   ├── backup-db.sh                # PostgreSQL backup
│   ├── make-admin.sh               # CLI admin user tool
│   ├── restore-db.sh               # PostgreSQL restore
│   └── test-db.sh                  # DB connection test
│
├── .gitignore
├── BACKLOG.md                      # Project backlog & sprint plans
├── CONTRIBUTING.md                 # Contribution guidelines
├── docker-compose.yml              # Dev containers
├── docker-compose.prod.yml         # Production containers
├── Makefile                        # Build automation
├── package.json                    # Root dependencies
└── README.md                       # This file
```
## 🎮 Usage Guide

### Creating an Account

**Standard Registration:**
1. Navigate to http://localhost:5173/register
2. Enter username (3-20 chars, alphanumeric + underscore)
3. Enter valid email address
4. Create password (min 8 chars, uppercase, lowercase, number)
5. Accept terms and click "Create Account"
6. You'll be automatically logged in!

**OAuth Registration:**
1. Go to http://localhost:5173/login or /register
2. Click "Continue with Google" or "Continue with GitHub"
3. Authorize the application
4. Account created and logged in automatically

### Logging In

**Email/Username Login:**
- Login with either your email OR username
- Enter your password
- If 2FA enabled, enter your 6-digit code
- Click "Sign In"

**OAuth Login:**
- Click "Continue with Google" or "Continue with GitHub"
- Authorize and you're in!

### Setting Up 2FA (Optional)

1. Login to your account
2. Go to Settings → Security
3. Click "Enable Two-Factor Authentication"
4. Scan QR code with Google Authenticator or Authy
5. Enter verification code to confirm
6. Save backup codes in a safe place

From now on, login will require your password + 6-digit TOTP code.

### Playing Pong

**Single Player vs AI:**
1. Login and go to Game page
2. Click "Play vs AI"
3. Select difficulty:
   - **Easy**: 60% accuracy, slower reactions
   - **Medium**: 80% accuracy, moderate speed
   - **Hard**: 95% accuracy, fast reactions
4. Controls:
   - **W/S** or **Arrow Up/Down**: Move paddle
   - **ESC**: Pause game
5. First to 5 points wins

**Multiplayer:**
1. Click "Find Match" to enter matchmaking queue
2. Wait for opponent (or invite a friend)
3. Game starts when both players ready
4. Same controls as single player
5. Real-time score synchronization

### Social Features

**Managing Friends:**
1. Search users via search bar
2. Click profile to view details
3. Click "Add Friend" to send request
4. View pending requests in Friends page
5. Accept/decline incoming requests
6. Click "Unfriend" to remove from friends list
7. Block users to prevent all interactions

**Chatting:**
1. Click Messages icon
2. Select existing conversation or start new
3. Type message and press Enter
4. See typing indicators when friend is typing
5. Search messages with search bar
6. Create group chats with multiple friends

### Viewing Statistics

**Personal Stats:**
- Go to your Profile
- View games played, won, lost
- See total score and highest score
- Track current win streak

**Leaderboard:**
- Click Leaderboard tab
- View global rankings
- Filter by time period (all-time, monthly, weekly)
- See top players and their stats

## 🔧 Development

### Available Make Commands

```bash
make help          # Show all commands
make install       # Install all dependencies
make dev           # Start development servers
make test          # Run all tests
make test-coverage # Run tests with coverage report
make build         # Build for production
make docker-build  # Build Docker images
make docker-up     # Start Docker containers
make docker-down   # Stop Docker containers
make docker-logs   # View Docker logs
make clean         # Remove node_modules and build files
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# With coverage
cd backend && npm test -- --coverage

# Watch mode
cd backend && npm test -- --watch

# Specific test file
cd backend && npm test auth.test.js
```

See [TESTING.md](TESTING.md) for comprehensive testing guide.

### Environment Variables

**Backend (.env):**
```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_PATH=./data/transcendence.db

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### Production Deployment

**Option 1: Docker (Recommended)**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Option 2: PM2**
```bash
# Build frontend
cd frontend && npm run build

# Start backend with PM2
cd backend
pm2 start src/index.js --name transcendence-backend

# Serve frontend with nginx or serve static files
```

**Production Checklist:**
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure database backup strategy
- [ ] Enable HTTPS with SSL certificates
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Configure OAuth production credentials
- [ ] Enable logging and monitoring
- [ ] Set up automated backups

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[TESTING.md](TESTING.md)** - Testing guide and coverage
- **[LOGIN_FIXED.md](LOGIN_FIXED.md)** - Authentication setup
- **[OAUTH_SETUP.md](OAUTH_SETUP.md)** - OAuth configuration
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[backend/README.md](backend/README.md)** - Backend documentation
- **[backend/IMPLEMENTATION.md](backend/IMPLEMENTATION.md)** - Implementation details

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in .env
PORT=3001
```

**Dependencies won't install**
```bash
# Clean and reinstall
make clean
make install
```

**Database errors**
```bash
# Reset database (WARNING: deletes all data)
rm -rf backend/data/transcendence.db
# Restart backend - will recreate schema
```

**OAuth not working**
- Verify credentials in `backend/.env`
- Check redirect URLs match exactly
- Ensure OAuth apps are enabled in console
- See [OAUTH_SETUP.md](OAUTH_SETUP.md) for details

**Tests failing**
```bash
# Update snapshots
cd backend && npm test -- -u

# Clear Jest cache
cd backend && npx jest --clearCache
```

**Frontend build errors**
```bash
# Clear Vite cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Getting Help

1. Check existing documentation files
2. Search [GitHub Issues](your-repo/issues)
3. Open new issue with:
   - Environment details (OS, Node version)
   - Steps to reproduce
   - Error messages/logs
   - Expected vs actual behavior

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guidelines
- Testing requirements
- Pull request process
- Development workflow

### Quick Contribution Guide

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and write tests
4. Run tests: `make test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

## 📝 License

This project is part of the 42 School curriculum.

## 👤 Author

**vagarcia** - 42 School Student

## 🙏 Acknowledgments

- 42 School for the project specification
- Three.js community for 3D game examples
- Socket.io team for real-time communication
- Vue.js team for excellent framework
- All contributors and testers

---

**Made with ❤️ for 42 School**

## Resources

### Classic References

**General**:
- [MDN Web Docs](https://developer.mozilla.org/) - Web standards reference
- [Node.js Documentation](https://nodejs.org/docs/) - Official Node.js guide
- [Express.js Guide](https://expressjs.com/) - Backend framework docs

**Frontend**:
- [Vue.js 3 Documentation](https://vuejs.org/) - Official Vue guide
- [Three.js Documentation](https://threejs.org/docs/) - 3D graphics library
- [Vite Documentation](https://vitejs.dev/) - Build tool reference

**Backend**:
- [Socket.io Documentation](https://socket.io/docs/) - WebSocket library
- [JWT Introduction](https://jwt.io/introduction) - JSON Web Tokens
- [bcrypt npm](https://www.npmjs.com/package/bcrypt) - Password hashing

**Security**:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web security risks
- [Helmet.js](https://helmetjs.github.io/) - Security headers
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

**Database**:
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite for Node.js
- [SQLite Documentation](https://www.sqlite.org/docs.html)

### AI Usage

AI tools (GitHub Copilot, ChatGPT, Claude) were used to assist with:

**Code Generation (30%)**:
- Boilerplate code for API routes
- TypeScript interface definitions
- Database query builders
- Utility function implementations

**Debugging (20%)**:
- Error message interpretation
- Stack trace analysis
- Bug fix suggestions
- Performance optimization tips

**Documentation (15%)**:
- README structure
- JSDoc comments
- API documentation
- Code comments

**Learning (35%)**:
- Three.js examples and tutorials
- Socket.io best practices
- JWT authentication patterns
- Docker configuration

**Not Used For**:
- Core game logic (written manually)
- Architecture decisions (team-designed)
- Security critical code (manually reviewed)
- Final implementations (AI suggestions adapted)

All AI-generated code was reviewed, tested, and modified by team members. Core business logic and architecture were designed and implemented by the team.

## Known Limitations

- SQLite limits concurrent writes (mitigated with WAL mode)
- No horizontal scaling yet (planned: Redis for sessions)
- Mobile controls basic (planned: enhanced touch gestures)
- No voice chat (planned as bonus feature)
- Browser compatibility: Chrome/Firefox recommended

## Testing

```bash
# Run backend tests
cd backend && npm test

# Run with coverage
npm test -- --coverage
```

## License

MIT License - See LICENSE file for details

## Credits

- **42 School** for the project subject
- **Three.js Community** for excellent 3D examples
- **Vue.js Team** for the reactive framework
- **Socket.io Team** for real-time communication library

## Conclusion

transcendence demonstrates a production-ready web application with modern architecture, security best practices, and extensible design. The 35-point module implementation significantly exceeds the 14-module minimum requirement while maintaining code quality and documentation standards.

**Key Achievements**:
- ✅ Full-stack application with clear separation of concerns
- ✅ Real-time social gaming platform
- ✅ Secure authentication with 2FA and OAuth
- ✅ Dual-database architecture (SQLite/PostgreSQL)
- ✅ Comprehensive documentation and testing
- ✅ Docker containerization for dev and production
- ✅ Extensible architecture supporting 24+ modules

**Future Roadmap**:
- Implement remaining bonus modules
- Add tournament system
- Integrate blockchain for achievements
- Expand to mobile apps
- Add voice chat
- Multi-language support
