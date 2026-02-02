import db from '../config/database.js';

export class Notification {
  static create(userId, type, title, content, data = null) {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, type, title, content, data)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, type, title, content, data ? JSON.stringify(data) : null);
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT * FROM notifications WHERE id = ?
    `);
    const notification = stmt.get(id);
    if (notification && notification.data) {
      notification.data = JSON.parse(notification.data);
    }
    return notification;
  }

  static getUserNotifications(userId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const notifications = stmt.all(userId, limit, offset);
    return notifications.map(n => {
      if (n.data) n.data = JSON.parse(n.data);
      return n;
    });
  }

  static getUnreadCount(userId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read = 0
    `);
    return stmt.get(userId).count;
  }

  static markAsRead(id, userId) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(id, userId);
    return this.findById(id);
  }

  static markAllAsRead(userId) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE user_id = ?
    `);
    return stmt.run(userId);
  }

  static delete(id, userId) {
    const stmt = db.prepare(`
      DELETE FROM notifications
      WHERE id = ? AND user_id = ?
    `);
    return stmt.run(id, userId);
  }

  static deleteAll(userId) {
    const stmt = db.prepare(`
      DELETE FROM notifications
      WHERE user_id = ?
    `);
    return stmt.run(userId);
  }
}

export default Notification;
