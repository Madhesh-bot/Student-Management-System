const attendanceModel = require('../models/attendanceModel');
const { getStudentAttendanceMetrics } = require('../services/attendanceService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAction } = require('../services/auditService');

/**
 * Get Attendance Records by Date or Student ID
 */
const getAttendance = async (req, res, next) => {
  try {
    const { date, studentId } = req.query;

    if (date) {
      const records = await attendanceModel.getAttendanceByDate(date);
      return successResponse(res, `Attendance logs for ${date}`, records);
    }

    if (studentId) {
      const records = await attendanceModel.getAttendanceByStudentId(studentId);
      const metrics = await getStudentAttendanceMetrics(studentId);
      return successResponse(res, `Attendance report for student #${studentId}`, {
        logs: records,
        metrics
      });
    }

    // Default: fetch all active attendance records
    const records = await attendanceModel.getAllAttendanceRecords();
    return successResponse(res, 'All attendance logs retrieved successfully', records);
  } catch (error) {
    next(error);
  }
};


/**
 * Log or Upsert Daily Attendance Record
 */
const upsertAttendance = async (req, res, next) => {
  try {
    const { student_id, date, status, remarks } = req.body;

    const record = await attendanceModel.upsertAttendance({
      student_id,
      date,
      status,
      remarks,
      created_by: req.user.id
    });

    await logAction({
      userId: req.user.id,
      action: 'ATTENDANCE_LOG',
      entity: 'attendance',
      entityId: record.id,
      newValues: record,
      ipAddress: req.ip
    });

    return successResponse(res, 'Attendance status logged successfully', record, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Attendance Status by Record ID
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const record = await attendanceModel.updateAttendanceById(id, status, remarks);
    if (!record) {
      return errorResponse(res, 'Attendance record not found', 404);
    }

    await logAction({
      userId: req.user.id,
      action: 'ATTENDANCE_UPDATE',
      entity: 'attendance',
      entityId: id,
      newValues: record,
      ipAddress: req.ip
    });

    return successResponse(res, 'Attendance record updated successfully', record);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Attendance Record
 */
const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    await attendanceModel.softDeleteAttendance(id);

    await logAction({
      userId: req.user.id,
      action: 'ATTENDANCE_DELETE',
      entity: 'attendance',
      entityId: id,
      ipAddress: req.ip
    });

    return successResponse(res, 'Attendance record deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Attendance Metrics (Overall %, Monthly, Yearly)
 */
const getAttendanceMetrics = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const metrics = await getStudentAttendanceMetrics(studentId);
    return successResponse(res, 'Student attendance metrics calculated', metrics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  upsertAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceMetrics
};
