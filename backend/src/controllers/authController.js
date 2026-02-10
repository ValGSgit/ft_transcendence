import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyToken } from '../utils/auth.js';
import { validateEmail, validateUsername, validatePassword, sanitizeUser } from '../utils/validation.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return errorResponse(res, 'Username, email, and password are required', 400);
    }

    if (!validateEmail(email)) {
      return errorResponse(res, 'Invalid email format', 400);
    }

    if (!validateUsername(username)) {
      return errorResponse(res, 'Username must be 3-20 characters and contain only letters, numbers, and underscores', 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return errorResponse(res, passwordValidation.message, 400);
    }

    // Check if user already exists
    const existingEmail = User.findByEmail(email);
    if (existingEmail) {
      return errorResponse(res, 'Email already registered', 409);
    }

    const existingUsername = User.findByUsername(username);
    if (existingUsername) {
      return errorResponse(res, 'Username already taken', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log('User registered:', username);

    // Generate tokens
    const token = generateToken({ id: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ id: user.id });

    return successResponse(res, {
      user: sanitizeUser(user),
      token,
      refreshToken,
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email/username and password are required', 400);
    }

    // Find user by email OR username
    const user = User.findByEmailOrUsername(email);
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      if (!totpCode) {
        return successResponse(res, {
          requires2FA: true,
          userId: user.id
        }, '2FA code required');
      }

      // Verify TOTP code
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: totpCode,
        window: 1
      });

      if (!verified) {
        return errorResponse(res, 'Invalid 2FA code', 401);
      }
    }

    // Update online status
    User.setOnline(user.id, true);

    // Get fresh user data after setting online
    const updatedUser = User.findById(user.id);

    // Generate tokens
    const token = generateToken({ id: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ id: user.id });

    console.log('Login successful for user:', user.username);

    return successResponse(res, {
      user: sanitizeUser(updatedUser),
      token,
      refreshToken,
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update offline status
    User.setOnline(userId, false);

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    const decoded = verifyToken(oldRefreshToken);
    if (!decoded) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const user = User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Generate new tokens
    const token = generateToken({ id: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ id: user.id });

    return successResponse(res, {
      token,
      refreshToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse(res, 'Token refresh failed', 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    const stats = User.getStats(req.user.id);

    return successResponse(res, {
      user: sanitizeUser(user),
      stats,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to get profile', 500);
  }
};

// 2FA Setup - Generate secret and QR code
export const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = User.findById(userId);

    if (user.two_factor_enabled) {
      return errorResponse(res, '2FA is already enabled', 400);
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Transcendence:${user.username}`,
      issuer: 'Transcendence'
    });

    // Store secret temporarily (not enabled yet)
    User.update(userId, { two_factor_secret: secret.base32 });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return successResponse(res, {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntry: secret.base32
    }, '2FA setup initiated');
  } catch (error) {
    console.error('2FA setup error:', error);
    return errorResponse(res, '2FA setup failed', 500);
  }
};

// 2FA Verify and Enable
export const verify2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { totpCode } = req.body;

    if (!totpCode) {
      return errorResponse(res, 'TOTP code is required', 400);
    }

    const secret = User.get2FASecret(userId);
    if (!secret) {
      return errorResponse(res, 'Please setup 2FA first', 400);
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });

    if (!verified) {
      return errorResponse(res, 'Invalid verification code', 400);
    }

    // Enable 2FA
    const updatedUser = User.enable2FA(userId, secret);

    return successResponse(res, {
      user: sanitizeUser(updatedUser)
    }, '2FA enabled successfully');
  } catch (error) {
    console.error('2FA verification error:', error);
    return errorResponse(res, '2FA verification failed', 500);
  }
};

// 2FA Disable
export const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, totpCode } = req.body;

    if (!password || !totpCode) {
      return errorResponse(res, 'Password and TOTP code are required', 400);
    }

    const user = User.findByIdWithPassword(userId);
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid password', 401);
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });

    if (!verified) {
      return errorResponse(res, 'Invalid 2FA code', 401);
    }

    // Disable 2FA
    const updatedUser = User.disable2FA(userId);

    return successResponse(res, {
      user: sanitizeUser(updatedUser)
    }, '2FA disabled successfully');
  } catch (error) {
    console.error('2FA disable error:', error);
    return errorResponse(res, '2FA disable failed', 500);
  }
};

// Forgot Password - Generate reset token
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const user = User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return successResponse(res, { 
        message: 'If an account exists with this email, a reset link will be generated'
      });
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = User.generatePasswordResetToken(user.id);

    // In production, this would be sent via email
    // For now, return it in the response (for Postman testing)
    console.log(`Password reset token generated for user ${user.email}: ${resetToken}`);

    return successResponse(res, {
      message: 'Password reset token generated',
      // Include token in response for testing (remove in production or use email)
      resetToken,
      expiresIn: '1 hour'
    }, 'Password reset initiated');
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, 'Failed to initiate password reset', 500);
  }
};

// Reset Password - Use token to set new password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, 'Reset token and new password are required', 400);
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return errorResponse(res, passwordValidation.message, 400);
    }

    // Verify token and get user
    const user = User.verifyPasswordResetToken(token);
    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    User.updatePassword(user.id, hashedPassword);

    console.log(`Password reset successful for user ${user.email}`);

    return successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse(res, 'Failed to reset password', 500);
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  setup2FA,
  verify2FA,
  disable2FA,
  forgotPassword,
  resetPassword,
};
