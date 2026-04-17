const express = require('express');
const adminRoutes = require('../modules/admin/routes/adminRoutes');
const managerRoutes = require('../modules/manager/routes/managerRoutes');
const trainerRoutes = require('../modules/trainer/routes/trainerRoutes');
const projectRoutes = require('../modules/project/routes/projectRoutes');
const locationRoutes = require('../modules/location/routes/locationRoutes');
const attendanceRoutes = require('../modules/attendance/routes/attendanceRoutes');
const viewerRoutes = require('../modules/viewer/routes/viewerRoutes');

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);
router.use('/trainer', trainerRoutes);
router.use('/projects', projectRoutes);
router.use('/locations', locationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/viewer', viewerRoutes);

module.exports = router;
