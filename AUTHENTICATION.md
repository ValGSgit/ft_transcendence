# Authentication Guide - Transcendence

Complete guide to authentication in Transcendence, including standard login, OAuth, and Two-Factor Authentication.

## 🔐 Overview

Transcendence supports multiple authentication methods:

1. **Standard Email/Password** - Traditional authentication with JWT tokens
2. **OAuth 2.0** - Login with Google or GitHub
3. **Two-Factor Authentication (2FA)** - TOTP-based additional security layer

All methods use JWT (JSON Web Tokens) for session management.

## 🎯 Authentication Methods

### 1. Standard Email/Password Authentication

**Registration:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": "/avatars/default.png",
      "bio": "Hey there!"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",  // or "username": "johndoe"
  "password": "SecurePass123!"
}
```

**Response (no 2FA):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

**Response (with 2FA enabled):**
```json
{
  "success": true,
  "message": "2FA required",
  "data": {
    "requires2FA": true,
    "userId": 1
  }
}
```

**Login with 2FA:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "totpCode": "123456"
}
```

### 2. OAuth 2.0 Authentication

#### Google OAuth

**Initiate:**
```
GET /api/auth/google
```

This redirects user to Google's authorization page.

**Callback:**
```
GET /api/auth/google/callback?code=...
```

Backend processes the OAuth code and redirects to:
```
http://localhost:5173/auth/callback?token=xxx&refreshToken=yyy
```

Frontend extracts tokens and completes login.

#### GitHub OAuth

Same flow as Google:

**Initiate:**
```
GET /api/auth/github
```

**Callback:**
```
GET /api/auth/github/callback?code=...
```

#### OAuth Setup

See [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed configuration.

**Backend Environment Variables:**
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173
```

### 3. Two-Factor Authentication (2FA)

#### Setup 2FA

**Step 1: Generate Secret and QR Code**
```http
POST /api/auth/2fa/setup
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Step 2: User Scans QR Code**
- Open Google Authenticator / Authy / 1Password
- Scan the QR code
- App generates 6-digit codes every 30 seconds

**Step 3: Verify and Enable**
```http
POST /api/auth/2fa/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

#### Login with 2FA

Once enabled, login requires both password and TOTP code:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "totpCode": "123456"
}
```

#### Disable 2FA

```http
POST /api/auth/2fa/disable
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "123456"
}
```

## 🔑 JWT Token Management

### Token Structure

**Access Token** (24h expiry):
```
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Refresh Token** (7d expiry):
```
{
  "id": 1,
  "iat": 1234567890,
  "exp": 1235172690
}
```

### Token Refresh

When access token expires:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Token Storage

**Frontend:**
- Tokens stored in `localStorage`
- Automatically included in API requests via Axios interceptor
- Cleared on logout

**Best Practices:**
- Never expose tokens in URLs
- Use HTTPS in production
- Implement token rotation
- Clear tokens on logout

## 🛡️ Security Features

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Enforced on registration and password change

### Password Hashing

- **Algorithm:** bcrypt
- **Rounds:** 10 (2^10 iterations)
- **Salt:** Unique per password (automatic with bcrypt)
- Passwords never stored in plain text

### Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Scope:** Per IP address
- Protects against brute force attacks

### CORS Protection

Only allowed origins:
- `http://localhost:4200`
- `http://localhost:5173`
- `http://127.0.0.1:4200`
- `http://127.0.0.1:5173`

### Security Headers (Helmet.js)

- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `X-XSS-Protection`: 1; mode=block
- `Strict-Transport-Security`: max-age=31536000
- Content Security Policy (CSP)

## 🔄 Authentication Flow Diagrams

### Standard Login Flow

```
User → Frontend → Backend → Database
  1. Enter credentials
  2. POST /api/auth/login
  3. Validate credentials
  4. Hash password check
  5. Generate JWT tokens
  6. Return user + tokens
  7. Store tokens
  8. Redirect to /feed
```

### OAuth Flow

```
User → Frontend → Backend → OAuth Provider → Backend → Frontend
  1. Click "Continue with Google"
  2. Redirect to /api/auth/google
  3. Redirect to Google auth
  4. User authorizes
  5. Google redirects to callback
  6. Exchange code for profile
  7. Create/find user
  8. Generate JWT tokens
  9. Redirect to frontend with tokens
  10. Extract and store tokens
  11. Fetch user profile
  12. Redirect to /feed
```

### 2FA Login Flow

```
User → Frontend → Backend
  1. Enter email + password
  2. POST /api/auth/login
  3. Validate credentials
  4. Check 2FA enabled
  5. Return requires2FA flag
  6. Show 2FA input
  7. Enter TOTP code
  8. POST /api/auth/login (with totpCode)
  9. Verify TOTP code (30s window)
  10. Return user + tokens
  11. Redirect to /feed
```

## 🚀 Frontend Integration

### Using Auth Store

```vue
<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const credentials = ref({
  email: '',
  password: '',
  totpCode: ''
})

async function login() {
  try {
    await authStore.login(credentials.value)
    
    if (authStore.requires2FA) {
      // Show 2FA input
      show2FAInput.value = true
    } else {
      // Redirect to feed
      router.push('/feed')
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
```

### Protected Routes

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/feed')
  } else {
    next()
  }
})
```

### Axios Interceptor

```javascript
// services/api.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Add token to requests
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    
    if (error.response?.status === 401 && authStore.refreshToken) {
      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: authStore.refreshToken
        })
        
        authStore.setTokens(data.token, data.refreshToken)
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${data.token}`
        return axios(error.config)
      } catch (refreshError) {
        authStore.logout()
        router.push('/login')
      }
    }
    
    return Promise.reject(error)
  }
)
```

## 🧪 Testing Authentication

### Register and Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Use token
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 2FA

```bash
# Setup 2FA (requires token)
curl -X POST http://localhost:3000/api/auth/2fa/setup \
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify 2FA (use code from authenticator app)
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'

# Login with 2FA
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "totpCode": "123456"
  }'
```

## 📝 Common Issues

### "Invalid credentials"
- Check email/username is correct
- Verify password matches registration
- Ensure account exists (try registering first)

### "2FA code invalid"
- Codes expire every 30 seconds
- Ensure device time is synchronized
- Try the next code if one fails

### "Token expired"
- Access tokens expire after 24 hours
- Frontend should auto-refresh
- If refresh token expired (7d), must login again

### OAuth "Unknown authentication strategy"
- Verify OAuth credentials in `backend/.env`
- Ensure `dotenv.config()` runs before strategy registration
- Check redirect URLs match exactly

## 🔗 Related Documentation

- [LOGIN_FIXED.md](LOGIN_FIXED.md) - Authentication setup completed
- [OAUTH_SETUP.md](OAUTH_SETUP.md) - OAuth provider configuration
- [SECURITY.md](SECURITY.md) - Security best practices
- [backend/README.md](backend/README.md) - Backend API documentation

---

**Security is paramount - always use HTTPS in production!** 🔒
