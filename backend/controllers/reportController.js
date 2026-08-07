const db = require('../config/db');
const { successResponse } = require('../utils/responseFormatter');

/**
 * @desc    Generate student breakdown reports
 * @route   GET /api/reports/students
 * @access  Private (Admin/Staff)
 */
const getStudentReport = async (req, res, next) => {
  try {
    const totalRows = await db.query('SELECT COUNT(*) AS total FROM students WHERE deleted_at IS NULL');
    const totalStudents = totalRows[0] ? totalRows[0].total : 0;

    const deptRows = await db.query(`
      SELECT COALESCE(d.dept_name, 'Unassigned') AS department, COUNT(s.id) AS count 
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id AND d.deleted_at IS NULL
      WHERE s.deleted_at IS NULL
      GROUP BY d.id, d.dept_name
      ORDER BY count DESC
    `);

    const yearRows = await db.query(`
      SELECT s.year, COUNT(s.id) AS count 
      FROM students s
      WHERE s.deleted_at IS NULL
      GROUP BY s.year 
      ORDER BY s.year ASC
    `);

    const genderRows = await db.query(`
      SELECT s.gender, COUNT(s.id) AS count 
      FROM students s
      WHERE s.deleted_at IS NULL
      GROUP BY s.gender
    `);

    return successResponse(res, 'Student breakdown report calculated successfully', {
      totalStudents,
      departments: deptRows,
      years: yearRows,
      gender: genderRows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate student attendance statistics
 * @route   GET /api/reports/attendance
 * @access  Private (Admin/Staff)
 */
const getAttendanceReport = async (req, res, next) => {
  try {
    const distributionRows = await db.query(`
      SELECT status, COUNT(*) AS count, 
             ROUND((COUNT(*) * 100.0) / NULLIF((SELECT COUNT(*) FROM attendance WHERE deleted_at IS NULL), 0), 2) AS percentage
      FROM attendance
      WHERE deleted_at IS NULL
      GROUP BY status
    `);

    const studentSummaryRows = await db.query(`
      SELECT s.id, s.student_name, s.register_number, COALESCE(d.dept_name, 'General') AS department, s.year, s.section,
             COUNT(a.id) AS total_days,
             SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS days_present,
             SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS days_absent,
             SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS days_late,
             SUM(CASE WHEN a.status = 'Leave' THEN 1 ELSE 0 END) AS days_excused,
             ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(a.id), 0), 2) AS attendance_percentage
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id AND d.deleted_at IS NULL
      LEFT JOIN attendance a ON s.id = a.student_id AND a.deleted_at IS NULL
      WHERE s.deleted_at IS NULL
      GROUP BY s.id, d.dept_name
      ORDER BY s.student_name ASC
    `);

    return successResponse(res, 'Attendance report calculated successfully', {
      statusDistribution: distributionRows,
      studentSummary: studentSummaryRows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate grades and marks statistics
 * @route   GET /api/reports/marks
 * @access  Private (Admin/Staff)
 */
const getMarksReport = async (req, res, next) => {
  try {
    const subjectReportRows = await db.query(`
      SELECT m.subject,
             COUNT(m.student_id) AS total_graded,
             ROUND(AVG(m.internal_mark), 2) AS avg_internal,
             ROUND(AVG(m.semester_mark), 2) AS avg_semester,
             ROUND(AVG(m.total_mark), 2) AS avg_total,
             MAX(m.total_mark) AS max_total,
             MIN(m.total_mark) AS min_total,
             SUM(CASE WHEN m.total_mark >= 40.00 THEN 1 ELSE 0 END) AS total_passed,
             ROUND((SUM(CASE WHEN m.total_mark >= 40.00 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(m.student_id), 0), 2) AS pass_percentage
      FROM marks m
      WHERE m.deleted_at IS NULL
      GROUP BY m.subject
      ORDER BY m.subject ASC
    `);

    const performanceRows = await db.query(`
      SELECT s.id, s.student_name, s.register_number, COALESCE(d.dept_name, 'General') AS department,
             COUNT(m.id) AS subjects_count,
             ROUND(AVG(m.internal_mark), 2) AS avg_internal,
             ROUND(AVG(m.semester_mark), 2) AS avg_semester,
             ROUND(AVG(m.total_mark), 2) AS gpa_percentage
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id AND d.deleted_at IS NULL
      JOIN marks m ON s.id = m.student_id AND m.deleted_at IS NULL
      WHERE s.deleted_at IS NULL
      GROUP BY s.id, d.dept_name
      ORDER BY gpa_percentage DESC
    `);

    return successResponse(res, 'Marks and grades report calculated successfully', {
      subjectStatistics: subjectReportRows,
      topPerformers: performanceRows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentReport,
  getAttendanceReport,
  getMarksReport
};
