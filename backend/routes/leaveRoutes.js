const express = require('express');
const router = express.Router();
const { getLeaves, createLeaveRequest, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, getLeaves);
router.post('/', protect, createLeaveRequest);
router.put('/:id', protect, staffOrAdmin, updateLeaveStatus);

module.exports = router;
