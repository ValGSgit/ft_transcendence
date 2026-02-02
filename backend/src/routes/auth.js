import express from 'express';
import passport from '../config/passport.js';
import { register, login, logout, refreshToken, getMe, setup2FA, verify2FA, disable2FA } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { generateToken, generateRefreshToken } from '../utils/auth.js';
import { sanitizeUser } from '../utils/validation.js';
import { successResponse } from '../utils/response.js';
import config from '../config/index.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// 2FA routes (protected)
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.post('/2fa/disable', authenticate, disable2FA);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${config.frontendUrl}/login?error=oauth_failed`
  }),
  (req, res) => {
    // Generate JWT tokens
    const token = generateToken({ id: req.user.id, username: req.user.username });
    const refreshToken = generateRefreshToken({ id: req.user.id });
    
    // Redirect to frontend with tokens
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  }
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { 
    session: false,
    failureRedirect: `${config.frontendUrl}/login?error=oauth_failed`
  }),
  (req, res) => {
    // Generate JWT tokens
    const token = generateToken({ id: req.user.id, username: req.user.username });
    const refreshToken = generateRefreshToken({ id: req.user.id });
    
    // Redirect to frontend with tokens
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  }
);

export default router;
