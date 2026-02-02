# OAuth Setup Guide

## Overview
The application now supports Google and GitHub OAuth authentication alongside traditional email/password login with optional 2FA.

## Features Implemented

### ✅ Backend
1. **File-based SQLite Database** - Data now persists between restarts at `./backend/data/transcendence.db`
2. **Username/Email Login** - Users can log in with either their username or email
3. **2FA (TOTP)** - Optional two-factor authentication using authenticator apps
4. **Google OAuth** - Sign in with Google account
5. **GitHub OAuth** - Sign in with GitHub account
6. **Passport.js Integration** - Secure OAuth flow handling

### ✅ Frontend
1. **2FA Support** - Code input field appears when 2FA is required
2. **OAuth Buttons** - Google and GitHub login buttons (replaced 42)
3. **OAuth Callback Handler** - Processes OAuth tokens and redirects
4. **Improved Error Handling** - Better user feedback

## Setting Up OAuth

### Google OAuth

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Enter project name → Create

3. **Enable Google+ API**
   - Navigation menu → APIs & Services → Library
   - Search for "Google+ API" → Enable

4. **Create OAuth Credentials**
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Transcendence"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
   - Click Create

5. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Update `/backend/.env`:
     ```env
     GOOGLE_CLIENT_ID=your-client-id-here
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     ```

### GitHub OAuth

1. **Go to GitHub Settings**: https://github.com/settings/developers

2. **Register New OAuth Application**
   - Click "New OAuth App"
   - Application name: "Transcendence"
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
   - Click "Register application"

3. **Generate Client Secret**
   - Click "Generate a new client secret"
   - Copy the secret immediately (shown only once)

4. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Update `/backend/.env`:
     ```env
     GITHUB_CLIENT_ID=your-client-id-here
     GITHUB_CLIENT_SECRET=your-client-secret-here
     ```

## Testing OAuth (Without Real Credentials)

For development/testing without setting up actual OAuth:

1. The application will work with traditional email/password login
2. OAuth buttons will appear but won't work until credentials are configured
3. You can skip OAuth setup and just use:
   - Email/Password registration
   - Username/Email login
   - Optional 2FA

## Login Methods

### 1. Email/Password Login
```
Email: user@example.com (or username)
Password: YourPassword123
```

### 2. Email/Password + 2FA
```
Email: user@example.com
Password: YourPassword123
2FA Code: 123456 (from authenticator app)
```

### 3. Google OAuth
- Click "Continue with Google"
- Select Google account
- Redirects back with authentication

### 4. GitHub OAuth
- Click "Continue with GitHub"
- Authorize the application
- Redirects back with authentication

## Setting Up 2FA

1. **Login to your account** using email/password
2. **Go to Settings** → Security
3. **Click "Enable 2FA"**
4. **Scan QR Code** with authenticator app (Google Authenticator, Authy, etc.)
5. **Enter verification code** to confirm
6. **Save backup codes** (if provided)

From now on, login will require both password and 2FA code.

## Database Location

The SQLite database is stored at:
```
/backend/data/transcendence.db
```

This file persists data between server restarts. To reset the database, simply delete this file.

## Current Login Status

✅ **Fixed Issues:**
- Database now persists data (file-based instead of in-memory)
- Login supports both username and email
- 2FA authentication implemented
- OAuth (Google/GitHub) integrated
- Proper error messages

✅ **You can now:**
1. Register a new account
2. Login with username OR email
3. Access all website features
4. Set up 2FA for enhanced security
5. Use Google/GitHub login (once OAuth credentials are configured)

## Next Steps

1. **Test Registration & Login**
   - Register at: http://localhost:5173/register
   - Login at: http://localhost:5173/login

2. **Optional: Configure OAuth**
   - Follow the Google/GitHub setup guides above
   - Update credentials in `/backend/.env`
   - Restart the backend server

3. **Optional: Enable 2FA**
   - Login → Settings → Enable 2FA
   - Scan QR code with authenticator app

## Troubleshooting

**Login not working?**
- Check browser console for errors
- Verify backend is running on port 3000
- Check database file exists: `backend/data/transcendence.db`

**OAuth not working?**
- Verify credentials are set in `.env`
- Check redirect URLs match exactly
- Ensure OAuth apps are enabled in Google/GitHub console

**2FA code rejected?**
- Ensure device time is synced (TOTP depends on time)
- Try the next code (codes refresh every 30 seconds)
- Verify you're entering 6 digits

## Environment Variables

Complete `.env` file for backend:

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

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```
