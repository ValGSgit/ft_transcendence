import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Generate a random secret for development if not provided
const defaultSecret = process.env.NODE_ENV === 'production'
  ? null  // Force explicit configuration in production
  : crypto.randomBytes(32).toString('hex');

// Validate JWT secret in production
const jwtSecret = process.env.JWT_SECRET || defaultSecret;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production mode');
}

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS Configuration
  cors: {
    origins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : [
        'http://localhost:4200', // Angular
        'http://localhost:5173', // Vue
        'http://127.0.0.1:4200',
        'http://127.0.0.1:5173',
      ],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Password Requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  },

  // Game Configuration
  game: {
    maxScore: 11,
    ballSpeed: 0.02,
    paddleSpeed: 0.1,
    fieldWidth: 10,
    fieldHeight: 6,
    paddleHeight: 1,  // Added for AI service
    ballRadius: 0.15, // Added for AI service
    ai: {
      easy: {
        reactionTime: 0.3,
        accuracy: 0.6,
        speed: 0.06,
      },
      medium: {
        reactionTime: 0.15,
        accuracy: 0.8,
        speed: 0.08,
      },
      hard: {
        reactionTime: 0.05,
        accuracy: 0.95,
        speed: 0.1,
      },
    },
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
    },
  },

  // Frontend URL for OAuth redirects
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default config;
