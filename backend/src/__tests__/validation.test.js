import { describe, it, expect } from '@jest/globals';
import { 
  validateEmail, 
  validateUsername, 
  validatePassword, 
  sanitizeUser 
} from '../utils/validation.js';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should validate correct username', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('test_user')).toBe(true);
      expect(validateUsername('abc')).toBe(true);
    });

    it('should reject invalid username', () => {
      expect(validateUsername('ab')).toBe(false); // too short
      expect(validateUsername('a'.repeat(21))).toBe(false); // too long
      expect(validateUsername('user-name')).toBe(false); // invalid character
      expect(validateUsername('user name')).toBe(false); // space
      expect(validateUsername('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('Test123!');
      expect(result.valid).toBe(true);
    });

    it('should reject short password', () => {
      const result = validatePassword('Test1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('test123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('TEST123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject password without number', () => {
      const result = validatePassword('TestTest!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });
  });

  describe('sanitizeUser', () => {
    it('should remove sensitive fields', () => {
      const user = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'hashed_password',
        two_factor_secret: 'secret_key',
        bio: 'My bio'
      };

      const sanitized = sanitizeUser(user);
      expect(sanitized.id).toBe(1);
      expect(sanitized.username).toBe('test');
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.two_factor_secret).toBeUndefined();
      expect(sanitized.bio).toBe('My bio');
    });

    it('should handle null user', () => {
      expect(sanitizeUser(null)).toBe(null);
    });
  });
});
