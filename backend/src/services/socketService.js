import { Server } from 'socket.io';
import { verifyToken } from '../utils/auth.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Game from '../models/Game.js';
import Notification from '../models/Notification.js';
import { createAI } from './aiService.js';
import config from '../config/index.js';

// Store active game sessions
const activeSessions = new Map();
// Store AI instances for active games
const aiInstances = new Map();
// Store user socket mappings
const userSockets = new Map();

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.userId})`);
    
    // Store socket reference
    userSockets.set(socket.userId, socket.id);
    
    // Update user online status
    await User.setOnline(socket.userId, true);
    
    // Broadcast user online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      username: socket.user.username,
    });

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle game events
    handleGameEvents(socket, io);
    
    // Handle chat events
    handleChatEvents(socket, io);
    
    // Handle notification events
    handleNotificationEvents(socket, io);
    
    // Handle friend events
    handleFriendEvents(socket, io);

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      // Remove socket reference
      userSockets.delete(socket.userId);
      
      // Update user offline status
      await User.setOnline(socket.userId, false);
      
      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        username: socket.user.username,
      });

      // Clean up any active game sessions
      cleanupUserSessions(socket.userId);
    });
  });

  return io;
};

// Matchmaking queue
const matchmakingQueue = [];

const handleGameEvents = (socket, io) => {
  // Start matchmaking
  socket.on('game:matchmaking:join', async () => {
    console.log(`User ${socket.user.username} joined matchmaking`);
    
    // Check if user is already in queue
    const existingIndex = matchmakingQueue.findIndex(p => p.userId === socket.userId);
    if (existingIndex !== -1) {
      return socket.emit('game:matchmaking:error', { message: 'Already in queue' });
    }
    
    // Add to queue
    matchmakingQueue.push({
      userId: socket.userId,
      username: socket.user.username,
      socketId: socket.id,
      joinedAt: Date.now()
    });
    
    socket.emit('game:matchmaking:joined', { 
      status: 'searching',
      queuePosition: matchmakingQueue.length
    });
    
    // Try to match with another player
    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift();
      const player2 = matchmakingQueue.shift();
      
      // Create game
      try {
        const game = await Game.create(player1.userId, player2.userId, false);
        
        // Create game room
        const gameRoom = `game:${game.id}`;
        io.sockets.sockets.get(player1.socketId)?.join(gameRoom);
        io.sockets.sockets.get(player2.socketId)?.join(gameRoom);
        
        // Store session
        activeSessions.set(game.id, {
          gameId: game.id,
          player1Id: player1.userId,
          player2Id: player2.userId,
          isAI: false
        });
        
        // Start game
        await Game.startGame(game.id);
        
        // Notify both players
        io.to(gameRoom).emit('game:matched', {
          gameId: game.id,
          player1: {
            id: player1.userId,
            username: player1.username
          },
          player2: {
            id: player2.userId,
            username: player2.username
          },
          config: config.game
        });
        
        console.log(`Game matched: ${player1.username} vs ${player2.username}`);
      } catch (error) {
        console.error('Error creating matched game:', error);
        // Re-add players to queue
        matchmakingQueue.unshift(player2, player1);
      }
    }
  });
  
  // Leave matchmaking
  socket.on('game:matchmaking:leave', () => {
    const index = matchmakingQueue.findIndex(p => p.userId === socket.userId);
    if (index !== -1) {
      matchmakingQueue.splice(index, 1);
      socket.emit('game:matchmaking:left');
      console.log(`User ${socket.user.username} left matchmaking`);
    }
  });

  // Start AI game
  socket.on('game:ai:start', async ({ difficulty = 'medium' }) => {
    try {
      // Create game record
      const game = await Game.create(socket.userId, null, true, difficulty);
      
      // Create AI instance
      const ai = createAI(difficulty);
      aiInstances.set(game.id, ai);
      
      // Store session
      activeSessions.set(game.id, {
        gameId: game.id,
        player1Id: socket.userId,
        isAI: true,
        difficulty,
        ai,
      });

      // Start the game
      await Game.startGame(game.id);

      socket.emit('game:started', {
        gameId: game.id,
        opponent: 'AI',
        difficulty,
        config: config.game,
      });

      console.log(`AI game started: ${game.id} (difficulty: ${difficulty})`);
    } catch (error) {
      console.error('Error starting AI game:', error);
      socket.emit('game:error', { message: 'Failed to start game' });
    }
  });

  // Game state update
  socket.on('game:update', (data) => {
    const { gameId, gameState } = data;
    const session = activeSessions.get(gameId);

    if (!session) {
      return socket.emit('game:error', { message: 'Game session not found' });
    }

    // If AI game, calculate AI move
    if (session.isAI) {
      const ai = aiInstances.get(gameId);
      if (ai) {
        const aiMove = ai.calculateMove(gameState);
        
        // Send AI move back to client
        socket.emit('game:ai:move', {
          gameId,
          move: aiMove,
        });
      }
    } else {
      // Broadcast to other player in multiplayer
      socket.to(`game:${gameId}`).emit('game:update', {
        gameId,
        gameState,
      });
    }
  });

  // Score update
  socket.on('game:score', async (data) => {
    const { gameId, player1Score, player2Score } = data;
    
    try {
      await Game.updateScore(gameId, player1Score, player2Score);
      
      // Broadcast score update
      io.to(`game:${gameId}`).emit('game:score:updated', {
        gameId,
        player1Score,
        player2Score,
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  });

  // Game end
  socket.on('game:end', async (data) => {
    const { gameId, winnerId, player1Score, player2Score } = data;
    
    try {
      // Update final score
      await Game.updateScore(gameId, player1Score, player2Score);
      
      // End game
      const game = await Game.endGame(gameId, winnerId);
      
      // Clean up
      activeSessions.delete(gameId);
      aiInstances.delete(gameId);
      
      // Notify players
      io.to(`game:${gameId}`).emit('game:ended', {
        gameId,
        winner: winnerId,
        finalScore: {
          player1: player1Score,
          player2: player2Score,
        },
        stats: game,
      });

      console.log(`Game ended: ${gameId}, Winner: ${winnerId}`);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  });
};

const handleChatEvents = (socket, io) => {
  // Join chat room
  socket.on('chat:join', ({ roomId }) => {
    socket.join(`chat:${roomId}`);
    console.log(`User ${socket.user.username} joined room ${roomId}`);
  });

  // Leave chat room
  socket.on('chat:leave', ({ roomId }) => {
    socket.leave(`chat:${roomId}`);
  });

  // Send message
  socket.on('chat:message', async ({ roomId, content }) => {
    try {
      const message = await Chat.createMessage(roomId, socket.userId, content);
      
      // Broadcast to room
      io.to(`chat:${roomId}`).emit('chat:message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('chat:typing', ({ roomId }) => {
    socket.to(`chat:${roomId}`).emit('chat:typing', {
      userId: socket.userId,
      username: socket.user.username,
    });
  });
};

const handleNotificationEvents = (socket, io) => {
  // Mark notification as read
  socket.on('notification:read', async ({ notificationId }) => {
    try {
      await Notification.markAsRead(notificationId, socket.userId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  // Mark all notifications as read
  socket.on('notification:read:all', async () => {
    try {
      await Notification.markAllAsRead(socket.userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  });
};

const handleFriendEvents = (socket, io) => {
  // Friend request sent (notify recipient)
  socket.on('friend:request:sent', ({ recipientId }) => {
    const recipientSocketId = userSockets.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('friend:request:received', {
        senderId: socket.userId,
        senderUsername: socket.user.username,
      });
    }
  });

  // Friend request accepted (notify sender)
  socket.on('friend:request:accepted', ({ senderId }) => {
    const senderSocketId = userSockets.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('friend:request:accepted', {
        userId: socket.userId,
        username: socket.user.username,
      });
    }
  });
};

const cleanupUserSessions = async (userId) => {
  // Find and clean up any sessions for this user
  for (const [gameId, session] of activeSessions.entries()) {
    if (session.player1Id === userId || session.player2Id === userId) {
      // Mark game as abandoned
      try {
        await Game.abandonGame(gameId);
      } catch (error) {
        console.error('Error abandoning game:', error);
      }
      
      // Clean up
      activeSessions.delete(gameId);
      aiInstances.delete(gameId);
    }
  }
};

// Helper function to send notification to user
export const sendNotificationToUser = (io, userId, notification) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
};

export default {
  initializeSocket,
  sendNotificationToUser,
};
