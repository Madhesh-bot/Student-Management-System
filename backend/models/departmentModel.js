const db = require('../config/db');

const departmentModel = {
  getAllDepartments: async () => {
    return db.query(`SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY dept_name ASC`);
  },

  getDepartmentById: async (id) => {
    const rows = await db.query(`SELECT * FROM departments WHERE id = ? AND deleted_at IS NULL`, [id]);
    return rows[0] || null;
  },

  createDepartment: async ({ dept_name, code, hod_name = null }) => {
    const result = await db.query(
      `INSERT INTO departments (dept_name, code, hod_name) VALUES (?, ?, ?)`,
      [dept_name, code, hod_name]
    );
    return { id: result.insertId, dept_name, code, hod_name };
  },

  softDeleteDepartment: async (id) => {
    await db.query(`UPDATE departments SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = departmentModel;
