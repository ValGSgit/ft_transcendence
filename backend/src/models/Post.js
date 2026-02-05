import db from '../config/database.js';

export class Post {
  static create({ userId, content, type = 'text', visibility = 'public', image = null, farmData = null }) {
    const stmt = db.prepare(`
      INSERT INTO posts (user_id, content, type, visibility, image, farm_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId,
      content,
      type,
      visibility,
      image,
      farmData ? JSON.stringify(farmData) : null
    );
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT p.*, u.username, u.avatar,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `);
    const post = stmt.get(id);
    if (post && post.farm_data) {
      post.farm_data = JSON.parse(post.farm_data);
    }
    return post;
  }

  static getFeed(userId, visibility = ['public', 'friends'], limit = 20, offset = 0) {
    // Get posts from user's friends and public posts
    const placeholders = visibility.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT p.*, u.username, u.avatar,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
             (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.visibility IN (${placeholders})
        OR (p.visibility = 'friends' AND p.user_id IN (
          SELECT CASE
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END
          FROM friend_requests
          WHERE status = 'accepted' AND (sender_id = ? OR receiver_id = ?)
        ))
        OR p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const posts = stmt.all(userId, ...visibility, userId, userId, userId, userId, limit, offset);
    return posts.map(post => {
      if (post.farm_data) {
        post.farm_data = JSON.parse(post.farm_data);
      }
      // Ensure user_liked is a boolean
      post.user_liked = !!post.user_liked;
      return post;
    });
  }

  static getUserPosts(profileUserId, currentUserId = null, limit = 20, offset = 0) {
    const viewerId = currentUserId || profileUserId;
    const stmt = db.prepare(`
      SELECT p.*, u.username, u.avatar,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
             (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const posts = stmt.all(viewerId, profileUserId, limit, offset);
    return posts.map(post => {
      if (post.farm_data) {
        post.farm_data = JSON.parse(post.farm_data);
      }
      // Ensure user_liked is a boolean
      post.user_liked = !!post.user_liked;
      return post;
    });
  }

  static update(id, userId, { content, visibility, image }) {
    const fields = [];
    const values = [];

    if (content !== undefined) {
      fields.push('content = ?');
      values.push(content);
    }
    if (visibility !== undefined) {
      fields.push('visibility = ?');
      values.push(visibility);
    }
    if (image !== undefined) {
      fields.push('image = ?');
      values.push(image);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const stmt = db.prepare(`
      UPDATE posts
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(...values);
    return this.findById(id);
  }

  static delete(id, userId) {
    const stmt = db.prepare(`
      DELETE FROM posts WHERE id = ? AND user_id = ?
    `);
    return stmt.run(id, userId);
  }

  static likePost(postId, userId) {
    try {
      const stmt = db.prepare(`
        INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)
      `);
      stmt.run(postId, userId);
      return true;
    } catch (error) {
      // Already liked
      return false;
    }
  }

  static unlikePost(postId, userId) {
    const stmt = db.prepare(`
      DELETE FROM post_likes WHERE post_id = ? AND user_id = ?
    `);
    return stmt.run(postId, userId).changes > 0;
  }

  static addComment(postId, userId, content) {
    const stmt = db.prepare(`
      INSERT INTO post_comments (post_id, user_id, content)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(postId, userId, content);
    
    // Get the comment with user info
    const commentStmt = db.prepare(`
      SELECT c.*, u.username, u.avatar
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `);
    return commentStmt.get(result.lastInsertRowid);
  }

  static getComments(postId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT c.*, u.username, u.avatar
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(postId, limit, offset);
  }

  static deleteComment(commentId, userId) {
    const stmt = db.prepare(`
      DELETE FROM post_comments WHERE id = ? AND user_id = ?
    `);
    return stmt.run(commentId, userId);
  }
}

export default Post;
