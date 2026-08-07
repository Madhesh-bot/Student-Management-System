const courseModel = require('../models/courseModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getCourses = async (req, res, next) => {
  try {
    const courses = await courseModel.getAllCourses();
    return successResponse(res, 'Courses retrieved', courses);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { department_id, course_name, course_code } = req.body;
    if (!department_id || !course_name || !course_code) {
      return errorResponse(res, 'department_id, course_name, and course_code are required', 400);
    }
    const newCourse = await courseModel.createCourse(req.body);
    return successResponse(res, 'Course created', newCourse, 201);
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await courseModel.softDeleteCourse(id);
    return successResponse(res, 'Course deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  createCourse,
  deleteCourse
};
