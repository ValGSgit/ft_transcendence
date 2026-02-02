import { describe, it, expect, beforeEach } from '@jest/globals';
import Notification from '../../models/Notification.js';
import User from '../../models/User.js';

describe('Notification Model', () => {
  let testUser;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser = User.create({
      username: `notifmodel${uniqueId}`,
      email: `notifmodel${uniqueId}@example.com`,
      password: 'hashedpassword'
    });
  });

  describe('create', () => {
    it('should create a notification', () => {
      const notification = Notification.create(
        testUser.id,
        'friend_request',
        'New Friend Request',
        'Someone sent you a friend request',
        { requestId: 123 }
      );

      expect(notification).toBeDefined();
      expect(notification.user_id).toBe(testUser.id);
      expect(notification.type).toBe('friend_request');
      expect(notification.title).toBe('New Friend Request');
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications', () => {
      Notification.create(testUser.id, 'system', 'Test Notif', 'Test message');

      const notifications = Notification.getUserNotifications(testUser.id);
      expect(notifications.length).toBeGreaterThanOrEqual(1);
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        Notification.create(testUser.id, 'system', 'Test', `Message ${i}`);
      }

      const notifications = Notification.getUserNotifications(testUser.id, 5);
      expect(notifications.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread notification count', () => {
      Notification.create(testUser.id, 'system', 'Unread', 'Unread message');

      const count = Notification.getUnreadCount(testUser.id);
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = Notification.create(
        testUser.id,
        'system',
        'Mark Read',
        'Test message'
      );

      const marked = Notification.markAsRead(notification.id, testUser.id);
      expect(marked.read).toBe(1);
    });

    it('should return null for non-existent notification', () => {
      const result = Notification.markAsRead(99999, testUser.id);
      expect(result).toBeUndefined();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      Notification.create(testUser.id, 'system', 'Test 1', 'Message 1');
      Notification.create(testUser.id, 'system', 'Test 2', 'Message 2');

      Notification.markAllAsRead(testUser.id);

      const unreadCount = Notification.getUnreadCount(testUser.id);
      expect(unreadCount).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete notification', () => {
      const notification = Notification.create(
        testUser.id,
        'system',
        'Delete Test',
        'To be deleted'
      );

      Notification.delete(notification.id, testUser.id);

      const notifications = Notification.getUserNotifications(testUser.id);
      expect(notifications.some(n => n.id === notification.id)).toBe(false);
    });
  });

  describe('deleteAll', () => {
    it('should delete all notifications', () => {
      Notification.create(testUser.id, 'system', 'Test 1', 'Message 1');
      Notification.create(testUser.id, 'system', 'Test 2', 'Message 2');

      Notification.deleteAll(testUser.id);

      const notifications = Notification.getUserNotifications(testUser.id);
      expect(notifications.length).toBe(0);
    });
  });
});
