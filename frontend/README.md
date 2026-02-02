# Frontend - Transcendence

Vue 3 frontend for the Transcendence social gaming platform.

## 🎨 Features

- **Modern Vue 3** with Composition API
- **Vite** for lightning-fast development
- **Pinia** state management
- **Vue Router** for navigation
- **Socket.io** for real-time features
- **Axios** for HTTP requests
- **Three.js** for 3D Pong game
- **Responsive design** for all devices

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/                  # Static assets
│   └── avatars/            # Default avatar images
├── src/
│   ├── assets/             # Images, fonts, icons
│   ├── components/         # Reusable Vue components
│   │   ├── HelloWorld.vue
│   │   └── PostCard.vue
│   ├── router/             # Vue Router configuration
│   │   └── index.js        # Routes and navigation guards
│   ├── services/           # External services
│   │   ├── api.js          # Axios HTTP client
│   │   └── socket.js       # Socket.io client
│   ├── stores/             # Pinia state stores
│   │   ├── auth.js         # Authentication state
│   │   ├── chat.js         # Chat state
│   │   └── social.js       # Social features state
│   ├── views/              # Page components
│   │   ├── AuthCallback.vue    # OAuth redirect handler
│   │   ├── Feed.vue            # Social feed
│   │   ├── Friends.vue         # Friends management
│   │   ├── Game.vue            # Pong game
│   │   ├── Home.vue            # Landing page
│   │   ├── Login.vue           # Login page
│   │   ├── Messages.vue        # Chat interface
│   │   ├── NotFound.vue        # 404 page
│   │   ├── Profile.vue         # User profile
│   │   ├── Register.vue        # Registration page
│   │   └── Settings.vue        # User settings
│   ├── App.vue             # Root component
│   ├── main.js             # Application entry point
│   └── style.css           # Global styles
├── .env                    # Environment variables
├── .env.example            # Environment template
├── index.html              # HTML entry point
├── package.json            # Dependencies
└── vite.config.js          # Vite configuration
```

## 🗂️ Key Components

### Views (Pages)

#### `Login.vue`
- Email/username login
- OAuth buttons (Google, GitHub)
- 2FA code input (when enabled)
- Redirects to `/feed` on success

#### `Register.vue`
- User registration form
- Password validation
- OAuth registration options
- Auto-login on success

#### `AuthCallback.vue`
- Handles OAuth redirects
- Extracts tokens from query params
- Fetches user profile
- Redirects to feed

#### `Game.vue`
- Three.js Pong game
- AI opponent selection
- Multiplayer matchmaking
- Real-time game state sync

#### `Feed.vue`
- Social media feed
- Create posts
- Like and comment
- Real-time updates

#### `Messages.vue`
- Chat interface
- Direct messages
- Group chats
- Typing indicators
- Message history

#### `Friends.vue`
- Friends list with online status
- Pending requests
- Send/accept/decline requests
- Block/unblock users

#### `Profile.vue`
- User profile display
- Edit own profile
- View game statistics
- Match history

#### `Settings.vue`
- Account settings
- 2FA management
- Password change
- Privacy settings

### Services

#### `api.js`
Axios HTTP client with:
- Base URL configuration
- JWT token interceptor
- Automatic token refresh
- Error handling
- Request/response logging

**Usage:**
```javascript
import api from '@/services/api'

// GET request
const users = await api.get('/users')

// POST request
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
})

// Authenticated request (automatic token)
const profile = await api.get('/users/me')
```

#### `socket.js`
Socket.io client with:
- Automatic connection
- Authentication
- Event handlers
- Reconnection logic

**Usage:**
```javascript
import socket from '@/services/socket'

// Emit event
socket.emit('join_game', { gameId: 123 })

// Listen for events
socket.on('game_update', (data) => {
  console.log('Game updated:', data)
})

// Remove listener
socket.off('game_update')
```

### Stores (Pinia)

#### `auth.js`
Authentication state management:
```javascript
// State
{
  user: null,              // Current user object
  token: null,             // JWT access token
  refreshToken: null,      // JWT refresh token
  isAuthenticated: false,  // Auth status
  requires2FA: false       // 2FA required flag
}

// Actions
login(credentials)        // Login user
register(userData)        // Register new user
logout()                  // Logout user
fetchCurrentUser()        // Get current user
setTokens(access, refresh) // Set JWT tokens
```

**Usage:**
```vue
<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

async function handleLogin() {
  try {
    await authStore.login({
      email: 'user@example.com',
      password: 'password123'
    })
    router.push('/feed')
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
```

#### `chat.js`
Chat state management:
```javascript
// State
{
  rooms: [],              // Chat rooms
  currentRoom: null,      // Active room
  messages: {},           // Messages by room ID
  typingUsers: new Set()  // Users currently typing
}

// Actions
fetchRooms()             // Get user's rooms
fetchMessages(roomId)    // Get room messages
sendMessage(roomId, text) // Send message
setCurrentRoom(room)     // Set active room
addMessage(message)      // Add new message
```

#### `social.js`
Social features state:
```javascript
// State
{
  friends: [],            // User's friends
  requests: [],           // Pending friend requests
  posts: [],              // Social feed posts
  notifications: []       // User notifications
}

// Actions
fetchFriends()           // Get friends list
sendFriendRequest(userId) // Send request
acceptRequest(id)        // Accept request
declineRequest(id)       // Decline request
blockUser(userId)        // Block user
```

## 🎮 Three.js Game

The Pong game is built with Three.js and includes:

- **3D rendering** with WebGL
- **Physics engine** for realistic ball movement
- **Paddle controls** (keyboard)
- **AI opponent** with difficulty levels
- **Multiplayer sync** via Socket.io
- **Score tracking**
- **Pause/resume**
- **Game state management**

## 🔐 Authentication Flow

### Standard Login
1. User enters email/username + password
2. Frontend sends POST to `/api/auth/login`
3. Backend validates credentials
4. If 2FA enabled, prompt for code
5. Backend returns JWT tokens + user object
6. Frontend stores tokens in localStorage
7. Redirect to `/feed`

### OAuth Login (Google/GitHub)
1. User clicks "Continue with Google/GitHub"
2. Frontend redirects to backend OAuth endpoint
3. User authorizes on provider's site
4. Provider redirects to backend callback
5. Backend creates/finds user, generates JWT
6. Backend redirects to `/auth/callback?token=xxx&refreshToken=yyy`
7. Frontend extracts tokens, fetches user
8. Redirect to `/feed`

### Token Refresh
1. Access token expires (24h default)
2. API request returns 401 Unauthorized
3. Axios interceptor catches error
4. Sends refresh token to `/api/auth/refresh`
5. Backend validates refresh token
6. Returns new access token
7. Retry original request
8. If refresh fails, logout user

## 🎨 Styling

Global styles in `style.css`:
- CSS custom properties (variables)
- Responsive breakpoints
- Utility classes
- Component-specific styles in `<style scoped>`

**Example:**
```css
/* Custom properties */
:root {
  --primary-color: #00f7ff;
  --bg-dark: #0a0f1e;
  --text-light: #ffffff;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
```

## 🌐 Environment Variables

Create `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000

# WebSocket URL
VITE_WS_URL=http://localhost:3000

# Optional: Enable debug mode
VITE_DEBUG=true
```

**Access in code:**
```javascript
const API_URL = import.meta.env.VITE_API_URL
```

## 🔧 Development

### Hot Module Replacement (HMR)
Vite provides instant HMR:
- Changes reflected immediately
- Component state preserved
- No full page reload

### Vue Devtools
Install Vue Devtools browser extension:
- Inspect component hierarchy
- View component state
- Debug Pinia stores
- Track events

### Debugging

**Console Logging:**
```javascript
console.log('Debug:', data)
```

**Vue Devtools:**
- Components tab: inspect component tree
- Pinia tab: view store state
- Timeline tab: track events

**Network Tab:**
- View API requests
- Check response data
- Monitor WebSocket messages

## 📦 Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

**Output:**
- Creates `dist/` directory
- Minified and optimized
- Code splitting for routes
- Asset hashing for caching

**Deploy:**
- Serve `dist/` folder with static server
- Configure server for SPA routing
- Set environment variables for production API

## 🧪 Testing

Tests coming soon! Planned:
- Unit tests with Vitest
- Component tests with Vue Test Utils
- E2E tests with Playwright

## 🚀 Performance Optimization

- **Code splitting**: Routes lazy-loaded
- **Asset optimization**: Images compressed
- **Bundle size**: Tree-shaking unused code
- **Caching**: Service worker (planned)
- **Lazy loading**: Images and components

## 📖 Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Guide](https://vitejs.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Three.js](https://threejs.org/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 🤝 Contributing

1. Follow Vue 3 Composition API patterns
2. Use `<script setup>` syntax
3. Keep components focused and reusable
4. Add proper TypeScript types (coming soon)
5. Write descriptive commit messages

## 📝 License

Part of 42 School curriculum - Transcendence project
