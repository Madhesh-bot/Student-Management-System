const timetableModel = require('../models/timetableModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getTimetable = async (req, res, next) => {
  try {
    const { department_id = 1, year = 1, semester = 1 } = req.query;
    const slots = await timetableModel.getTimetableByDeptAndYear(department_id, year, semester);
    return successResponse(res, 'Timetable schedule retrieved', slots);
  } catch (error) {
    next(error);
  }
};

const createSlot = async (req, res, next) => {
  try {
    const { department_id, subject_id, day_of_week, start_time, end_time, room } = req.body;
    if (!department_id || !subject_id || !day_of_week || !start_time || !end_time || !room) {
      return errorResponse(res, 'Missing required timetable slot fields', 400);
    }
    const slot = await timetableModel.createTimetableSlot(req.body);
    return successResponse(res, 'Timetable slot created', slot, 201);
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    await timetableModel.softDeleteSlot(id);
    return successResponse(res, 'Timetable slot removed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimetable,
  createSlot,
  deleteSlot
};
