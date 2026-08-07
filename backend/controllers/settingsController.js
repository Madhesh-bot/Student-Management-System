const settingsModel = require('../models/settingsModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsModel.getSettings();
    return successResponse(res, 'System settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { setting_key, setting_value } = req.body;
    if (!setting_key || setting_value === undefined) {
      return errorResponse(res, 'setting_key and setting_value are required', 400);
    }
    const result = await settingsModel.updateSetting(setting_key, setting_value);
    return successResponse(res, 'Setting updated', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSetting
};
