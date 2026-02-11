import db from '../config/database.js';

export class Chat {
  static async createRoom(name, type, createdBy) {
    const stmt = db.prepare(`
      INSERT INTO chat_rooms (name, type, created_by)
      VALUES (?, ?, ?)
    `);
    const result = await stmt.run(name, type, createdBy);
    return await this.getRoomById(result.lastInsertRowid);
  }

  static async getRoomById(id) {
    const stmt = db.prepare(`
      SELECT * FROM chat_rooms WHERE id = ?
    `);
    return await stmt.get(id);
  }

  static async getUserRooms(userId) {
    const stmt = db.prepare(`
      SELECT cr.*, 
             COUNT(DISTINCT m.id) as message_count,
             MAX(m.created_at) as last_message_at
      FROM chat_rooms cr
      JOIN chat_room_members crm ON cr.id = crm.room_id
      LEFT JOIN messages m ON cr.id = m.room_id
      WHERE crm.user_id = ?
      GROUP BY cr.id
      ORDER BY last_message_at DESC
    `);
    return await stmt.all(userId);
  }

  static async addMember(roomId, userId) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO chat_room_members (room_id, user_id)
      VALUES (?, ?)
    `);
    return await stmt.run(roomId, userId);
  }

  static async removeMember(roomId, userId) {
    const stmt = db.prepare(`
      DELETE FROM chat_room_members
      WHERE room_id = ? AND user_id = ?
    `);
    return await stmt.run(roomId, userId);
  }

  static async getRoomMembers(roomId) {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.avatar, u.online, u.last_seen
      FROM users u
      JOIN chat_room_members crm ON u.id = crm.user_id
      WHERE crm.room_id = ?
      ORDER BY u.username
    `);
    return await stmt.all(roomId);
  }

  static async createMessage(roomId, senderId, content) {
    const stmt = db.prepare(`
      INSERT INTO messages (room_id, sender_id, content)
      VALUES (?, ?, ?)
    `);
    const result = await stmt.run(roomId, senderId, content);
    return await this.getMessageById(result.lastInsertRowid);
  }

  static async getMessageById(id) {
    const stmt = db.prepare(`
      SELECT m.*,
             u.username as sender_username,
             u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `);
    return await stmt.get(id);
  }

  static async getRoomMessages(roomId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT m.*,
             u.username as sender_username,
             u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return (await stmt.all(roomId, limit, offset)).reverse();
  }

  static async getOrCreateDirectRoom(user1Id, user2Id) {
    // Check if a direct room already exists between these users  
    const existing = await db.prepare(`
      SELECT cr.*
      FROM chat_rooms cr
      JOIN chat_room_members crm1 ON cr.id = crm1.room_id
      JOIN chat_room_members crm2 ON cr.id = crm2.room_id
      WHERE cr.type = 'direct'
        AND crm1.user_id = ?
        AND crm2.user_id = ?
    `).get(user1Id, user2Id);

    if (existing) {
      return existing;
    }

    // Create new direct room using transaction
    const roomId = await db.runTransaction(async () => {
      const roomStmt = db.prepare(`
        INSERT INTO chat_rooms (name, type, created_by)
        VALUES (?, 'direct', ?)
      `);
      const result = await roomStmt.run(`Direct: ${user1Id}-${user2Id}`, user1Id);
      const newRoomId = result.lastInsertRowid;

      // Add both users as members
      const memberStmt = db.prepare(`
        INSERT INTO chat_room_members (room_id, user_id)
        VALUES (?, ?)
      `);
      await memberStmt.run(newRoomId, user1Id);
      await memberStmt.run(newRoomId, user2Id);

      return newRoomId;
    });

    return await this.getRoomById(roomId);
  }

  static async deleteRoom(roomId) {
    const stmt = db.prepare('DELETE FROM chat_rooms WHERE id = ?');
    return await stmt.run(roomId);
  }

  static async searchMessages(query, userId, limit = 20) {
    const stmt = db.prepare(`
      SELECT m.*,
             u.username as sender_username,
             u.avatar as sender_avatar,
             cr.name as room_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      JOIN chat_rooms cr ON m.room_id = cr.id
      JOIN chat_room_members crm ON cr.id = crm.room_id
      WHERE crm.user_id = ? AND m.content LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    return await stmt.all(userId, `%${query}%`, limit);
  }
}

export default Chat;

