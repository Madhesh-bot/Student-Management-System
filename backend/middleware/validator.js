const { errorResponse } = require('../utils/responseFormatter');

/**
 * Validate Registration Payload
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return errorResponse(res, 'Name, email, and password are required', 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return errorResponse(res, 'Please provide a valid email address', 400);
  }
  if (password.length < 4) {
    return errorResponse(res, 'Password must be at least 4 characters long', 400);
  }
  next();
};

/**
 * Validate Marks Payload
 */
const validateMarks = (req, res, next) => {
  const { student_id, internal_mark, assignment_mark, practical_mark, semester_mark } = req.body;

  if (!student_id && req.method === 'POST') {
    return errorResponse(res, 'Student ID is required', 400);
  }

  const checkMark = (val, name, max) => {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        return `${name} must be a non-negative number`;
      }
      if (max !== undefined && num > max) {
        return `${name} cannot exceed maximum allowed limit of ${max}`;
      }
    }
    return null;
  };

  const err = checkMark(internal_mark, 'Internal mark', 50) ||
              checkMark(assignment_mark, 'Assignment mark', 30) ||
              checkMark(practical_mark, 'Practical mark', 50) ||
              checkMark(semester_mark, 'Semester mark', 100);

  if (err) {
    return errorResponse(res, err, 400);
  }

  next();
};

/**
 * Validate Attendance Payload
 */
const validateAttendance = (req, res, next) => {
  const { student_id, date, status } = req.body;

  if (req.method === 'POST') {
    if (!student_id || !date || !status) {
      return errorResponse(res, 'Student ID, date, and status are required', 400);
    }
  }

  const validStatuses = ['Present', 'Absent', 'Late', 'Leave'];
  if (status && !validStatuses.includes(status)) {
    return errorResponse(res, `Status must be one of: ${validStatuses.join(', ')}`, 400);
  }

  if (date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return errorResponse(res, 'Invalid date format (expected YYYY-MM-DD)', 400);
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateMarks,
  validateAttendance
};
