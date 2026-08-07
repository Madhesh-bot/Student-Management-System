const leaveModel = require('../models/leaveModel');
const studentModel = require('../models/studentModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getLeaves = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    let leaves;

    if (studentId) {
      leaves = await leaveModel.getLeavesByStudentId(studentId);
    } else if (req.user && req.user.role === 'student') {
      const student = await studentModel.findByEmailOrRegister(req.user.email, '');
      if (student) {
        leaves = await leaveModel.getLeavesByStudentId(student.id);
      } else {
        leaves = [];
      }
    } else {
      leaves = await leaveModel.getAllLeaveRequests();
    }

    return successResponse(res, 'Leave requests retrieved successfully', leaves);
  } catch (error) {
    next(error);
  }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    let { student_id, start_date, end_date, reason } = req.body;

    if (!student_id && req.user && req.user.role === 'student') {
      const student = await studentModel.findByEmailOrRegister(req.user.email, '');
      if (student) {
        student_id = student.id;
      }
    }

    if (!student_id || !start_date || !end_date || !reason) {
      return errorResponse(res, 'student_id, start_date, end_date, and reason are required', 400);
    }

    const leave = await leaveModel.createLeaveRequest({ student_id, start_date, end_date, reason });
    return successResponse(res, 'Leave request submitted successfully', leave, 201);
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;
    const updated = await leaveModel.updateLeaveStatus(id, status, admin_remarks);
    return successResponse(res, 'Leave request status updated', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaves,
  createLeaveRequest,
  updateLeaveStatus
};
