const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getDepartments);
router.post('/', protect, adminOnly, createDepartment);
router.delete('/:id', protect, adminOnly, deleteDepartment);

module.exports = router;
