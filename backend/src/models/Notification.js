import db from '../config/database.js';

export class Notification {
  static async create(userId, type, title, content, data = null) {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, type, title, content, data)
      VALUES (?, ?, ?, ?, ?);
    `);
    const result = await stmt.run(userId, type, title, content, data ? JSON.stringify(data) : null);
    return await this.findById(result.lastInsertRowid);
  }

  static async findById(id) {
    const stmt = db.prepare(`
      SELECT * FROM notifications WHERE id = ?
    `);
    const notification = await stmt.get(id);
    if (notification && notification.data) {
      notification.data = JSON.parse(notification.data);
    }
    return notification;
  }

  static async getUserNotifications(userId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const notifications = await stmt.all(userId, limit, offset);
    return notifications.map(n => {
      if (n.data) n.data = JSON.parse(n.data);
      return n;
    });
  }

  static async getUnreadCount(userId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read = 0
    `);
    const result = await stmt.get(userId);
    return result.count;
  }

  static async markAsRead(id, userId) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE id = ? AND user_id = ?
    `);
    await stmt.run(id, userId);
    return await this.findById(id);
  }

  static async markAllAsRead(userId) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE user_id = ?
    `);
    return await stmt.run(userId);
  }

  static async delete(id, userId) {
    const stmt = db.prepare(`
      DELETE FROM notifications
      WHERE id = ? AND user_id = ?
    `);
    return await stmt.run(id, userId);
  }

  static async deleteAll(userId) {
    const stmt = db.prepare(`
      DELETE FROM notifications
      WHERE user_id = ?
    `);
    return await stmt.run(userId);
  }
}

export default Notification;
