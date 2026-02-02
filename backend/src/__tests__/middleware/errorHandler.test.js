import { describe, it, expect, beforeEach } from '@jest/globals';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test/path'
    };
    res = {
      statusCode: null,
      data: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };
    next = () => {};
  });

  describe('errorHandler', () => {
    it('should handle validation errors', () => {
      const err = {
        name: 'ValidationError',
        errors: { field: 'email', message: 'Invalid email' }
      };
      
      errorHandler(err, req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Validation error');
      expect(res.data.errors).toEqual(err.errors);
    });

    it('should handle unauthorized errors', () => {
      const err = {
        name: 'UnauthorizedError'
      };
      
      errorHandler(err, req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(res.data.message).toBe('Unauthorized');
    });

    it('should handle SQLite constraint errors', () => {
      const err = {
        code: 'SQLITE_CONSTRAINT'
      };
      
      errorHandler(err, req, res, next);
      
      expect(res.statusCode).toBe(409);
      expect(res.data.message).toBe('Constraint violation: Duplicate entry');
    });

    it('should handle errors with custom status code', () => {
      const err = {
        statusCode: 403,
        message: 'Forbidden resource'
      };
      
      errorHandler(err, req, res, next);
      
      expect(res.statusCode).toBe(403);
      expect(res.data.message).toBe('Forbidden resource');
    });

    it('should handle generic errors with default 500 status', () => {
      const err = {
        message: 'Something went wrong'
      };
      
      errorHandler(err, req, res, next);
      
      expect(res.statusCode).toBe(500);
      expect(res.data.message).toBe('Something went wrong');
    });

    it('should handle errors without message', () => {
      const err = {};
      
      errorHandler(err, req, res, next);
      
      expect(res.statusCode).toBe(500);
      expect(res.data.message).toBe('Internal server error');
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for unknown routes', () => {
      notFoundHandler(req, res);
      
      expect(res.statusCode).toBe(404);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Route /test/path not found');
    });
  });
});
