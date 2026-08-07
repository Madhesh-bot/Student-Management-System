const departmentModel = require('../models/departmentModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentModel.getAllDepartments();
    return successResponse(res, 'Departments retrieved successfully', departments);
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { dept_name, code, hod_name } = req.body;
    if (!dept_name || !code) {
      return errorResponse(res, 'dept_name and code are required', 400);
    }
    const newDept = await departmentModel.createDepartment({ dept_name, code, hod_name });
    return successResponse(res, 'Department created successfully', newDept, 201);
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await departmentModel.softDeleteDepartment(id);
    return successResponse(res, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  deleteDepartment
};
