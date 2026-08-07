const express = require('express');
const router = express.Router();
const {
  getMarks,
  upsertMarks,
  updateMarks,
  deleteMarks,
  generateResult
} = require('../controllers/marksController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/authMiddleware');
const { validateMarks } = require('../middleware/validator');

router.get('/', protect, getMarks);
router.post('/', protect, staffOrAdmin, validateMarks, upsertMarks);
router.post('/generate-result', protect, staffOrAdmin, generateResult);
router.put('/:id', protect, staffOrAdmin, validateMarks, updateMarks);
router.delete('/:id', protect, adminOnly, deleteMarks);

module.exports = router;
