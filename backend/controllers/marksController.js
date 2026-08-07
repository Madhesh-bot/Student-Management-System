const marksModel = require('../models/marksModel');
const { generateStudentResult } = require('../services/gpaService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAction } = require('../services/auditService');

/**
 * Get Marks by Student or Subject
 */
const getMarks = async (req, res, next) => {
  try {
    const { studentId, subject } = req.query;

    if (studentId) {
      const marks = await marksModel.getMarksByStudentId(studentId);
      return successResponse(res, 'Student marks retrieved', marks);
    }

    if (subject) {
      const marks = await marksModel.getMarksBySubject(subject);
      return successResponse(res, 'Subject marks retrieved', marks);
    }

    const marks = await marksModel.getAllMarks();
    return successResponse(res, 'All marks retrieved', marks);
  } catch (error) {
    next(error);
  }
};

/**
 * Add / Upsert Marks (Admin / Staff)
 */
const upsertMarks = async (req, res, next) => {
  try {
    const { student_id, subject_id, subject, internal_mark = 0, assignment_mark = 0, practical_mark = 0, semester_mark = 0, max_mark = 100 } = req.body;

    if (!student_id || !subject) {
      return errorResponse(res, 'Please provide student_id and subject', 400);
    }

    const result = await marksModel.upsertMarks({
      student_id,
      subject_id,
      subject,
      internal_mark,
      assignment_mark,
      practical_mark,
      semester_mark,
      max_mark
    });

    // Auto update student GPA/CGPA summary result
    await generateStudentResult(student_id);

    await logAction({
      userId: req.user.id,
      action: 'MARKS_UPSERT',
      entity: 'marks',
      entityId: result.id,
      newValues: result,
      ipAddress: req.ip
    });

    return successResponse(res, 'Marks recorded successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Marks by Record ID
 */
const updateMarks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await marksModel.updateMarksById(id, req.body);
    if (!result) {
      return errorResponse(res, 'Marks record not found', 404);
    }

    await generateStudentResult(result.student_id);

    await logAction({
      userId: req.user.id,
      action: 'MARKS_UPDATE',
      entity: 'marks',
      entityId: id,
      newValues: result,
      ipAddress: req.ip
    });

    return successResponse(res, 'Marks record updated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Marks Record by ID
 */
const deleteMarks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await require('../config/db').query(`SELECT student_id FROM marks WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Marks record not found', 404);
    }

    const studentId = existing[0].student_id;
    await marksModel.softDeleteMarks(id);
    await generateStudentResult(studentId);

    await logAction({
      userId: req.user.id,
      action: 'MARKS_DELETE',
      entity: 'marks',
      entityId: id,
      ipAddress: req.ip
    });

    return successResponse(res, 'Marks record deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Student Semester Result & Cumulative CGPA
 */
const generateResult = async (req, res, next) => {
  try {
    const { studentId, semesterId } = req.body;
    if (!studentId) {
      return errorResponse(res, 'Student ID is required', 400);
    }

    const result = await generateStudentResult(studentId, semesterId || null);
    return successResponse(res, 'Student result & CGPA generated successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarks,
  upsertMarks,
  updateMarks,
  deleteMarks,
  generateResult
};
