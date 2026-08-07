const db = require('../config/db');

const timetableModel = {
  getTimetableByDeptAndYear: async (deptId, year, semester = 1) => {
    return db.query(
      `SELECT t.*, s.subject_name, s.subject_code, d.dept_name AS department
       FROM timetables t
       JOIN subjects s ON t.subject_id = s.id
       JOIN departments d ON t.department_id = d.id
       WHERE t.department_id = ? AND t.year = ? AND t.semester = ? AND t.deleted_at IS NULL
       ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time ASC`,
      [deptId, year, semester]
    );
  },

  createTimetableSlot: async ({ department_id, subject_id, year = 1, semester = 1, day_of_week, start_time, end_time, room }) => {
    const result = await db.query(
      `INSERT INTO timetables (department_id, subject_id, year, semester, day_of_week, start_time, end_time, room)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [department_id, subject_id, year, semester, day_of_week, start_time, end_time, room]
    );
    return { id: result.insertId, department_id, subject_id, day_of_week, start_time, end_time, room };
  },

  softDeleteSlot: async (id) => {
    await db.query(`UPDATE timetables SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = timetableModel;
