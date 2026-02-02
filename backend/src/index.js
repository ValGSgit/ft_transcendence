import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from './config/passport.js';
import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './services/socketService.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Trust proxy (for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all /api routes
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport
app.use(passport.initialize());

// Request logging (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Transcendence API',
    version: '1.0.0',
    description: 'Enhanced backend with authentication, social features, and AI gaming',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      friends: '/api/friends',
      chat: '/api/chat',
      game: '/api/game',
      notifications: '/api/notifications',
    },
    documentation: 'See README.md for detailed API documentation',
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Socket.io
const io = initializeSocket(httpServer);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║           🎮  TRANSCENDENCE BACKEND v1.0.0  🎮           ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  const dbType = process.env.DATABASE_PATH ? `File-based (${process.env.DATABASE_PATH})` : 'File-based (./data/transcendence.db)';
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${config.nodeEnv}`);
  console.log(`✅ Socket.io initialized`);
  console.log(`✅ Database: ${dbType}`);
  console.log('');
  console.log('📡 Available endpoints:');
  console.log(`   HTTP:      http://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log('');
  console.log('🌐 CORS enabled for:');
  config.cors.origins.forEach(origin => {
    console.log(`   - ${origin}`);
  });
  console.log('');
  console.log('📚 Features:');
  console.log('   ✓ JWT Authentication');
  console.log('   ✓ User Profiles & Friends System');
  console.log('   ✓ Real-time Chat');
  console.log('   ✓ Game System with AI Opponent');
  console.log('   ✓ Matchmaking & Leaderboard');
  console.log('   ✓ Notifications');
  console.log('   ✓ WebSocket Real-time Updates');
  console.log('');
  console.log('🤖 AI Difficulties:');
  console.log('   - Easy:   Slower reactions, lower accuracy');
  console.log('   - Medium: Balanced gameplay');
  console.log('   - Hard:   Fast reactions, high accuracy');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
