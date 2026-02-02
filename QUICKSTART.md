# ⚡ Quick Setup Guide

## Get Started in 5 Minutes

### ✅ Prerequisites

```bash
node --version  # Should be 18.0.0+
npm --version   # Should be 9.0.0+
git --version   # Any recent version
```

Don't have Node.js? Download from: https://nodejs.org/

---

## 🚀 Option 1: Quick Development Setup (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd transcendence

# 2. Install all dependencies (backend + frontend)
make install

# 3. Start both servers with hot reload
make dev
```

**That's it!** Both servers are now running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health

---

## 🐳 Option 2: Docker (Even Faster!)

```bash
# 1. Clone
git clone <your-repo-url>
cd transcendence

# 2. Build and start containers
make docker-build
make docker-up
```

**Done!** Access at same URLs as above.

---

## 🎮 Your First Steps

### 1. Create an Account

**Option A: Standard Registration**
1. Go to http://localhost:5173/register
2. Fill in:
   - Username (3-20 chars, alphanumeric + underscore)
   - Email (valid email address)
   - Password (min 8 chars, uppercase, lowercase, number)
3. Accept terms
4. Click "Create Account"
5. ✅ You're logged in!

**Option B: OAuth (Google/GitHub)**
1. Go to http://localhost:5173/login
2. Click "Continue with Google" or "Continue with GitHub"
3. Authorize the app
4. ✅ Account created and logged in!

> **Note**: OAuth requires setup. See [OAUTH_SETUP.md](OAUTH_SETUP.md) for details.

### 2. Play vs AI

1. Click "Game" or "Play vs AI"
2. Choose difficulty:
   - **Easy**: Good for beginners
   - **Medium**: Balanced challenge
   - **Hard**: Expert level
3. Controls:
   - **W/S** or **Arrow Up/Down**: Move paddle
   - **ESC**: Pause
4. First to 5 points wins!

### 3. Challenge a Friend

1. Search for friends using search bar
2. Send friend request
3. Once accepted, click "Challenge" on their profile
4. Play real-time multiplayer Pong!

### 4. Enable 2FA (Optional but Recommended)

1. Go to Settings → Security
2. Click "Enable 2FA"
3. Scan QR code with Google Authenticator or Authy
4. Enter 6-digit code to verify
5. Save backup codes
6. ✅ Account secured with 2FA!

---

## 🛠️ Troubleshooting

### Port Already in Use?

**Backend (port 3000):**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

**Frontend (port 5173):**
```bash
lsof -ti:5173 | xargs kill -9
```

### Dependencies Not Installing?

```bash
# Clean everything and start fresh
make clean
make install
```

### Database Issues?

```bash
# Reset database (WARNING: deletes all data)
rm -rf backend/data/transcendence.db

# Restart backend - will recreate schema
cd backend && npm run dev
```

### OAuth Not Working?

1. Check `backend/.env` has OAuth credentials
2. Verify redirect URLs match exactly
3. See full setup guide: [OAUTH_SETUP.md](OAUTH_SETUP.md)

### Tests Failing?

```bash
# Backend tests
cd backend && npm test

# Clear cache and retry
cd backend && npx jest --clearCache
npm test
```

---

## 📋 Available Commands

### Quick Commands (from root directory)

```bash
make help           # Show all available commands
make install        # Install all dependencies
make dev            # Start dev servers (hot reload)
make test           # Run all tests
make test-coverage  # Run tests with coverage
make build          # Build for production
make clean          # Remove node_modules
```

### Docker Commands

```bash
make docker-build   # Build Docker images
make docker-up      # Start containers
make docker-down    # Stop containers
make docker-logs    # View logs
make docker-clean   # Remove containers and volumes
```

### Individual Server Commands

**Backend:**
```bash
cd backend
npm run dev         # Development with watch mode
npm run start       # Production mode
npm test            # Run tests
npm test -- --watch # Watch mode
```

**Frontend:**
```bash
cd frontend
npm run dev         # Development with HMR
npm run build       # Production build
npm run preview     # Preview production build
```

---

## 🎯 Development Workflow

### Day-to-Day Development

```bash
# Morning: Start servers
make dev

# Make changes to backend or frontend
# Servers auto-reload on file changes

# Before committing:
make test           # Ensure tests pass
git add .
git commit -m "Your message"
git push
```

### Viewing Logs

**Backend logs:**
```bash
# Logs appear in terminal where you ran 'make dev'
# Or run backend separately:
cd backend && npm run dev
```

**Docker logs:**
```bash
make docker-logs
# Or specific service:
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📚 Next Steps

### Learn More

- **[README.md](README.md)** - Full project documentation
- **[TESTING.md](TESTING.md)** - Testing guide
- **[LOGIN_FIXED.md](LOGIN_FIXED.md)** - Authentication details
- **[OAUTH_SETUP.md](OAUTH_SETUP.md)** - OAuth configuration
- **[backend/README.md](backend/README.md)** - Backend API docs

### Add Features

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run tests: `make test`
5. Commit and push
6. Open Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Production Deployment

Ready to deploy? See deployment section in [README.md](README.md#production-deployment).

---

## 🆘 Need Help?

1. Check this guide
2. Read relevant `.md` files
3. Check [GitHub Issues](your-repo/issues)
4. Open new issue with details

---

**Happy coding! 🎮**
make dev            # Start dev servers
make docker-up      # Start Docker
make docker-down    # Stop Docker
make test          # Run tests
```

## Next Steps

1. Read the full [README.md](README.md)
2. Check [MODULE_COMPLIANCE.md](MODULE_COMPLIANCE.md) 
3. Review [CONTRIBUTING.md](CONTRIBUTING.md) if developing
4. See backend API docs: http://localhost:3000/api/docs (if implemented)

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Review module implementations in code
- Open an issue on GitHub
- Contact team on Discord

---

**Ready to code? Run `make dev` and start building! 🎮**
