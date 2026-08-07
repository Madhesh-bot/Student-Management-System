const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getSubjects);
router.post('/', protect, adminOnly, createSubject);
router.delete('/:id', protect, adminOnly, deleteSubject);

module.exports = router;
