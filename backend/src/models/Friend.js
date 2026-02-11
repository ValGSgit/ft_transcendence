import db from '../config/database.js';

export class Friend {
  static async sendRequest(senderId, receiverId) {
    // Check if already friends or request exists
    const existing = await db.prepare(`
      SELECT * FROM friend_requests
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
    `).get(senderId, receiverId, receiverId, senderId);

    if (existing) {
      throw new Error('Friend request already exists');
    }

    // Check if already friends
    const friendship = await db.prepare(`
      SELECT * FROM friends
      WHERE (user1_id = ? AND user2_id = ?)
         OR (user1_id = ? AND user2_id = ?)
    `).get(senderId, receiverId, receiverId, senderId);

    if (friendship) {
      throw new Error('Already friends');
    }

    const stmt = db.prepare(`
      INSERT INTO friend_requests (sender_id, receiver_id)
      VALUES (?, ?)
    `);
    const result = await stmt.run(senderId, receiverId);
    return await this.getRequestById(result.lastInsertRowid);
  }

  static async getRequestById(id) {
    const stmt = db.prepare(`
      SELECT fr.*,
             sender.username as sender_username,
             sender.avatar as sender_avatar,
             receiver.username as receiver_username,
             receiver.avatar as receiver_avatar
      FROM friend_requests fr
      JOIN users sender ON fr.sender_id = sender.id
      JOIN users receiver ON fr.receiver_id = receiver.id
      WHERE fr.id = ?
    `);
    return await stmt.get(id);
  }

  static async getPendingRequests(userId) {
    const stmt = db.prepare(`
      SELECT fr.*,
             sender.username as sender_username,
             sender.avatar as sender_avatar,
             sender.online as sender_online
      FROM friend_requests fr
      JOIN users sender ON fr.sender_id = sender.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `);
    return await stmt.all(userId);
  }

  static async getSentRequests(userId) {
    const stmt = db.prepare(`
      SELECT fr.*,
             receiver.id as user_id,
             receiver.username as receiver_username,
             receiver.avatar as receiver_avatar,
             receiver.online as receiver_online
      FROM friend_requests fr
      JOIN users receiver ON fr.receiver_id = receiver.id
      WHERE fr.sender_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `);
    return await stmt.all(userId);
  }

  static async getSuggestions(userId, limit = 10) {
    // Get users who are not already friends and not blocked
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.avatar, u.bio, u.online,
             (SELECT COUNT(*) FROM friends f2 
              WHERE (f2.user1_id = u.id OR f2.user2_id = u.id)
                AND (f2.user1_id IN (SELECT user1_id FROM friends WHERE user2_id = ? UNION SELECT user2_id FROM friends WHERE user1_id = ?)
                  OR f2.user2_id IN (SELECT user1_id FROM friends WHERE user2_id = ? UNION SELECT user2_id FROM friends WHERE user1_id = ?))
             ) as mutual_friends
      FROM users u
      WHERE u.id != ?
        AND u.id NOT IN (
          SELECT user1_id FROM friends WHERE user2_id = ?
          UNION SELECT user2_id FROM friends WHERE user1_id = ?
        )
        AND u.id NOT IN (
          SELECT blocked_id FROM blocked_users WHERE blocker_id = ?
          UNION SELECT blocker_id FROM blocked_users WHERE blocked_id = ?
        )
        AND u.id NOT IN (
          SELECT receiver_id FROM friend_requests WHERE sender_id = ? AND status = 'pending'
          UNION SELECT sender_id FROM friend_requests WHERE receiver_id = ? AND status = 'pending'
        )
      ORDER BY mutual_friends DESC, u.created_at DESC
      LIMIT ?
    `);
    return await stmt.all(userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, limit);
  }

  static async acceptRequest(requestId, userId) {
    const request = await this.getRequestById(requestId);
    if (!request || request.receiver_id !== userId) {
      throw new Error('Friend request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request already processed');
    }

    await db.runTransaction(async () => {
      // Update request status
      await db.prepare(`
        UPDATE friend_requests
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(requestId);
      
      // Create friendship (store with smaller ID first)
      const user1 = Math.min(request.sender_id, request.receiver_id);
      const user2 = Math.max(request.sender_id, request.receiver_id);
      
      await db.prepare(`
        INSERT INTO friends (user1_id, user2_id)
        VALUES (?, ?)
      `).run(user1, user2);
    });

    return await this.getRequestById(requestId);
  }

  static async declineRequest(requestId, userId) {
    const request = await this.getRequestById(requestId);
    
    if (!request || request.receiver_id !== userId) {
      throw new Error('Not authorized to decline this request');
    }

    const stmt = db.prepare(`
      DELETE FROM friend_requests WHERE id = ?
    `);
    await stmt.run(requestId);
    return await this.getRequestById(requestId);
  }

  static async getFriends(userId) {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, u.bio, u.status, u.online, u.last_seen
      FROM users u
      JOIN friends f ON (f.user1_id = u.id OR f.user2_id = u.id)
      WHERE (f.user1_id = ? OR f.user2_id = ?)
        AND u.id != ?
      ORDER BY u.online DESC, u.username ASC
    `);
    return await stmt.all(userId, userId, userId);
  }

  static async unfriend(userId, friendId) {
    const user1 = Math.min(userId, friendId);
    const user2 = Math.max(userId, friendId);

    const stmt = db.prepare(`
      DELETE FROM friends
      WHERE user1_id = ? AND user2_id = ?
    `);
    return await stmt.run(user1, user2);
  }

  static async areFriends(userId1, userId2) {
    const user1 = Math.min(userId1, userId2);
    const user2 = Math.max(userId1, userId2);

    const stmt = db.prepare(`
      SELECT * FROM friends
      WHERE user1_id = ? AND user2_id = ?
    `);
    return (await stmt.get(user1, user2)) !== undefined;
  }

  static async blockUser(blockerId, blockedId) {
    // Remove friendship if exists
    await this.unfriend(blockerId, blockedId);

    // Remove any pending requests
    await db.prepare(`
      DELETE FROM friend_requests
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
    `).run(blockerId, blockedId, blockedId, blockerId);

    // Block the user
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_id)
      VALUES (?, ?)
    `);
    return await stmt.run(blockerId, blockedId);
  }

  static async unblockUser(blockerId, blockedId) {
    const stmt = db.prepare(`
      DELETE FROM blocked_users
      WHERE blocker_id = ? AND blocked_id = ?
    `);
    return await stmt.run(blockerId, blockedId);
  }

  static async getBlockedUsers(userId) {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.avatar
      FROM users u
      JOIN blocked_users b ON b.blocked_id = u.id
      WHERE b.blocker_id = ?
    `);
    return await stmt.all(userId);
  }

  static async isBlocked(userId1, userId2) {
    const stmt = db.prepare(`
      SELECT * FROM blocked_users
      WHERE (blocker_id = ? AND blocked_id = ?)
         OR (blocker_id = ? AND blocked_id = ?)
    `);
    return (await stmt.get(userId1, userId2, userId2, userId1)) !== undefined;
  }
}
        UPDATE friend_requests
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(requestId);

      // Create friendship (always store with smaller ID first)
      const user1 = Math.min(request.sender_id, request.receiver_id);
      const user2 = Math.max(request.sender_id, request.receiver_id);

      db.prepare(`
        INSERT INTO friends (user1_id, user2_id)
        VALUES (?, ?)
      `).run(user1, user2);
    });

    transaction();
    return this.getRequestById(requestId);
  }

  static declineRequest(requestId, userId) {
    const request = this.getRequestById(requestId);
    if (!request || request.receiver_id !== userId) {
      throw new Error('Friend request not found');
    }

    const stmt = db.prepare(`
      UPDATE friend_requests
      SET status = 'declined', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(requestId);
    return this.getRequestById(requestId);
  }

  static getFriends(userId) {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, u.bio, u.status, u.online, u.last_seen
      FROM users u
      JOIN friends f ON (f.user1_id = u.id OR f.user2_id = u.id)
      WHERE (f.user1_id = ? OR f.user2_id = ?)
        AND u.id != ?
      ORDER BY u.online DESC, u.username ASC
    `);
    return stmt.all(userId, userId, userId);
  }

  static unfriend(userId, friendId) {
    const user1 = Math.min(userId, friendId);
    const user2 = Math.max(userId, friendId);

    const stmt = db.prepare(`
      DELETE FROM friends
      WHERE user1_id = ? AND user2_id = ?
    `);
    return stmt.run(user1, user2);
  }

  static areFriends(userId1, userId2) {
    const user1 = Math.min(userId1, userId2);
    const user2 = Math.max(userId1, userId2);

    const stmt = db.prepare(`
      SELECT * FROM friends
      WHERE user1_id = ? AND user2_id = ?
    `);
    return stmt.get(user1, user2) !== undefined;
  }

  static blockUser(blockerId, blockedId) {
    // Remove friendship if exists
    this.unfriend(blockerId, blockedId);

    // Remove any pending requests
    db.prepare(`
      DELETE FROM friend_requests
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
    `).run(blockerId, blockedId, blockedId, blockerId);

    // Block the user
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_id)
      VALUES (?, ?)
    `);
    return stmt.run(blockerId, blockedId);
  }

  static unblockUser(blockerId, blockedId) {
    const stmt = db.prepare(`
      DELETE FROM blocked_users
      WHERE blocker_id = ? AND blocked_id = ?
    `);
    return stmt.run(blockerId, blockedId);
  }

  static getBlockedUsers(userId) {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.avatar
      FROM users u
      JOIN blocked_users b ON b.blocked_id = u.id
      WHERE b.blocker_id = ?
    `);
    return stmt.all(userId);
  }

  static isBlocked(userId1, userId2) {
    const stmt = db.prepare(`
      SELECT * FROM blocked_users
      WHERE (blocker_id = ? AND blocked_id = ?)
         OR (blocker_id = ? AND blocked_id = ?)
    `);
    return stmt.get(userId1, userId2, userId2, userId1) !== undefined;
  }
}

export default Friend;
