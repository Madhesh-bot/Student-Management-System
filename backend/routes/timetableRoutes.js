const express = require('express');
const router = express.Router();
const { getTimetable, createSlot, deleteSlot } = require('../controllers/timetableController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getTimetable);
router.post('/', protect, staffOrAdmin, createSlot);
router.delete('/:id', protect, adminOnly, deleteSlot);

module.exports = router;
