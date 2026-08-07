const db = require('../config/db');

const courseModel = {
  getAllCourses: async () => {
    return db.query(
      `SELECT c.*, d.dept_name AS department
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.deleted_at IS NULL
       ORDER BY c.course_name ASC`
    );
  },

  createCourse: async ({ department_id, course_name, course_code, total_semesters = 8 }) => {
    const result = await db.query(
      `INSERT INTO courses (department_id, course_name, course_code, total_semesters) VALUES (?, ?, ?, ?)`,
      [department_id, course_name, course_code, total_semesters]
    );
    return { id: result.insertId, course_name, course_code, total_semesters };
  },

  softDeleteCourse: async (id) => {
    await db.query(`UPDATE courses SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = courseModel;
