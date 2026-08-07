const notificationModel = require('../models/notificationModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Get User Notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const all = await notificationModel.getAllNotifications();
      return successResponse(res, 'All system notifications retrieved', all);
    }
    const userNotifications = await notificationModel.getUserNotifications(req.user.id);
    return successResponse(res, 'User notifications retrieved', userNotifications);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Notification (Admin / Staff)
 */
const createNotification = async (req, res, next) => {
  try {
    const { user_id, title, message, type = 'info' } = req.body;
    if (!user_id || !title || !message) {
      return errorResponse(res, 'Please provide user_id, title, and message', 400);
    }

    const notification = await notificationModel.createNotification({
      user_id,
      title,
      message,
      type
    });

    return successResponse(res, 'Notification issued successfully', notification, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Notification as Read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationModel.markAsRead(id, req.user.id);
    return successResponse(res, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead
};
