const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(notificationController.getNotifications)
  .post(staffOrAdmin, notificationController.createNotification);

router.route('/:id/read')
  .put(notificationController.markAsRead);

module.exports = router;
