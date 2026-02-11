#!/bin/bash

# ============================================================================
# OAuth Configuration Quick Fix
# ============================================================================

echo "🔐 OAuth Configuration Quick Fix"
echo "================================"
echo ""
echo "Your OAuth apps are currently configured with PRIVATE IP addresses,"
echo "which Google and GitHub don't allow. Here's how to fix it:"
echo ""

echo "📋 STEP 1: Update Google OAuth App"
echo "-----------------------------------"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Find your OAuth 2.0 Client ID"
echo "3. Click Edit (pencil icon)"
echo "4. Under 'Authorized redirect URIs', REMOVE:"
echo "   ❌ http://10.13.200.87:3000/api/auth/google/callback"
echo ""
echo "5. ADD this instead:"
echo "   ✅ http://localhost:3000/api/auth/google/callback"
echo ""
echo "6. Also add to 'Authorized JavaScript origins':"
echo "   ✅ http://localhost:3000"
echo "   ✅ http://localhost:5173"
echo ""
echo "7. Click SAVE"
echo ""
read -p "Press Enter when you've updated Google OAuth..."

echo ""
echo "📋 STEP 2: Update GitHub OAuth App"
echo "-----------------------------------"
echo "1. Go to: https://github.com/settings/developers"
echo "2. Click on your OAuth App"
echo "3. Update 'Authorization callback URL' from:"
echo "   ❌ http://10.13.200.87:3000/api/auth/github/callback"
echo ""
echo "4. To:"
echo "   ✅ http://localhost:3000/api/auth/github/callback"
echo ""
echo "5. Update 'Homepage URL' to:"
echo "   ✅ http://localhost:5173"
echo ""
echo "6. Click 'Update application'"
echo ""
read -p "Press Enter when you've updated GitHub OAuth..."

echo ""
echo "📋 STEP 3: Copy environment file"
echo "-----------------------------------"
echo "Copying .env.development to backend/.env..."

if [ -f "backend/.env.development" ]; then
    cp backend/.env.development backend/.env
    echo "✅ Environment file copied"
else
    echo "❌ backend/.env.development not found"
    exit 1
fi

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📚 For detailed instructions, see: OAUTH_SETUP.md"
echo ""
echo "🧪 Test OAuth by:"
echo "  1. cd backend && npm run dev"
echo "  2. In another terminal: cd frontend && npm run dev"
echo "  3. Go to http://localhost:5173 and click login"
echo ""
