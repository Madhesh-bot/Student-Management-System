const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const staffRoutes = require('./staffRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const marksRoutes = require('./marksRoutes');
const departmentRoutes = require('./departmentRoutes');
const courseRoutes = require('./courseRoutes');
const subjectRoutes = require('./subjectRoutes');
const leaveRoutes = require('./leaveRoutes');
const timetableRoutes = require('./timetableRoutes');
const reportRoutes = require('./reportRoutes');
const auditRoutes = require('./auditRoutes');
const settingsRoutes = require('./settingsRoutes');
const notificationRoutes = require('./notificationRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/staff', staffRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/marks', marksRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/subjects', subjectRoutes);
router.use('/leaves', leaveRoutes);
router.use('/timetables', timetableRoutes);
router.use('/reports', reportRoutes);
router.use('/audit', auditRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

