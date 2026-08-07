const db = require('../config/db');

const resultModel = {
  getResultByStudentId: async (studentId) => {
    const rows = await db.query(
      `SELECT r.*, s.student_name, s.register_number, d.dept_name AS department
       FROM student_results r
       JOIN students s ON r.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE r.student_id = ? AND r.deleted_at IS NULL
       ORDER BY r.id DESC`,
      [studentId]
    );
    return rows[0] || null;
  },

  getAllResults: async () => {
    return db.query(
      `SELECT r.*, s.student_name, s.register_number, d.dept_name AS department
       FROM student_results r
       JOIN students s ON r.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE r.deleted_at IS NULL
       ORDER BY s.register_number ASC`
    );
  }
};

module.exports = resultModel;
