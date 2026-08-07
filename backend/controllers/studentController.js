const studentModel = require('../models/studentModel');
const { getStudentAttendanceMetrics } = require('../services/attendanceService');
const resultModel = require('../models/resultModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAction } = require('../services/auditService');

/**
 * Get Current Logged-in Student Profile (Student Role)
 */
const getCurrentStudentProfile = async (req, res, next) => {
  try {
    const student = await studentModel.findByEmailOrRegister(req.user.email, '');
    if (!student) {
      return errorResponse(res, 'Student profile not found for this user account', 404);
    }
    const fullStudent = await studentModel.getStudentById(student.id);
    const attendanceMetrics = await getStudentAttendanceMetrics(student.id);
    const academicResult = await resultModel.getResultByStudentId(student.id);

    return successResponse(res, 'Current student profile details', {
      student: fullStudent,
      attendanceMetrics,
      academicResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Paginated List of Students
 */
const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', department_id } = req.query;
    const result = await studentModel.getAllStudents({ page, limit, search, department_id });
    return successResponse(res, 'Students retrieved successfully', result.students, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Details by ID
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentModel.getStudentById(id);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    const attendanceMetrics = await getStudentAttendanceMetrics(id);
    const academicResult = await resultModel.getResultByStudentId(id);

    return successResponse(res, 'Student profile details retrieved', {
      student,
      attendanceMetrics,
      academicResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add New Student
 */
const addStudent = async (req, res, next) => {
  try {
    const { register_number, student_name, email } = req.body;
    if (!register_number || !student_name || !email) {
      return errorResponse(res, 'Please provide register_number, student_name, and email', 400);
    }

    const exists = await studentModel.findByEmailOrRegister(email, register_number);
    if (exists) {
      return errorResponse(res, 'Student profile already exists with this email or register number', 400);
    }

    const newStudent = await studentModel.addStudent(req.body);

    await logAction({
      userId: req.user.id,
      action: 'STUDENT_ADD',
      entity: 'students',
      entityId: newStudent.id,
      newValues: newStudent,
      ipAddress: req.ip
    });

    return successResponse(res, 'Student profile added successfully', newStudent, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Student Profile
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await studentModel.updateStudent(id, req.body);
    if (!updated) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    await logAction({
      userId: req.user.id,
      action: 'STUDENT_UPDATE',
      entity: 'students',
      entityId: id,
      newValues: updated,
      ipAddress: req.ip
    });

    return successResponse(res, 'Student profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Student Profile
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await studentModel.softDeleteStudent(id);

    await logAction({
      userId: req.user.id,
      action: 'STUDENT_DELETE',
      entity: 'students',
      entityId: id,
      ipAddress: req.ip
    });

    return successResponse(res, 'Student profile deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentStudentProfile,
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent
};
