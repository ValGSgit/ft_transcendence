# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Test It Works
```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Transcendence backend is running",
  "timestamp": "2024-...",
  "version": "1.0.0"
}
```

## 📚 Next Steps

### Create Your First User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@example.com",
    "password": "SecurePass123"
  }'
```

### Start an AI Game
```bash
# Use the token from registration
curl -X POST http://localhost:3000/api/game \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAI": true, "aiDifficulty": "medium"}'
```

### Connect via WebSocket (JavaScript)
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Start AI game
  socket.emit('game:ai:start', { difficulty: 'medium' });
});

socket.on('game:started', (data) => {
  console.log('Game started:', data);
});

socket.on('game:ai:move', (data) => {
  console.log('AI moved:', data.move);
});
```

## 🎮 Frontend Integration

### Angular (Port 4200)
The backend is pre-configured for Angular on port 4200.

### Vue (Port 5173)
The backend is pre-configured for Vue on port 5173.

Both frameworks can use the same API endpoints and WebSocket connection.

## 🔧 Configuration (Optional)

Create a `.env` file:
```bash
cp .env.example .env
```

Edit as needed:
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 📖 Documentation

- **README.md** - Complete API documentation
- **IMPLEMENTATION.md** - Implementation details
- **test.sh** - Comprehensive test suite

## 🧪 Run Tests

```bash
chmod +x test.sh
./test.sh
```

## 🎯 Key Features Ready to Use

- ✅ User Authentication (JWT)
- ✅ Friend System
- ✅ Real-time Chat
- ✅ AI Pong Game (Easy/Medium/Hard)
- ✅ Leaderboard
- ✅ WebSocket Support

## 🔗 Important Endpoints

- Health: `GET /api/health`
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Create AI Game: `POST /api/game`
- Leaderboard: `GET /api/game/leaderboard`

See **README.md** for complete API documentation.

## 💡 Development Mode

For auto-restart on file changes:
```bash
npm run dev
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Can't connect from frontend?**
- Check CORS origins in `src/config/index.js`
- Ensure frontend is running on 4200 (Angular) or 5173 (Vue)

**Authentication errors?**
- Check JWT token is included: `Authorization: Bearer <token>`
- Token expires after 24 hours by default

## 🎉 You're Ready!

Your backend is now running with:
- Authentication
- Social features
- AI gaming
- Real-time updates

Happy coding! 🚀
