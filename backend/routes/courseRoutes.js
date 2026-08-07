const express = require('express');
const router = express.Router();
const { getCourses, createCourse, deleteCourse } = require('../controllers/courseController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.post('/', protect, adminOnly, createCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

module.exports = router;
