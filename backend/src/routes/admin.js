import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { errorResponse, successResponse } from '../utils/response.js';

const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};

// Get simplified architecture diagram
router.get('/architecture', authenticate, requireAdmin, (req, res) => {
  const architecture = `graph TB
    User[👤 User Browser]
    
    subgraph Docker["🐳 Docker Network (transcendence)"]
        Nginx[🌐 Nginx :80<br/>Reverse Proxy]
        
        subgraph Frontend["Frontend Container"]
            Vite[⚡ Vite Dev Server<br/>:5173<br/>Vue 3 + Three.js]
        end
        
        subgraph Backend["Backend Container"]
            Express[🚀 Express.js<br/>:3000<br/>Node 20]
            Socket[📡 Socket.io<br/>WebSocket]
        end
        
        subgraph Database["Database Container"]
            Postgres[(🐘 PostgreSQL<br/>:5432)]
        end
    end
    
    subgraph Services["Core Services"]
        Auth[🔐 Auth<br/>JWT + OAuth + 2FA]
        Game[🎮 Game Engine<br/>Alpaca Farm]
        Chat[💬 Chat<br/>Real-time]
        Social[👥 Social<br/>Friends + Feed]
    end
    
    User --> Nginx
    Nginx -->|"/ (HTTP + WS)"| Vite
    Nginx -->|"/api"| Express
    Nginx -->|"/socket.io"| Socket
    
    Express --> Auth
    Express --> Game
    Express --> Chat
    Express --> Social
    
    Express --> Postgres
    Socket --> Postgres
    
    Auth --> Postgres
    Game --> Postgres
    Chat --> Postgres
    Social --> Postgres
    
    Socket -.->|Real-time updates| Vite
    
    classDef userClass fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef proxyClass fill:#50E3C2,stroke:#2E8B57,stroke-width:2px,color:#000
    classDef frontendClass fill:#F5A623,stroke:#D68910,stroke-width:2px,color:#000
    classDef backendClass fill:#7ED321,stroke:#5FA319,stroke-width:2px,color:#000
    classDef dbClass fill:#E74C3C,stroke:#C0392B,stroke-width:2px,color:#fff
    classDef serviceClass fill:#9B59B6,stroke:#7D3C98,stroke-width:2px,color:#fff
    
    class User userClass
    class Nginx proxyClass
    class Vite frontendClass
    class Express,Socket backendClass
    class Postgres dbClass
    class Auth,Game,Chat,Social serviceClass
    
    style Docker fill:#f9f9f9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style Frontend fill:#fff7e6,stroke:#ff9800,stroke-width:2px
    style Backend fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    style Database fill:#ffebee,stroke:#f44336,stroke-width:2px
    style Services fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px`;

  successResponse(res, { diagram: architecture });
});

// Get step-bystep flow diagram
router.get('/flow', authenticate, requireAdmin, (req, res) => {
  const flowDiagram = `sequenceDiagram
    participant User
    participant Browser
    participant Nginx
    participant Frontend
    participant Express
    participant AuthCtrl
    participant UserModel
    participant Database
    participant OAuth
    participant SocketIO
    participant GameCtrl
    
    Note over User,GameCtrl: 1. USER REGISTRATION FLOW
    
    User->>Browser: Navigate to /register
    Browser->>Frontend: Load Register.vue
    Frontend->>User: Display registration form
    User->>Frontend: Fill form (username, email, password)
    Frontend->>Frontend: Validate inputs (client-side)
    Frontend->>Express: POST /api/auth/register
    Express->>AuthCtrl: register(req, res)
    AuthCtrl->>AuthCtrl: Validate inputs
    AuthCtrl->>AuthCtrl: Hash password (bcrypt)
    AuthCtrl->>UserModel: create(username, email, hashedPassword)
    UserModel->>Database: INSERT INTO users
    Database-->>UserModel: User created
    UserModel-->>AuthCtrl: User data
    AuthCtrl->>AuthCtrl: Generate JWT (access + refresh)
    AuthCtrl-->>Express: {user, accessToken, refreshToken}
    Express-->>Frontend: 201 Created + tokens
    Frontend->>Frontend: Store tokens in Pinia auth store
    Frontend->>Browser: Redirect to /game
    Browser->>User: Show Alpaca Farm
    
    Note over User,GameCtrl: 2. OAUTH LOGIN FLOW (Google/GitHub)
    
    User->>Browser: Navigate to /login
    Browser->>Frontend: Load Login.vue
    Frontend->>User: Display login form + OAuth buttons
    User->>Frontend: Click "Login with Google"
    Frontend->>Express: GET /api/auth/google
    Express->>OAuth: Redirect to Google OAuth
    OAuth->>User: Google consent screen
    User->>OAuth: Approve access
    OAuth->>Express: GET /api/auth/google/callback?code=...
    Express->>AuthCtrl: Passport OAuth callback
    AuthCtrl->>OAuth: Exchange code for user info
    OAuth-->>AuthCtrl: {email, name, googleId}
    AuthCtrl->>UserModel: findByOAuthId(googleId)
    alt User exists
        UserModel-->>AuthCtrl: Existing user
    else New user
        AuthCtrl->>UserModel: create(email, name, googleId)
        UserModel->>Database: INSERT INTO users
        Database-->>UserModel: User created
        UserModel-->>AuthCtrl: New user
    end
    AuthCtrl->>AuthCtrl: Generate JWT tokens
    AuthCtrl-->>Express: Redirect with tokens
    Express-->>Frontend: Redirect to /auth/callback?token=...
    Frontend->>Frontend: Extract & store tokens
    Frontend->>Browser: Redirect to /game
    
    Note over User,GameCtrl: 3. TWO-FACTOR AUTHENTICATION (2FA) SETUP
    
    User->>Browser: Navigate to /settings
    Browser->>Frontend: Load Settings.vue
    Frontend->>Express: GET /api/user/profile (with JWT)
    Express->>AuthCtrl: Verify JWT
    AuthCtrl->>UserModel: findById(userId)
    UserModel->>Database: SELECT * FROM users WHERE id=?
    Database-->>UserModel: User data
    UserModel-->>Express: User (2fa_enabled: false)
    Express-->>Frontend: User profile
    User->>Frontend: Click "Enable 2FA"
    Frontend->>Express: POST /api/auth/2fa/enable
    Express->>AuthCtrl: enable2FA(req, res)
    AuthCtrl->>AuthCtrl: Generate TOTP secret (speakeasy)
    AuthCtrl->>AuthCtrl: Generate QR code
    AuthCtrl->>UserModel: update2FASecret(userId, secret)
    UserModel->>Database: UPDATE users SET two_fa_secret=?
    Database-->>UserModel: Updated
    AuthCtrl-->>Frontend: {qrCode, secret}
    Frontend->>User: Display QR code
    User->>User: Scan with authenticator app
    User->>Frontend: Enter 6-digit code
    Frontend->>Express: POST /api/auth/2fa/verify {token}
    Express->>AuthCtrl: verify2FA(req, res)
    AuthCtrl->>AuthCtrl: Verify TOTP token
    AuthCtrl->>UserModel: enable2FA(userId)
    UserModel->>Database: UPDATE users SET two_fa_enabled=1
    Database-->>UserModel: Updated
    AuthCtrl-->>Frontend: {success: true}
    Frontend->>User: "2FA enabled successfully!"
    
    Note over User,GameCtrl: 4. LOGIN WITH 2FA
    
    User->>Frontend: Enter username + password
    Frontend->>Express: POST /api/auth/login
    Express->>AuthCtrl: login(req, res)
    AuthCtrl->>UserModel: findByUsername(username)
    UserModel->>Database: SELECT * FROM users
    Database-->>UserModel: User data
    UserModel-->>AuthCtrl: User (2fa_enabled: true)
    AuthCtrl->>AuthCtrl: Verify password (bcrypt.compare)
    alt Password valid & 2FA enabled
        AuthCtrl-->>Frontend: {requires2FA: true, email: "u***@email.com"}
        Frontend->>User: Show 2FA code input
        User->>Frontend: Enter 6-digit code
        Frontend->>Express: POST /api/auth/2fa/verify
        Express->>AuthCtrl: verify2FA(req, res)
        AuthCtrl->>AuthCtrl: Verify TOTP token
        AuthCtrl->>AuthCtrl: Generate JWT tokens
        AuthCtrl-->>Frontend: {accessToken, refreshToken}
        Frontend->>Frontend: Store tokens
        Frontend->>User: Login successful
    else Invalid credentials
        AuthCtrl-->>Frontend: 401 Unauthorized
        Frontend->>User: "Invalid credentials"
    end
    
    Note over User,GameCtrl: 5. GAME START FLOW (Alpaca Farm)
    
    User->>Browser: Navigate to /game
    Browser->>Frontend: Load Game.vue
    Frontend->>Frontend: Initialize Three.js scene
    Frontend->>Express: GET /api/game/config
    Express->>GameCtrl: getConfig(req, res)
    GameCtrl-->>Frontend: {settings, assets, initialState}
    Frontend->>Frontend: Load 3D models & textures
    Frontend->>SocketIO: Connect WebSocket
    SocketIO-->>Frontend: Connection established
    Frontend->>SocketIO: Emit 'game:join' {userId}
    SocketIO->>GameCtrl: handleGameJoin(socket, data)
    GameCtrl->>GameModel: findActiveGame(userId)
    alt Active game exists
        GameModel->>Database: SELECT * FROM games WHERE user_id=? AND status='active'
        Database-->>GameModel: Game state
        GameModel-->>GameCtrl: Existing game
        GameCtrl->>SocketIO: Emit 'game:resume' {gameState}
        SocketIO-->>Frontend: Resume game
    else No active game
        GameCtrl->>GameModel: createGame(userId)
        GameModel->>Database: INSERT INTO games
        Database-->>GameModel: New game ID
        GameModel-->>GameCtrl: New game
        GameCtrl->>SocketIO: Emit 'game:start' {gameState}
        SocketIO-->>Frontend: Start new game
    end
    Frontend->>User: Render Alpaca Farm world
    
    Note over User,GameCtrl: 6. REAL-TIME GAME ACTIONS
    
    User->>Frontend: Click action (feed alpaca, build fence)
    Frontend->>Frontend: Update local state (optimistic)
    Frontend->>SocketIO: Emit 'game:action' {action, data}
    SocketIO->>GameCtrl: handleGameAction(socket, data)
    GameCtrl->>GameCtrl: Validate action
    GameCtrl->>GameModel: updateGameState(gameId, newState)
    GameModel->>Database: UPDATE games SET state=?, updated_at=NOW()
    Database-->>GameModel: Updated
    GameModel-->>GameCtrl: New state
    GameCtrl->>SocketIO: Emit 'game:update' {updatedState}
    SocketIO-->>Frontend: Receive update
    Frontend->>Frontend: Sync state
    Frontend->>User: Render updated scene
    
    Note over User,GameCtrl: 7. CHAT SYSTEM FLOW
    
    User->>Browser: Navigate to /messages
    Browser->>Frontend: Load Messages.vue
    Frontend->>Express: GET /api/chat/rooms
    Express->>AuthCtrl: Verify JWT
    Express->>ChatCtrl: getRooms(req, res)
    ChatCtrl->>ChatModel: getUserRooms(userId)
    ChatModel->>Database: SELECT * FROM chat_rooms WHERE user_id=?
    Database-->>ChatModel: Room list
    ChatModel-->>ChatCtrl: Rooms
    ChatCtrl-->>Frontend: {rooms: [...]}
    Frontend->>User: Display chat room list
    User->>Frontend: Select room
    Frontend->>Express: GET /api/chat/rooms/:roomId/messages
    Express->>ChatCtrl: getRoomMessages(req, res)
    ChatCtrl->>ChatCtrl: Check room membership
    ChatCtrl->>ChatModel: getMessages(roomId)
    ChatModel->>Database: SELECT * FROM messages WHERE room_id=?
    Database-->>ChatModel: Messages
    ChatModel-->>ChatCtrl: Message history
    ChatCtrl-->>Frontend: {messages: [...]}
    Frontend->>SocketIO: Join room: 'chat:join' {roomId}
    SocketIO->>ChatCtrl: handleJoinRoom(socket, roomId)
    ChatCtrl->>SocketIO: socket.join(roomId)
    SocketIO-->>Frontend: Joined room
    User->>Frontend: Type & send message
    Frontend->>SocketIO: Emit 'chat:message' {roomId, content}
    SocketIO->>ChatCtrl: handleMessage(socket, data)
    ChatCtrl->>ChatCtrl: Sanitize & validate
    ChatCtrl->>ChatModel: createMessage(roomId, userId, content)
    ChatModel->>Database: INSERT INTO messages
    Database-->>ChatModel: New message
    ChatModel-->>ChatCtrl: Message data
    ChatCtrl->>SocketIO: Broadcast to room 'chat:message'
    SocketIO-->>Frontend: All users in room receive message
    Frontend->>User: Display new message in real-time
    
    Note over User,GameCtrl: 8. SOCIAL FEATURES (Friends, Posts, Feed)
    
    User->>Browser: Navigate to /friends
    Browser->>Frontend: Load Friends.vue
    Frontend->>Express: GET /api/friends
    Express->>FriendCtrl: getFriends(req, res)
    FriendCtrl->>UserModel: getFriends(userId)
    UserModel->>Database: SELECT * FROM friends WHERE user_id=? AND status='accepted'
    Database-->>UserModel: Friend list
    UserModel-->>Frontend: {friends: [...]}
    User->>Frontend: Search for user
    Frontend->>Express: GET /api/users/search?q=username
    Express->>UserModel: searchUsers(query)
    UserModel->>Database: SELECT * FROM users WHERE username LIKE ?
    Database-->>UserModel: Search results
    UserModel-->>Frontend: {users: [...]}
    User->>Frontend: Click "Add Friend"
    Frontend->>Express: POST /api/friends/request {recipientId}
    Express->>FriendCtrl: sendRequest(req, res)
    FriendCtrl->>UserModel: createFriendRequest(senderId, recipientId)
    UserModel->>Database: INSERT INTO friends (status='pending')
    Database-->>UserModel: Request created
    UserModel-->>Frontend: {request: {...}}
    Frontend->>SocketIO: Emit 'notification:friend_request'
    SocketIO-->>Browser: Recipient gets real-time notification
    
    Note over User,GameCtrl: 9. PASSWORD RESET FLOW
    
    User->>Frontend: Click "Forgot Password?"
    Frontend->>User: Enter email address
    User->>Frontend: Submit email
    Frontend->>Express: POST /api/auth/password-reset-request
    Express->>AuthCtrl: requestPasswordReset(req, res)
    AuthCtrl->>UserModel: findByEmail(email)
    UserModel->>Database: SELECT * FROM users WHERE email=?
    Database-->>UserModel: User found
    UserModel-->>AuthCtrl: User data
    AuthCtrl->>AuthCtrl: Generate reset token (JWT, 15min exp)
    AuthCtrl->>Database: Store reset token hash
    alt Development mode
        AuthCtrl-->>Frontend: {message: "Check email", token: "xyz"}
        Frontend->>User: Display token (dev only)
    else Production mode
        AuthCtrl->>AuthCtrl: Send email (future: SendGrid/Mailgun)
        AuthCtrl-->>Frontend: {message: "Check your email"}
    end
    User->>Frontend: Enter reset token + new password
    Frontend->>Express: POST /api/auth/password-reset {token, newPassword}
    Express->>AuthCtrl: resetPassword(req, res)
    AuthCtrl->>AuthCtrl: Verify token
    AuthCtrl->>AuthCtrl: Hash new password
    AuthCtrl->>UserModel: updatePassword(userId, hashedPassword)
    UserModel->>Database: UPDATE users SET password=?, reset_token=NULL
    Database-->>UserModel: Updated
    AuthCtrl-->>Frontend: {success: true}
    Frontend->>User: "Password reset successful"
    
    Note over User,GameCtrl: 10. TOKEN REFRESH FLOW
    
    Frontend->>Frontend: Access token expired (JWT check)
    Frontend->>Express: POST /api/auth/refresh {refreshToken}
    Express->>AuthCtrl: refreshToken(req, res)
    AuthCtrl->>AuthCtrl: Verify refresh token type
    AuthCtrl->>AuthCtrl: Decode token
    AuthCtrl->>UserModel: findById(userId)
    UserModel->>Database: SELECT * FROM users WHERE id=?
    Database-->>UserModel: User data
    UserModel-->>AuthCtrl: User
    AuthCtrl->>AuthCtrl: Generate new access token
    AuthCtrl-->>Frontend: {accessToken}
    Frontend->>Frontend: Update stored token
    Frontend->>Express: Retry original request
    
    Note over User,GameCtrl: 11. LOGOUT FLOW
    
    User->>Frontend: Click "Logout"
    Frontend->>SocketIO: Disconnect WebSocket
    SocketIO->>GameCtrl: handleDisconnect(socket)
    GameCtrl->>GameModel: saveGameState(userId)
    GameModel->>Database: UPDATE games SET state=?, status='paused'
    Frontend->>Express: POST /api/auth/logout
    Express->>AuthCtrl: logout(req, res)
    AuthCtrl->>Database: Invalidate refresh token (optional)
    AuthCtrl-->>Frontend: {success: true}
    Frontend->>Frontend: Clear Pinia stores
    Frontend->>Frontend: Remove tokens from storage
    Frontend->>Browser: Redirect to /login
    Browser->>User: Show login page`;

  successResponse(res, { diagram: flowDiagram });
});

// Get system statistics (admin only)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const db = (await import('../config/database.js')).default;
    
    // Get counts from database
    const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').get();
    const onlineCount = await db.prepare('SELECT COUNT(*) as count FROM users WHERE online = TRUE').get();
    const postCount = await db.prepare('SELECT COUNT(*) as count FROM posts').get();
    const messageCount = await db.prepare('SELECT COUNT(*) as count FROM messages').get();
    const gameCount = await db.prepare('SELECT COUNT(*) as count FROM games').get();
    const chatRooms = await db.prepare('SELECT COUNT(*) as count FROM chat_rooms').get();
    
    // Get today's posts
    const postsToday = await db.prepare(`
      SELECT COUNT(*) as count FROM posts 
      WHERE created_at >= CURRENT_DATE
    `).get();
    
    // Get active games
    const activeGames = await db.prepare(`
      SELECT COUNT(*) as count FROM games 
      WHERE status = 'in_progress'
    `).get();
    
    const stats = {
      totalUsers: userCount.count,
      onlineUsers: onlineCount.count,
      totalPosts: postCount.count,
      postsToday: postsToday.count,
      totalMessages: messageCount.count,
      chatRooms: chatRooms.count,
      totalGames: gameCount.count,
      activeGames: activeGames.count
    };
    
    return successResponse(res, { stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    return errorResponse(res, 'Failed to fetch stats', 500, error.message);
  }
});

// Get all posts (admin only)
router.get('/posts', authenticate, requireAdmin, async (req, res) => {
  try {
    const Post = (await import('../models/Post.js')).default;
    const posts = await Post.getAllForAdmin();
    return successResponse(res, { posts });
  } catch (error) {
    console.error('Admin get posts error:', error);
    return errorResponse(res, 'Failed to fetch posts', 500);
  }
});

// Get system information
router.get('/system', authenticate, requireAdmin, async (req, res) => {
  try {
    const db = (await import('../config/database.js')).default;
    
    // Get table count
    const tables = await db.prepare(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `).get().catch(() => ({ count: 13 }));
    
    const systemInfo = {
      dbTables: tables.count || 13,
      dbSize: 'N/A',
      dbConnections: 0,
      uptime: formatUptime(process.uptime()),
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      cpu: 'N/A'
    };
    
    return successResponse(res, { system: systemInfo });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch system info', 500);
  }
});

// Get activity logs
router.get('/logs', authenticate, requireAdmin, async (req, res) => {
  try {
    // This would ideally query a logs table
    // For now, return empty array
    const logs = [];
    return successResponse(res, { logs });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch logs', 500);
  }
});

// Update user (admin only)
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;
    const db = (await import('../config/database.js')).default;
    
    await db.prepare(`
      UPDATE users SET is_admin = ? WHERE id = ?
    `).run(is_admin, id);
    
    return successResponse(res, { message: 'User updated' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return errorResponse(res, 'Failed to update user', 500);
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const User = (await import('../models/User.js')).default;
    
    // Don't allow deleting yourself
    if (parseInt(id) === req.user.id) {
      return errorResponse(res, 'Cannot delete yourself', 400);
    }
    
    await User.delete(id);
    return successResponse(res, { message: 'User deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return errorResponse(res, 'Failed to delete user', 500);
  }
});

// Export all data (admin only)
router.get('/export', authenticate, requireAdmin, async (req, res) => {
  try {
    const db = (await import('../config/database.js')).default;
    
    const users = await db.prepare('SELECT * FROM users').all();
    const posts = await db.prepare('SELECT * FROM posts').all();
    const games = await db.prepare('SELECT * FROM games').all();
    
    const exportData = {
      users,
      posts,
      games,
      exportedAt: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=transcendence-export-${Date.now()}.json`);
    return res.json(exportData);
  } catch (error) {
    console.error('Admin export error:', error);
    return errorResponse(res, 'Failed to export data', 500);
  }
});

// Helper function
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default router;
