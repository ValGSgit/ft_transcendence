import { describe, it, expect, beforeEach } from '@jest/globals';
import Friend from '../../models/Friend.js';
import User from '../../models/User.js';

describe('Friend Model', () => {
  let testUser1, testUser2;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser1 = User.create({
      username: `friendmodel1${uniqueId}`,
      email: `friendmodel1${uniqueId}@example.com`,
      password: 'hashedpassword'
    });

    testUser2 = User.create({
      username: `friendmodel2${uniqueId}`,
      email: `friendmodel2${uniqueId}@example.com`,
      password: 'hashedpassword'
    });
  });

  describe('sendRequest', () => {
    it('should send friend request', () => {
      const request = Friend.sendRequest(testUser1.id, testUser2.id);

      expect(request).toBeDefined();
      expect(request.sender_id).toBe(testUser1.id);
      expect(request.receiver_id).toBe(testUser2.id);
      expect(request.status).toBe('pending');
    });
  });

  describe('getPendingRequests', () => {
    it('should get pending requests for user', () => {
      Friend.sendRequest(testUser1.id, testUser2.id);

      const requests = Friend.getPendingRequests(testUser2.id);
      expect(requests.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('acceptRequest', () => {
    it('should accept friend request', () => {
      const request = Friend.sendRequest(testUser1.id, testUser2.id);
      const accepted = Friend.acceptRequest(request.id, testUser2.id);

      expect(accepted.status).toBe('accepted');
    });
  });

  describe('declineRequest', () => {
    it('should decline friend request', () => {
      const request = Friend.sendRequest(testUser1.id, testUser2.id);
      const declined = Friend.declineRequest(request.id, testUser2.id);

      expect(declined.status).toBe('declined');
    });
  });

  describe('getFriends', () => {
    it('should get friends list', () => {
      const request = Friend.sendRequest(testUser1.id, testUser2.id);
      Friend.acceptRequest(request.id, testUser2.id);

      const friends = Friend.getFriends(testUser1.id);
      expect(Array.isArray(friends)).toBe(true);
    });
  });

  describe('unfriend', () => {
    it('should remove friendship', () => {
      const request = Friend.sendRequest(testUser1.id, testUser2.id);
      Friend.acceptRequest(request.id, testUser2.id);
      
      Friend.unfriend(testUser1.id, testUser2.id);
      
      const friends = Friend.getFriends(testUser1.id);
      expect(friends.some(f => f.id === testUser2.id)).toBe(false);
    });
  });

  describe('blockUser and getBlockedUsers', () => {
    it('should block a user', () => {
      Friend.blockUser(testUser1.id, testUser2.id);

      const blocked = Friend.getBlockedUsers(testUser1.id);
      expect(blocked.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user', () => {
      Friend.blockUser(testUser1.id, testUser2.id);
      Friend.unblockUser(testUser1.id, testUser2.id);

      const blocked = Friend.getBlockedUsers(testUser1.id);
      expect(blocked.some(b => b.id === testUser2.id)).toBe(false);
    });
  });

  describe('isBlocked', () => {
    it('should check if user is blocked', () => {
      Friend.blockUser(testUser1.id, testUser2.id);

      const isBlocked = Friend.isBlocked(testUser1.id, testUser2.id);
      expect(isBlocked).toBe(true);
    });

    it('should return false for non-blocked user', () => {
      const isBlocked = Friend.isBlocked(testUser1.id, testUser2.id);
      expect(isBlocked).toBe(false);
    });
  });
});
