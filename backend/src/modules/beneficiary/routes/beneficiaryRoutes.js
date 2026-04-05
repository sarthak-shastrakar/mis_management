const express = require('express');
const router = express.Router();
const { protect } = require('../../../middlewares/authMiddleware');
const { uploadHousePhoto } = require('../../../utils/cloudinary');
const { 
  createBeneficiary, 
  uploadMonitoringPhoto, 
  uploadMonitoringPhotos,
  updateBeneficiaryStatus, 
  getBeneficiaries,
  getMyLogs
} = require('../controllers/beneficiaryController');

// @route   POST /api/v1/beneficiaries
router.post('/', protect, createBeneficiary);

// @route   GET /api/v1/beneficiaries
router.get('/', protect, getBeneficiaries);

// @route   GET /api/v1/beneficiaries/my-logs - MUST be before /:id routes
router.get('/my-logs', protect, getMyLogs);

// @route   POST /api/v1/beneficiaries/:id/monitoring  (single)
router.post('/:id/monitoring', protect, uploadHousePhoto.single('photo'), uploadMonitoringPhoto);

// @route   POST /api/v1/beneficiaries/:id/monitoring/multi  (multiple up to 4)
router.post('/:id/monitoring/multi', protect, uploadHousePhoto.array('photos', 4), uploadMonitoringPhotos);

// @route   PUT /api/v1/beneficiaries/:id/status
router.put('/:id/status', protect, updateBeneficiaryStatus);

module.exports = router;

