const db = require('../config/db');

const staffModel = {
  getAllStaff: async () => {
    return db.query(
      `SELECT st.*, d.dept_name AS department, d.code AS dept_code
       FROM staff st
       LEFT JOIN departments d ON st.department_id = d.id
       WHERE st.deleted_at IS NULL
       ORDER BY st.name ASC`
    );
  },

  getStaffById: async (id) => {
    const rows = await db.query(
      `SELECT st.*, d.dept_name AS department, d.code AS dept_code
       FROM staff st
       LEFT JOIN departments d ON st.department_id = d.id
       WHERE st.id = ? AND st.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  createStaff: async ({ user_id, department_id, staff_code, name, email, phone = null, designation = 'Assistant Professor' }) => {
    const result = await db.query(
      `INSERT INTO staff (user_id, department_id, staff_code, name, email, phone, designation)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, department_id, staff_code, name, email, phone, designation]
    );
    return { id: result.insertId, staff_code, name, email, designation };
  },

  softDeleteStaff: async (id) => {
    await db.query(`UPDATE staff SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = staffModel;
