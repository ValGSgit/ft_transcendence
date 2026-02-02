import { describe, it, expect } from '@jest/globals';
import { successResponse, errorResponse } from '../utils/response.js';

describe('Response Utils', () => {
  let res;

  beforeEach(() => {
    res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };
  });

  describe('successResponse', () => {
    it('should return success response with default status 200', () => {
      successResponse(res, { user: 'test' }, 'Success');
      
      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toBe('Success');
      expect(res.data.data.user).toBe('test');
    });

    it('should return success response with custom status', () => {
      successResponse(res, { id: 1 }, 'Created', 201);
      
      expect(res.statusCode).toBe(201);
      expect(res.data.success).toBe(true);
    });

    it('should handle null data', () => {
      successResponse(res, null, 'OK');
      
      expect(res.statusCode).toBe(200);
      expect(res.data.data).toBe(null);
    });
  });

  describe('errorResponse', () => {
    it('should return error response with default status 500', () => {
      errorResponse(res, 'Error occurred');
      
      expect(res.statusCode).toBe(500);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Error occurred');
    });

    it('should return error response with custom status', () => {
      errorResponse(res, 'Not found', 404);
      
      expect(res.statusCode).toBe(404);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBe('Not found');
    });

    it('should include error details if provided', () => {
      const details = { field: 'email', issue: 'invalid' };
      errorResponse(res, 'Validation failed', 422, details);
      
      expect(res.statusCode).toBe(422);
      expect(res.data.errors).toEqual(details);
    });
  });
});
