import config from '../config/index.js';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username) => {
  if (!username || username.length < 3 || username.length > 20) {
    return false;
  }
  // Only allow alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password) => {
  if (!password || password.length < config.password.minLength) {
    return {
      valid: false,
      message: `Password must be at least ${config.password.minLength} characters long`,
    };
  }

  if (config.password.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (config.password.requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (config.password.requireNumber && !/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }

  return { valid: true };
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, two_factor_secret, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

export default {
  validateEmail,
  validateUsername,
  validatePassword,
  sanitizeUser,
};
