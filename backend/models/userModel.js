const db = require('../config/db');

/**
 * User Data Access Model (Enterprise Soft-Delete & Parameterized Queries)
 */
const userModel = {
  findUserByEmail: async (email) => {
    const rows = await db.query(
      `SELECT u.*, r.role_name AS role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND u.deleted_at IS NULL`,
      [email]
    );
    return rows[0] || null;
  },

  findUserById: async (id) => {
    const rows = await db.query(
      `SELECT u.id, u.firebase_uid, u.name, u.email, u.role_id, r.role_name AS role, u.is_active, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  findUserByFirebaseUid: async (firebaseUid) => {
    const rows = await db.query(
      `SELECT u.*, r.role_name AS role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.firebase_uid = ? AND u.deleted_at IS NULL`,
      [firebaseUid]
    );
    return rows[0] || null;
  },

  findUserByEmailOrRegisterNumber: async (identifier) => {
    // Check direct email
    let rows = await db.query(
      `SELECT u.*, r.role_name AS role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE (u.email = ? OR u.firebase_uid = ?) AND u.deleted_at IS NULL`,
      [identifier, identifier]
    );
    if (rows.length > 0) return rows[0];

    // Check student register number mapping
    rows = await db.query(
      `SELECT u.*, r.role_name AS role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       JOIN students s ON s.user_id = u.id 
       WHERE s.register_number = ? AND u.deleted_at IS NULL AND s.deleted_at IS NULL`,
      [identifier]
    );
    return rows[0] || null;
  },

  createUser: async ({ name, email, password, firebase_uid = null, role = 'staff', role_id = null }) => {
    let roleId = role_id;
    if (!roleId) {
      const roleRows = await db.query(`SELECT id FROM roles WHERE role_name = ?`, [role]);
      roleId = roleRows[0] ? roleRows[0].id : 2;
    }

    const result = await db.query(
      `INSERT INTO users (role_id, firebase_uid, name, email, password) VALUES (?, ?, ?, ?, ?)`,
      [roleId, firebase_uid, name, email, password]
    );

    return {
      id: result.insertId,
      firebase_uid,
      name,
      email,
      role_id: roleId,
      role
    };
  },

  updateRefreshToken: async (userId, refreshToken) => {
    // Save to users table
    await db.query(
      `UPDATE users SET refresh_token = ? WHERE id = ?`,
      [refreshToken, userId]
    );

    // Also record in refresh_tokens table for security tracking
    const expiry = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, refreshToken, expiry]
    );
  },

  updateResetToken: async (userId, resetToken, expiry) => {
    await db.query(
      `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
      [resetToken, expiry, userId]
    );
  },

  findUserByResetToken: async (token) => {
    const rows = await db.query(
      `SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND deleted_at IS NULL`,
      [token]
    );
    return rows[0] || null;
  },

  softDeleteUser: async (id) => {
    await db.query(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = userModel;

