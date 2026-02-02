import { describe, it, expect, beforeEach } from '@jest/globals';
import Chat from '../../models/Chat.js';
import User from '../../models/User.js';

describe('Chat Model', () => {
  let testUser1, testUser2;

  beforeEach(() => {
    const uniqueId = Date.now() + Math.random();
    testUser1 = User.create({
      username: `chatmodeluser1${uniqueId}`,
      email: `chatmodel1${uniqueId}@example.com`,
      password: 'hashedpassword'
    });

    testUser2 = User.create({
      username: `chatmodeluser2${uniqueId}`,
      email: `chatmodel2${uniqueId}@example.com`,
      password: 'hashedpassword'
    });
  });

  describe('createRoom', () => {
    it('should create a chat room', () => {
      const room = Chat.createRoom('Test Room', 'channel', testUser1.id);

      expect(room).toBeDefined();
      expect(room.name).toBe('Test Room');
      expect(room.type).toBe('channel');
    });
  });

  describe('getRoomById', () => {
    it('should get room by ID', () => {
      const room = Chat.createRoom('Another Room', 'channel', testUser1.id);
      const fetched = Chat.getRoomById(room.id);

      expect(fetched).toBeDefined();
      expect(fetched.id).toBe(room.id);
      expect(fetched.name).toBe('Another Room');
    });
  });

  describe('addMember and getRoomMembers', () => {
    it('should add member to room', () => {
      const room = Chat.createRoom('Member Room', 'channel', testUser1.id);
      Chat.addMember(room.id, testUser1.id);
      Chat.addMember(room.id, testUser2.id);

      const members = Chat.getRoomMembers(room.id);
      expect(members.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('removeMember', () => {
    it('should remove member from room', () => {
      const room = Chat.createRoom('Remove Room', 'channel', testUser1.id);
      Chat.addMember(room.id, testUser1.id);
      Chat.removeMember(room.id, testUser1.id);

      const members = Chat.getRoomMembers(room.id);
      expect(members.some(m => m.id === testUser1.id)).toBe(false);
    });
  });

  describe('createMessage', () => {
    it('should create a message', () => {
      const room = Chat.createRoom('Message Room', 'channel', testUser1.id);
      const message = Chat.createMessage(room.id, testUser1.id, 'Hello!');

      expect(message).toBeDefined();
      expect(message.content).toBe('Hello!');
      expect(message.sender_id).toBe(testUser1.id);
    });
  });

  describe('getRoomMessages', () => {
    it('should get room messages', () => {
      const room = Chat.createRoom('Messages Room', 'channel', testUser1.id);
      Chat.createMessage(room.id, testUser1.id, 'Message 1');
      Chat.createMessage(room.id, testUser1.id, 'Message 2');

      const messages = Chat.getRoomMessages(room.id);
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit parameter', () => {
      const room = Chat.createRoom('Limit Room', 'channel', testUser1.id);
      for (let i = 0; i < 10; i++) {
        Chat.createMessage(room.id, testUser1.id, `Message ${i}`);
      }

      const messages = Chat.getRoomMessages(room.id, 5);
      expect(messages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getUserRooms', () => {
    it('should get user rooms', () => {
      const room = Chat.createRoom('User Room', 'channel', testUser1.id);
      Chat.addMember(room.id, testUser1.id);

      const rooms = Chat.getUserRooms(testUser1.id);
      expect(rooms.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getOrCreateDirectRoom', () => {
    it('should create direct room between users', () => {
      const room = Chat.getOrCreateDirectRoom(testUser1.id, testUser2.id);

      expect(room).toBeDefined();
      expect(room.type).toBe('direct');
    });

    it('should return existing direct room', () => {
      const room1 = Chat.getOrCreateDirectRoom(testUser1.id, testUser2.id);
      const room2 = Chat.getOrCreateDirectRoom(testUser1.id, testUser2.id);

      expect(room1.id).toBe(room2.id);
    });
  });
});
