const express = require('express');
const router = express.Router();
const {
  getAttendance,
  upsertAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceMetrics
} = require('../controllers/attendanceController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/authMiddleware');
const { validateAttendance } = require('../middleware/validator');

router.get('/', protect, getAttendance);
router.get('/metrics/:studentId', protect, getAttendanceMetrics);
router.post('/', protect, staffOrAdmin, validateAttendance, upsertAttendance);
router.put('/:id', protect, staffOrAdmin, validateAttendance, updateAttendance);
router.delete('/:id', protect, adminOnly, deleteAttendance);

module.exports = router;
