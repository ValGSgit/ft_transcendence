# 🔐 OAuth Setup Guide

Complete guide for configuring Google and GitHub OAuth authentication.

## ⚠️ Critical Information

**OAuth providers DO NOT support private IP addresses!**

❌ **Won't work:**
- `http://10.13.200.87:3000/...`
- `http://192.168.1.100:3000/...`
- `http://172.16.0.1:3000/...`

✅ **Will work:**
- `http://localhost:3000/...` (development)
- `http://127.0.0.1:3000/...` (development)
- `https://yourdomain.com/...` (production)

## 🚀 Quick Fix for Your Current Error

### 1. Update OAuth App Callback URLs

You need to update the callback URLs in both Google Cloud Console and GitHub:

**Current (Wrong):**
```
http://10.13.200.87:3000/api/auth/google/callback
http://10.13.200.87:3000/api/auth/github/callback
```

**Change to:**
```
http://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/github/callback
```

### 2. Follow Steps Below

---

## 🌐 Google OAuth Setup

### Step 1: Access Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project or create a new one
3. Navigate to: **APIs & Services** → **Credentials**

### Step 2: Configure OAuth Consent Screen

1. Click **OAuth consent screen** in the sidebar
2. Choose **External** (for testing) or **Internal** (for G Suite/Workspace)
3. Fill in:
   - **App name:** Transcendence
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Add test users (for External apps):
   - Add your Gmail addresses
6. Click **Save and Continue**

### Step 3: Create OAuth Client ID

1. Go back to **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Configure:

   **Name:** Transcendence Development
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5173
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/google/callback
   ```

5. Click **Create**
6. Copy your **Client ID** and **Client Secret**

### Step 4: Update Environment Variables

Edit `backend/.env.development`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

## 🐙 GitHub OAuth Setup

### Step 1: Create OAuth App

1. Go to: https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**

### Step 2: Configure Application

Fill in:

**Application name:** Transcendence Development

**Homepage URL:**
```
http://localhost:5173
```

**Application description:** (optional)
```
Transcendence - Social Gaming Platform
```

**Authorization callback URL:**
```
http://localhost:3000/api/auth/github/callback
```

### Step 3: Get Credentials

1. Click **Register application**
2. Copy your **Client ID**
3. Click **Generate a new client secret**
4. Copy your **Client Secret** (you won't be able to see it again!)

### Step 4: Update Environment Variables

Edit `backend/.env.development`:

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

---

## 🔄 Testing OAuth

### 1. Start Backend

```bash
cd backend
npm run dev
```

Wait for:
```
✓ Registering Google OAuth strategy
✓ Registering GitHub OAuth strategy
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Login Flow

1. Go to: http://localhost:5173
2. Click **Login**
3. Choose **Sign in with Google** or **Sign in with GitHub**
4. Authorize the app
5. You should be redirected back and logged in

---

## 🌍 Production Setup

For production deployment with a real domain:

### 1. Update OAuth Apps

**Google Cloud Console:**
- Add your domain to Authorized JavaScript origins:
  ```
  https://yourdomain.com
  ```
- Add callback URL:
  ```
  https://yourdomain.com/api/auth/google/callback
  ```

**GitHub OAuth App:**
- Create a new OAuth app for production OR update existing
- Homepage URL: `https://yourdomain.com`
- Callback URL: `https://yourdomain.com/api/auth/github/callback`

### 2. Update Production Environment

Edit `.env.production`:

```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
FRONTEND_URL=https://yourdomain.com
```

---

## 🐛 Troubleshooting

### Error: "device_id and device_name are required for private IP"

**Cause:** Using private IP address (10.x.x.x, 192.168.x.x, 172.16-31.x.x)

**Solution:** 
- Use `localhost` or `127.0.0.1` for development
- Use public domain for production
- Update callback URLs in Google Cloud Console

### Error: "redirect_uri is not associated with this application"

**Cause:** Callback URL mismatch between your app and GitHub OAuth app settings

**Solution:**
1. Go to: https://github.com/settings/developers
2. Click your OAuth app
3. Verify **Authorization callback URL** matches exactly:
   ```
   http://localhost:3000/api/auth/github/callback
   ```
4. Update if needed
5. Click **Update application**

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured or missing scopes

**Solution:**
1. Configure OAuth consent screen in Google Cloud Console
2. Add required scopes (userinfo.email, userinfo.profile)
3. Add yourself as a test user for External apps

### OAuth redirects but doesn't log in

**Check:**
1. Backend console for errors
2. Network tab in browser DevTools
3. Verify environment variables loaded:
   ```bash
   cd backend
   node -e "import('./src/config/passport.js')"
   ```

### "OAuth not configured" in backend logs

**Cause:** Missing or incorrect environment variables

**Solution:**
1. Verify `.env` file exists in backend folder
2. Check client ID and secret are set:
   ```bash
   cd backend
   grep GOOGLE_CLIENT_ID .env
   grep GITHUB_CLIENT_ID .env
   ```
3. Restart backend after changing `.env`

---

## 📱 Network Access Considerations

### VirtualBox NAT Network

If you're using VirtualBox with NAT networking:

**Problem:** Other devices can't access your app via private IP

**Solutions:**

1. **Use Port Forwarding (Recommended for OAuth):**
   - Keep using localhost inside VM
   - Access from host: `http://localhost:3000`
   - OAuth works because it uses localhost

2. **Switch to Bridged Adapter:**
   - VM gets real network IP (e.g., 192.168.1.x)
   - You'll need to create new OAuth apps for that IP
   - Still won't work because it's a private IP!

3. **Use ngrok (Best for testing from phone):**
   ```bash
   # Install ngrok
   snap install ngrok
   
   # Tunnel backend
   ngrok http 3000
   
   # You'll get: https://abc123.ngrok.io
   # Update OAuth apps with this URL
   ```

### Accessing from Phone on Same Network

**The Issue:**
- Your phone can't reach localhost on your computer
- Private IPs don't work with OAuth
- Need a solution that gives public URL

**Best Solution: ngrok**

```bash
# Terminal 1: Backend tunnel
ngrok http 3000
# Copy the https URL (e.g., https://abc123.ngrok.io)

# Terminal 2: Frontend tunnel  
ngrok http 5173
# Copy the https URL

# Update OAuth apps with ngrok backend URL
# Update frontend/.env.development.local:
VITE_API_URL=https://abc123.ngrok.io
VITE_WS_URL=https://abc123.ngrok.io

# Access frontend ngrok URL from phone
```

---

## 📋 Environment Files Summary

### Development (backend/.env.development)
```env
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
FRONTEND_URL=http://localhost:5173
```

### Production (.env.production)
```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
FRONTEND_URL=https://yourdomain.com
```

---

## ✅ Checklist

Before testing OAuth:

- [ ] OAuth apps created (Google and/or GitHub)
- [ ] Callback URLs use `localhost` (not private IP)
- [ ] Callback URLs match exactly in OAuth app settings
- [ ] Client ID and Secret copied to `.env` file
- [ ] Backend restarted after `.env` changes
- [ ] Frontend configured with correct API URL
- [ ] Testing from same machine (or using ngrok for remote)

---

## 🔗 Useful Links

- **Google Cloud Console:** https://console.cloud.google.com/
- **GitHub OAuth Apps:** https://github.com/settings/developers
- **ngrok:** https://ngrok.com/
- **OAuth 2.0 Playground:** https://developers.google.com/oauthplayground/

---

**Need help?** Check backend logs for detailed error messages.
