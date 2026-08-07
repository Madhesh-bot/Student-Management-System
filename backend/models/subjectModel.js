const db = require('../config/db');

const subjectModel = {
  getAllSubjects: async () => {
    return db.query(
      `SELECT s.*, d.dept_name AS department
       FROM subjects s
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.deleted_at IS NULL
       ORDER BY s.subject_name ASC`
    );
  },

  getSubjectsByDepartment: async (deptId) => {
    return db.query(
      `SELECT * FROM subjects WHERE department_id = ? AND deleted_at IS NULL ORDER BY subject_name ASC`,
      [deptId]
    );
  },

  createSubject: async ({ department_id, semester_id = null, subject_name, subject_code, credits = 3, max_internal = 20, max_assignment = 10, max_practical = 20, max_semester = 50, pass_mark = 40 }) => {
    const result = await db.query(
      `INSERT INTO subjects (department_id, semester_id, subject_name, subject_code, credits, max_internal, max_assignment, max_practical, max_semester, pass_mark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [department_id, semester_id, subject_name, subject_code, credits, max_internal, max_assignment, max_practical, max_semester, pass_mark]
    );
    return { id: result.insertId, subject_name, subject_code, credits };
  },

  softDeleteSubject: async (id) => {
    await db.query(`UPDATE subjects SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = subjectModel;
