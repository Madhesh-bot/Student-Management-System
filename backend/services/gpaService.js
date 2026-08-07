const db = require('../config/db');

/**
 * Calculate grade and grade point from grade_scale table
 */
const calculateGrade = async (percentage) => {
  const scales = await db.query(
    `SELECT grade, grade_point, min_score, max_score, description FROM grade_scale 
     WHERE deleted_at IS NULL ORDER BY min_score DESC`
  );

  for (const scale of scales) {
    if (percentage >= Number(scale.min_score)) {
      return {
        grade: scale.grade,
        gradePoint: Number(scale.grade_point)
      };
    }
  }

  return { grade: 'F', gradePoint: 0.0 };
};

/**
 * Recalculate student semester GPA and cumulative CGPA and save to student_results
 */
const generateStudentResult = async (studentId, semesterId = null) => {
  // 1. Fetch all student active marks joined with subject details
  const marks = await db.query(
    `SELECT m.*, s.credits, s.pass_mark 
     FROM marks m 
     LEFT JOIN subjects s ON m.subject_id = s.id 
     WHERE m.student_id = ? AND m.deleted_at IS NULL`,
    [studentId]
  );

  if (marks.length === 0) {
    return {
      totalMarksObtained: 0,
      totalMaxMarks: 0,
      gpa: 0.0,
      cgpa: 0.0,
      resultStatus: 'Pending'
    };
  }

  let totalObtained = 0;
  let totalMax = 0;
  let totalWeightedGradePoints = 0;
  let totalCredits = 0;
  let hasFailed = false;

  for (const m of marks) {
    const totalMark = Number(m.total_mark);
    const maxMark = Number(m.max_mark) || 100.0;
    const credits = Number(m.credits) || 3;
    const gradePoint = Number(m.grade_point) || 0;

    totalObtained += totalMark;
    totalMax += maxMark;
    totalWeightedGradePoints += (credits * gradePoint);
    totalCredits += credits;

    if (m.result_status === 'Fail') {
      hasFailed = true;
    }
  }

  const gpa = totalCredits > 0 ? parseFloat((totalWeightedGradePoints / totalCredits).toFixed(2)) : 0.0;
  const cgpa = gpa; // Cumulative for current recorded evaluation
  const resultStatus = hasFailed ? 'Fail' : 'Pass';

  // Check if result record already exists
  const existingResults = await db.query(
    `SELECT id FROM student_results 
     WHERE student_id = ? AND (semester_id = ? OR (semester_id IS NULL AND ? IS NULL)) AND deleted_at IS NULL`,
    [studentId, semesterId, semesterId]
  );

  if (existingResults.length > 0) {
    await db.query(
      `UPDATE student_results 
       SET total_marks_obtained = ?, total_max_marks = ?, gpa = ?, cgpa = ?, result_status = ?, generated_at = NOW()
       WHERE id = ?`,
      [totalObtained, totalMax, gpa, cgpa, resultStatus, existingResults[0].id]
    );
  } else {
    await db.query(
      `INSERT INTO student_results (student_id, semester_id, total_marks_obtained, total_max_marks, gpa, cgpa, result_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, semesterId, totalObtained, totalMax, gpa, cgpa, resultStatus]
    );
  }

  return {
    totalMarksObtained: totalObtained,
    totalMaxMarks: totalMax,
    gpa,
    cgpa,
    resultStatus
  };
};

module.exports = {
  calculateGrade,
  generateStudentResult
};
