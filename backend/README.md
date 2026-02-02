# Transcendence Backend v1.0.0

A comprehensive, production-ready backend for the Transcendence project featuring authentication, social features, real-time gaming with AI opponents, and WebSocket support.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Password hashing** using bcrypt
- **Token refresh mechanism** for seamless user experience
- **Secure password requirements** (configurable)

### User Management
- User registration and login
- Profile management (avatar, bio, status)
- Online/offline status tracking
- User search functionality
- User statistics and game history

### Social Features (Facebook-like)
- **Friend System**:
  - Send/accept/decline friend requests
  - View friends list
  - Unfriend functionality
  - Friend online status
  
- **Blocking System**:
  - Block/unblock users
  - Prevent interactions with blocked users

### Real-time Chat
- **Direct Messages**: Private conversations between friends
- **Chat Rooms**: Group channels for multiple users
- **Message History**: Persistent message storage
- **Real-time Updates**: Instant message delivery via WebSocket
- **Typing Indicators**: See when users are typing
- **Message Search**: Find messages across conversations

### Game System
- **Multiplayer**: Play against other users
- **Matchmaking**: Queue-based player matching (ready for implementation)
- **Game Statistics**: Track wins, losses, scores, and streaks
- **Leaderboard**: Global rankings based on performance
- **Match History**: View past games and scores

### Real-time Features (Socket.io)
- Game state synchronization
- Live chat messaging
- Online status updates
- Game invitations
- Push notifications
- Friend request notifications

### Security
- **Helmet.js**: Security headers
- **Rate Limiting**: Prevent abuse (100 requests per 15 minutes)
- **CORS**: Configured for Angular and Vue frontends
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Parameterized queries

### Database
- **In-memory SQLite**: Zero-configuration, perfect for development
- **Automatic Schema**: Tables created on startup
- **Foreign Keys**: Data integrity enforcement
- **Indexes**: Optimized queries (can be added as needed)

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🔧 Installation

1. **Navigate to the backend directory**:
   ```bash
   cd /path/to/transcendence/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file** (optional):
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (optional - defaults work out of the box):
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=development
   ```

## 🏃 Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout (requires authentication)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update own profile
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id/stats` - Get user statistics

### Friends
- `POST /api/friends/requests` - Send friend request
- `GET /api/friends/requests/pending` - Get pending requests
- `POST /api/friends/requests/:id/accept` - Accept request
- `POST /api/friends/requests/:id/decline` - Decline request
- `GET /api/friends` - Get friends list
- `DELETE /api/friends/:id` - Unfriend user
- `POST /api/friends/block` - Block user
- `DELETE /api/friends/block/:id` - Unblock user
- `GET /api/friends/blocked` - Get blocked users

### Chat
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create new chat room
- `GET /api/chat/rooms/:id/messages` - Get room messages
- `POST /api/chat/rooms/:id/messages` - Send message
- `GET /api/chat/direct/:userId` - Get/create direct message room
- `GET /api/chat/messages/search?q=query` - Search messages

### Game
- `GET /api/game/config` - Get game configuration
- `POST /api/game` - Create new game
- `GET /api/game/:id` - Get game details
- `POST /api/game/:id/start` - Start game
- `POST /api/game/:id/score` - Update score
- `POST /api/game/:id/end` - End game
- `GET /api/game/history` - Get match history
- `GET /api/game/leaderboard` - Get leaderboard

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Health
- `GET /api/health` - Health check endpoint

## 🎮 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Game Events
- `game:matchmaking:join` - Join matchmaking queue
- `game:ai:start` - Start game vs AI
- `game:update` - Send game state update
- `game:ai:move` - Receive AI move
- `game:score` - Update score
- `game:end` - End game
- `game:started` - Game started notification
- `game:ended` - Game ended notification

### Chat Events
- `chat:join` - Join chat room
- `chat:leave` - Leave chat room
- `chat:message` - Send/receive message
- `chat:typing` - Typing indicator

### User Events
- `user:online` - User went online
- `user:offline` - User went offline

### Friend Events
- `friend:request:sent` - Friend request sent
- `friend:request:received` - Friend request received
- `friend:request:accepted` - Friend request accepted

### Notification Events
- `notification` - Receive notification
- `notification:read` - Mark notification as read

## 🤖 AI Opponent

The AI service provides intelligent Pong gameplay with three difficulty levels:

### Easy
- Reaction Time: 300ms
- Accuracy: 60%
- Speed: 60% of max

### Medium
- Reaction Time: 150ms
- Accuracy: 80%
- Speed: 80% of max

### Hard
- Reaction Time: 50ms
- Accuracy: 95%
- Speed: 100% of max

### Using AI in Games

**Via WebSocket**:
```javascript
socket.emit('game:ai:start', { difficulty: 'medium' });

socket.on('game:ai:move', (data) => {
  console.log('AI move:', data.move);
  // Apply AI paddle movement
});
```

**Via REST API**:
```javascript
// Create AI game
POST /api/game
{
  "isAI": true,
  "aiDifficulty": "medium"
}
```

## 🗄️ Database Schema

### Users
- id, username, email, password (hashed)
- avatar, bio, status
- online status, last_seen
- timestamps

### Friends / Friend Requests
- sender_id, receiver_id, status
- Friendship tracking

### Chat Rooms / Messages
- Room metadata, members
- Messages with sender, content, timestamp

### Games
- player1_id, player2_id
- Scores, winner
- AI game flag and difficulty
- Game status and timestamps

### User Stats
- games_played, games_won, games_lost
- total_score, highest_score
- win_streak, current_streak

### Notifications
- user_id, type, title, content
- read status, metadata

## 🔐 Security Best Practices

1. **Change JWT Secret**: Update `JWT_SECRET` in production
2. **Use HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Adjust rate limits based on your needs
4. **Input Validation**: All inputs are validated
5. **Password Requirements**: Configurable in `config/index.js`

## 🎯 Configuration

Edit `src/config/index.js` to customize:

- JWT expiration times
- CORS origins
- Rate limiting
- Password requirements
- Game parameters
- AI difficulty settings

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }  // optional
}
```

## 🧪 Testing

Example user registration:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@example.com",
    "password": "SecurePass123"
  }'
```

Example login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player1@example.com",
    "password": "SecurePass123"
  }'
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # SQLite database setup
│   │   └── index.js      # App configuration
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── friendController.js
│   │   ├── chatController.js
│   │   ├── gameController.js
│   │   └── notificationController.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # Authentication middleware
│   │   └── errorHandler.js
│   ├── models/           # Database models
│   │   ├── User.js
│   │   ├── Friend.js
│   │   ├── Chat.js
│   │   ├── Game.js
│   │   └── Notification.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── friends.js
│   │   ├── chat.js
│   │   ├── game.js
│   │   ├── notifications.js
│   │   └── index.js
│   ├── services/         # Business logic
│   │   ├── aiService.js      # AI opponent logic
│   │   └── socketService.js  # WebSocket handlers
│   ├── utils/            # Utility functions
│   │   ├── auth.js       # JWT & bcrypt utils
│   │   ├── validation.js # Input validation
│   │   └── response.js   # Response formatting
│   └── index.js          # Main server file
├── package.json
├── .env.example
└── README.md
```

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Enable HTTPS
4. Consider using PostgreSQL instead of SQLite
5. Set up proper logging
6. Configure firewalls
7. Use a process manager (PM2, systemd)

## 🤝 Frontend Integration

This backend works seamlessly with both Angular and Vue frontends:

- CORS configured for `localhost:4200` (Angular) and `localhost:5173` (Vue)
- API endpoints match the constants defined in `unified-frontend/core/constants/index.ts`
- WebSocket support for real-time features

## 📝 License

MIT

## 👥 Contributors

Created for the Transcendence project

## 🐛 Troubleshooting

### Port already in use
```bash
# Change PORT in .env or kill the process
lsof -ti:3000 | xargs kill -9
```

### Database errors
The in-memory database is recreated on each server restart. For persistence, modify `src/config/database.js` to use a file-based database.

### CORS errors
Ensure your frontend URL is listed in `config.cors.origins` in `src/config/index.js`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [JWT Best Practices](https://jwt.io/introduction)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
