const db = require('../config/db');

/**
 * Notification Data Access Model
 */
const notificationModel = {
  getUserNotifications: async (userId) => {
    const rows = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? AND deleted_at IS NULL 
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  getAllNotifications: async () => {
    const rows = await db.query(
      `SELECT n.*, u.name as user_name, u.email as user_email
       FROM notifications n
       JOIN users u ON n.user_id = u.id
       WHERE n.deleted_at IS NULL
       ORDER BY n.created_at DESC`
    );
    return rows;
  },

  createNotification: async ({ user_id, title, message, type = 'info' }) => {
    const result = await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [user_id, title, message, type]
    );
    return {
      id: result.insertId,
      user_id,
      title,
      message,
      type
    };
  },

  markAsRead: async (id, userId) => {
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return true;
  }
};

module.exports = notificationModel;
