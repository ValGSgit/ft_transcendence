# Transcendence - Login & OAuth Setup Complete ✅

## What's Been Fixed

### 1. **Database Persistence** ✅
- Changed from in-memory SQLite to file-based storage
- Database now saves at `backend/data/transcendence.db`
- Your registered users will persist between server restarts

### 2. **Login System** ✅
- Now supports login with **email OR username**
- Improved error messages
- Better validation

### 3. **Two-Factor Authentication (2FA)** ✅
- TOTP-based 2FA using authenticator apps
- QR code generation for easy setup
- Endpoints:
  - `POST /api/auth/2fa/setup` - Generate QR code
  - `POST /api/auth/2fa/verify` - Enable 2FA
  - `POST /api/auth/2fa/disable` - Disable 2FA

### 4. **OAuth Integration** ✅
- **Google OAuth** - Replaced 42 login
- **GitHub OAuth** - Additional login option
- Automatic account creation on first OAuth login
- Secure token-based authentication flow

## How to Use

### Regular Login (Email/Password)
1. Go to http://localhost:5173/login
2. Enter your **email or username**
3. Enter your password
4. Click "Sign In"

### Register New Account
1. Go to http://localhost:5173/register
2. Fill in username, email, and password
3. Accept terms
4. Click "Create Account"

### OAuth Login (Google/GitHub)
1. Go to login or register page
2. Click "Continue with Google" or "Continue with GitHub"
3. Authorize the application
4. You'll be redirected back and logged in automatically

**Note:** OAuth requires setup - see `OAUTH_SETUP.md` for instructions

### Enable 2FA (Optional)
1. Login to your account
2. Go to Settings (once implemented in UI)
3. Enable 2FA
4. Scan QR code with Google Authenticator or similar app
5. Enter code to verify
6. From now on, login will require your 2FA code

## Testing the Login

### Test Account Creation
```bash
# 1. Register at: http://localhost:5173/register
Username: testuser
Email: test@example.com
Password: TestPass123

# 2. Login at: http://localhost:5173/login
Email/Username: test@example.com (or testuser)
Password: TestPass123
```

### Verify Database
```bash
# Check that database file exists
ls -lh backend/data/transcendence.db

# View database contents (requires sqlite3)
sqlite3 backend/data/transcendence.db "SELECT * FROM users;"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (supports 2FA)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### 2FA
- `POST /api/auth/2fa/setup` - Initialize 2FA setup
- `POST /api/auth/2fa/verify` - Verify and enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA

### OAuth
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback

## Environment Setup

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database
DATABASE_PATH=./data/transcendence.db

# OAuth (Optional - see OAUTH_SETUP.md)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## Current Status

✅ **Working:**
- User registration
- Email/Username login
- Password hashing (bcrypt)
- JWT token authentication
- Token refresh
- Database persistence
- 2FA setup and verification
- OAuth integration (Google & GitHub)

✅ **Ready to Use:**
- All authentication features
- User can register and login
- Access to all website features
- Optional 2FA security
- Optional OAuth login (once configured)

## Next Steps

1. **Test Login Flow**
   - Register a new account
   - Verify login works with email
   - Verify login works with username
   - Explore the website features

2. **Optional: Setup OAuth**
   - Follow instructions in `OAUTH_SETUP.md`
   - Configure Google/GitHub OAuth credentials
   - Test OAuth login flow

3. **Optional: Enable 2FA**
   - Login to your account
   - Navigate to settings
   - Enable 2FA for added security

## Server Status

Both servers are running:
- **Backend:** http://localhost:3000 ✅
- **Frontend:** http://localhost:5173 ✅
- **Database:** File-based SQLite ✅

You can now register and login to access the full website! 🎉
