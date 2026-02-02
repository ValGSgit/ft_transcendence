import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../../controllers/notificationController.js';
import User from '../../models/User.js';

describe('Notification Controller', () => {
  let req, res, testUser;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser = User.create({
      username: `notifuser${uniqueId}`,
      email: `notif${uniqueId}@example.com`,
      password: 'hashedpassword'
    });

    req = {
      body: {},
      params: {},
      query: {},
      user: testUser
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
  });

  describe('getUserNotifications', () => {
    it('should get notifications successfully', async () => {
      await getUserNotifications(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.notifications).toBeDefined();
      expect(res.data.data.unreadCount).toBeDefined();
    });

    it('should respect limit and offset', async () => {
      req.query = { limit: '10', offset: '5' };

      await getUserNotifications(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should return 404 for non-existent notification', async () => {
      req.params = { notificationId: '99999' };

      await markAsRead(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data.message).toBe('Notification not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      await markAllAsRead(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      req.params = { notificationId: '1' };

      await deleteNotification(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all notifications', async () => {
      await deleteAllNotifications(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });
});
