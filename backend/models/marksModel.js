const db = require('../config/db');
const { calculateGrade } = require('../services/gpaService');

/**
 * Marks Data Access Model (Enterprise Component Storage & Calculations)
 */
const marksModel = {
  getMarksByStudentId: async (studentId) => {
    const rows = await db.query(
      `SELECT m.*, s.student_name, s.register_number
       FROM marks m
       JOIN students s ON m.student_id = s.id
       WHERE m.student_id = ? AND m.deleted_at IS NULL
       ORDER BY m.id ASC`,
      [studentId]
    );
    return rows;
  },

  getMarksBySubject: async (subjectName) => {
    const rows = await db.query(
      `SELECT m.*, s.student_name, s.register_number, s.department_id
       FROM marks m
       JOIN students s ON m.student_id = s.id
       WHERE m.subject LIKE ? AND m.deleted_at IS NULL
       ORDER BY s.register_number ASC`,
      [`%${subjectName}%`]
    );
    return rows;
  },

  getAllMarks: async () => {
    const rows = await db.query(
      `SELECT m.*, s.student_name, s.register_number
       FROM marks m
       JOIN students s ON m.student_id = s.id
       WHERE m.deleted_at IS NULL
       ORDER BY m.id DESC`
    );
    return rows;
  },

  upsertMarks: async ({
    student_id,
    subject_id = null,
    subject,
    internal_mark = 0,
    assignment_mark = 0,
    practical_mark = 0,
    semester_mark = 0,
    max_mark = 100
  }) => {
    const totalMark = Number(internal_mark) + Number(assignment_mark) + Number(practical_mark) + Number(semester_mark);
    const percentage = max_mark > 0 ? (totalMark / max_mark) * 100 : 0;

    const { grade, gradePoint } = await calculateGrade(percentage);
    const resultStatus = percentage >= 40.0 ? 'Pass' : 'Fail';

    // Insert or update existing student-subject mark record
    const existing = await db.query(
      `SELECT id FROM marks WHERE student_id = ? AND subject = ? AND deleted_at IS NULL`,
      [student_id, subject]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE marks 
         SET internal_mark = ?, assignment_mark = ?, practical_mark = ?, semester_mark = ?,
             total_mark = ?, max_mark = ?, grade = ?, grade_point = ?, result_status = ?, deleted_at = NULL
         WHERE id = ?`,
        [internal_mark, assignment_mark, practical_mark, semester_mark, totalMark, max_mark, grade, gradePoint, resultStatus, existing[0].id]
      );
      return { id: existing[0].id, student_id, subject, internal_mark, assignment_mark, practical_mark, semester_mark, total_mark: totalMark, grade, grade_point: gradePoint, result_status: resultStatus };
    } else {
      const result = await db.query(
        `INSERT INTO marks 
         (student_id, subject_id, subject, internal_mark, assignment_mark, practical_mark, semester_mark, total_mark, max_mark, grade, grade_point, result_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, subject_id, subject, internal_mark, assignment_mark, practical_mark, semester_mark, totalMark, max_mark, grade, gradePoint, resultStatus]
      );
      return { id: result.insertId, student_id, subject, internal_mark, assignment_mark, practical_mark, semester_mark, total_mark: totalMark, grade, grade_point: gradePoint, result_status: resultStatus };
    }
  },

  updateMarksById: async (id, data) => {
    const existingRows = await db.query(`SELECT * FROM marks WHERE id = ? AND deleted_at IS NULL`, [id]);
    if (existingRows.length === 0) return null;

    const current = existingRows[0];
    const internal_mark = data.internal_mark !== undefined ? Number(data.internal_mark) : Number(current.internal_mark);
    const assignment_mark = data.assignment_mark !== undefined ? Number(data.assignment_mark) : Number(current.assignment_mark);
    const practical_mark = data.practical_mark !== undefined ? Number(data.practical_mark) : Number(current.practical_mark);
    const semester_mark = data.semester_mark !== undefined ? Number(data.semester_mark) : Number(current.semester_mark);
    const max_mark = data.max_mark !== undefined ? Number(data.max_mark) : Number(current.max_mark);

    const totalMark = internal_mark + assignment_mark + practical_mark + semester_mark;
    const percentage = max_mark > 0 ? (totalMark / max_mark) * 100 : 0;
    const { grade, gradePoint } = await calculateGrade(percentage);
    const resultStatus = percentage >= 40.0 ? 'Pass' : 'Fail';

    await db.query(
      `UPDATE marks 
       SET internal_mark = ?, assignment_mark = ?, practical_mark = ?, semester_mark = ?,
           total_mark = ?, max_mark = ?, grade = ?, grade_point = ?, result_status = ?
       WHERE id = ?`,
      [internal_mark, assignment_mark, practical_mark, semester_mark, totalMark, max_mark, grade, gradePoint, resultStatus, id]
    );

    return { id, student_id: current.student_id, subject: current.subject, internal_mark, assignment_mark, practical_mark, semester_mark, total_mark: totalMark, grade, grade_point: gradePoint, result_status: resultStatus };
  },

  softDeleteMarks: async (id) => {
    await db.query(`UPDATE marks SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = marksModel;
