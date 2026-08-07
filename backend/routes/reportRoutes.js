const express = require('express');
const router = express.Router();
const { getStudentReport, getAttendanceReport, getMarksReport } = require('../controllers/reportController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

// Administrative report endpoints (restricted to admin and staff roles)
router.get('/students', protect, staffOrAdmin, getStudentReport);
router.get('/attendance', protect, staffOrAdmin, getAttendanceReport);
router.get('/marks', protect, staffOrAdmin, getMarksReport);

module.exports = router;
