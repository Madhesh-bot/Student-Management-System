const subjectModel = require('../models/subjectModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getSubjects = async (req, res, next) => {
  try {
    const { department_id } = req.query;
    let subjects;
    if (department_id) {
      subjects = await subjectModel.getSubjectsByDepartment(department_id);
    } else {
      subjects = await subjectModel.getAllSubjects();
    }
    return successResponse(res, 'Subjects retrieved successfully', subjects);
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { department_id, subject_name, subject_code } = req.body;
    if (!department_id || !subject_name || !subject_code) {
      return errorResponse(res, 'department_id, subject_name, and subject_code are required', 400);
    }
    const newSubject = await subjectModel.createSubject(req.body);
    return successResponse(res, 'Subject created successfully', newSubject, 201);
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await subjectModel.softDeleteSubject(id);
    return successResponse(res, 'Subject deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  createSubject,
  deleteSubject
};
