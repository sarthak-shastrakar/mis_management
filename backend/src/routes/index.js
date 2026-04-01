const express = require('express');
const adminRoutes = require('../modules/admin/routes/adminRoutes');
const managerRoutes = require('../modules/manager/routes/managerRoutes');
const trainerRoutes = require('../modules/trainer/routes/trainerRoutes');

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);
router.use('/trainer', trainerRoutes);

module.exports = router;
