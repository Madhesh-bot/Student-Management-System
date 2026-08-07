const db = require('../config/db');

/**
 * Attendance Data Access Model
 */
const attendanceModel = {
  getAttendanceByDate: async (date) => {
    const rows = await db.query(
      `SELECT a.*, s.student_name, s.register_number, d.dept_name AS department
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE a.date = ? AND a.deleted_at IS NULL
       ORDER BY s.register_number ASC`,
      [date]
    );
    return rows;
  },

  getAttendanceByStudentId: async (studentId) => {
    const rows = await db.query(
      `SELECT a.*, s.student_name, s.register_number
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.student_id = ? AND a.deleted_at IS NULL
       ORDER BY a.date DESC`,
      [studentId]
    );
    return rows;
  },

  upsertAttendance: async ({ student_id, date, status, remarks = null, created_by = null }) => {
    const existing = await db.query(
      `SELECT id FROM attendance WHERE student_id = ? AND date = ? AND deleted_at IS NULL`,
      [student_id, date]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE attendance SET status = ?, remarks = COALESCE(?, remarks) WHERE id = ?`,
        [status, remarks, existing[0].id]
      );
      return { id: existing[0].id, student_id, date, status, remarks };
    } else {
      const result = await db.query(
        `INSERT INTO attendance (student_id, date, status, remarks, created_by) VALUES (?, ?, ?, ?, ?)`,
        [student_id, date, status, remarks, created_by]
      );
      return { id: result.insertId, student_id, date, status, remarks };
    }
  },

  updateAttendanceById: async (id, status, remarks = null) => {
    await db.query(
      `UPDATE attendance SET status = ?, remarks = COALESCE(?, remarks) WHERE id = ? AND deleted_at IS NULL`,
      [status, remarks, id]
    );
    const rows = await db.query(`SELECT * FROM attendance WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  softDeleteAttendance: async (id) => {
    await db.query(`UPDATE attendance SET deleted_at = NOW() WHERE id = ?`, [id]);
  },

  getAllAttendanceRecords: async () => {
    const rows = await db.query(
      `SELECT a.*, s.student_name, s.register_number, d.dept_name AS department
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE a.deleted_at IS NULL
       ORDER BY a.date DESC, s.register_number ASC`
    );
    return rows;
  }
};

module.exports = attendanceModel;

