const db = require('../config/db');

const leaveModel = {
  getAllLeaveRequests: async () => {
    return db.query(
      `SELECT l.*, s.student_name, s.register_number
       FROM leave_requests l
       JOIN students s ON l.student_id = s.id
       WHERE l.deleted_at IS NULL
       ORDER BY l.id DESC`
    );
  },

  getLeavesByStudentId: async (studentId) => {
    return db.query(
      `SELECT * FROM leave_requests WHERE student_id = ? AND deleted_at IS NULL ORDER BY id DESC`,
      [studentId]
    );
  },

  createLeaveRequest: async ({ student_id, start_date, end_date, reason }) => {
    const result = await db.query(
      `INSERT INTO leave_requests (student_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)`,
      [student_id, start_date, end_date, reason]
    );
    return { id: result.insertId, student_id, start_date, end_date, reason, status: 'Pending' };
  },

  updateLeaveStatus: async (id, status, admin_remarks = null) => {
    await db.query(
      `UPDATE leave_requests SET status = ?, admin_remarks = COALESCE(?, admin_remarks) WHERE id = ? AND deleted_at IS NULL`,
      [status, admin_remarks, id]
    );
    const rows = await db.query(`SELECT * FROM leave_requests WHERE id = ?`, [id]);
    return rows[0] || null;
  }
};

module.exports = leaveModel;
