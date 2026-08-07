const express = require('express');
const router = express.Router();
const {
  getCurrentStudentProfile,
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/authMiddleware');

router.get('/me', protect, getCurrentStudentProfile);
router.get('/', protect, getStudents);
router.get('/:id', protect, getStudentById);
router.post('/', protect, staffOrAdmin, addStudent);
router.put('/:id', protect, staffOrAdmin, updateStudent);
router.delete('/:id', protect, adminOnly, deleteStudent);

module.exports = router;
