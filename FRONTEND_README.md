# 🦙 Alpacagram - Social Alpaca Farm Game

A modern social platform combining Facebook-like features with a 3D Alpaca farming game. Built with Vue 3, Three.js, and real-time chat capabilities.

## 🌟 Features

### Social Platform
- 📰 **News Feed** - Share text, photos, farm updates, and achievements
- 👥 **Friends System** - Send/accept friend requests, manage friends
- 💬 **Real-time Chat** - 1-on-1 messaging with typing indicators
- 🔔 **Notifications** - Stay updated on likes, comments, and friend activity
- 👤 **User Profiles** - Customizable profiles with bio, location, and avatar
- 🔍 **Search** - Find and connect with other alpaca farmers

### 3D Alpaca Farm Game
- 🦙 **Raise Alpacas** - Create and customize your own alpacas
- 🎮 **Interactive Gameplay** - WASD/Arrow keys to control, click to move
- 💰 **Collect Coins** - Explore your farm and gather resources
- 🎨 **Customization** - Change alpaca colors, adjust world settings
- 💾 **Save/Load** - Save your farm progress as JSON
- 🚪 **Visit Friends** - Load and explore friends' farms
- 📤 **Share Progress** - Post farm updates to your social feed

### Technical Features
- ⚡ **Real-time Updates** - Socket.io for instant notifications and chat
- 🔒 **Secure Authentication** - JWT tokens with auto-refresh
- 🎯 **State Management** - Pinia stores for organized data flow
- 🚀 **Fast Performance** - Vite for lightning-fast development
- ♿ **Accessible** - Semantic HTML and ARIA labels

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transcendence
   ```

2. **Install dependencies**
   
   Backend:
   ```bash
   cd backend
   npm install
   ```
   
   Frontend:
   ```bash
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   DATABASE_FILE=./database.sqlite
   ```

4. **Start the application**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🎮 How to Play

### Creating Your Farm

1. Click **"New Game"** on the start screen
2. Enter your alpaca's name and choose a color
3. Click **"Start Game"** to begin

### Controls

- **WASD** or **Arrow Keys** - Move your alpaca
- **Mouse Drag** - Rotate camera
- **Mouse Scroll** - Zoom in/out
- **Click Ground** - Walk to that location
- **Click Alpaca** - View alpaca details

### Game Features

- **Collect Coins** - Walk near golden coins to collect them
- **Add Alpacas** - Click the **+** button to add more alpacas
- **Settings** - Click ⚙️ to customize world colors and size
- **Save Game** - Click 💾 to download your farm as JSON
- **Load Game** - Click 📂 to load a saved farm
- **Visit Friends** - Click 👥 to load a friend's farm file
- **Share** - Click 📤 to post your farm progress to the feed

### Social Features

- **Create Posts** - Share updates, photos, or farm progress
- **Like & Comment** - Engage with friends' posts
- **Send Messages** - Chat in real-time with friends
- **Friend Requests** - Connect with other players
- **Notifications** - Stay updated on all activity

## 📁 Project Structure

```
transcendence/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth, error handling
│   │   └── index.js          # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── views/            # Page components
│   │   ├── stores/           # Pinia state stores
│   │   ├── services/         # API & Socket services
│   │   ├── router/           # Vue Router config
│   │   ├── App.vue           # Main app component
│   │   ├── main.js           # App entry point
│   │   └── style.css         # Global styles
│   ├── public/               # Static assets
│   └── package.json
│
└── shared/                   # Shared code (optional)
```

## 🛠️ Tech Stack

### Frontend
- **Vue 3.5** - Progressive JavaScript framework
- **Vite 5.x** - Next-gen frontend tooling
- **Vue Router 4** - Official router for Vue
- **Pinia** - State management
- **Three.js** - 3D graphics library
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - WebSocket library
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🔧 Configuration

### Frontend Environment Variables

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Backend Configuration

Edit `backend/src/config/index.js` for:
- Port settings
- CORS origins
- JWT expiration times
- File upload limits

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search?q=query` - Search users

### Posts
- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment on post
- `DELETE /api/posts/:id` - Delete post

### Friends
- `GET /api/friends` - Get friend list
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:id` - Accept request
- `DELETE /api/friends/:id` - Remove friend

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages` - Send message

## 🔌 Socket Events

### Client → Server
- `user:online` - User came online
- `message:send` - Send chat message
- `message:typing` - User is typing
- `game:challenge` - Challenge friend to game

### Server → Client
- `user:status` - User online/offline status
- `notification:new` - New notification
- `message:new` - New message received
- `message:typing` - Someone is typing

## 🎨 Customization

### Changing Colors

Edit `frontend/src/style.css`:
```css
:root {
  --primary: #667eea;        /* Main brand color */
  --secondary: #764ba2;      /* Secondary color */
  --success: #22c55e;        /* Success states */
  --danger: #dc2626;         /* Error states */
}
```

### Game Settings

In-game settings panel allows:
- Map size (10-50 units)
- Fog distance
- Sky color
- Ground color
- Fence color
- Decoration colors

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm run test
```

### Run Backend Tests
```bash
cd backend
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues
```bash
# Reset database
cd backend
rm database.sqlite
npm run migrate
```

### Node Version Issues
```bash
# Check Node version (needs 18+)
node --version

# Use nvm to switch versions
nvm use 18
```

### Three.js Loading Issues
Make sure you're using https in production:
```javascript
// vite.config.js
export default {
  server: {
    https: true
  }
}
```

## 📦 Building for Production

### Build Frontend
```bash
cd frontend
npm run build
```

### Build Backend
```bash
cd backend
npm run build
```

### Deploy
The `dist` folder in frontend and compiled backend can be deployed to:
- **Vercel** (Frontend)
- **Heroku** (Backend)
- **Railway** (Full Stack)
- **DigitalOcean** (VPS)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Three.js community for excellent 3D graphics library
- Vue.js team for the amazing framework
- Socket.io for real-time capabilities
- 42 School for the project inspiration

## 📞 Support

- 📧 Email: support@alpacagram.com
- 💬 Discord: [Join our server](https://discord.gg/alpacagram)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/alpacagram/issues)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Group chats
- [ ] Video calls
- [ ] Marketplace for alpaca items
- [ ] Multiplayer game modes
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Push notifications (PWA)
- [ ] Dark mode

---

Made with 🦙 and ❤️ by the Alpacagram team
