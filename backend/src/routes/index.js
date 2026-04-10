const express = require('express');
const adminRoutes = require('../modules/admin/routes/adminRoutes');
const managerRoutes = require('../modules/manager/routes/managerRoutes');
const trainerRoutes = require('../modules/trainer/routes/trainerRoutes');
const projectRoutes = require('../modules/project/routes/projectRoutes');
const locationRoutes = require('../modules/location/routes/locationRoutes');
const attendanceRoutes = require('../modules/attendance/routes/attendanceRoutes');

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);
router.use('/trainer', trainerRoutes);
router.use('/projects', projectRoutes);
router.use('/locations', locationRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;
