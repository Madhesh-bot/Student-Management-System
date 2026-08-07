const staffModel = require('../models/staffModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getStaff = async (req, res, next) => {
  try {
    const list = await staffModel.getAllStaff();
    return successResponse(res, 'Staff list retrieved', list);
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const staff = await staffModel.createStaff(req.body);
    return successResponse(res, 'Staff member added', staff, 201);
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    await staffModel.softDeleteStaff(id);
    return successResponse(res, 'Staff member removed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  createStaff,
  deleteStaff
};
