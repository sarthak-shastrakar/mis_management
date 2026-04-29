const express = require('express');
const router = express.Router();

const { protect } = require('../../../middlewares/authMiddleware');
const { trainerOnly } = require('../../trainer/middlewares/trainerMiddleware');
// Assuming managerMiddleware exports managerOnly. Let's use the actual file if it differs.
// Will use inline middleware for manager if needed or require it.
const { managerOnly } = require('../../manager/middlewares/managerMiddleware');

const {
  createTrainee,
  getTrainerTrainees,
  getManagerTrainees,
  updateTrainee,
  deleteTrainee,
} = require('../controllers/traineeController');

// Using the existing cloudinary upload middleware for photo
const { uploadHousePhoto } = require('../../../utils/cloudinary'); 

// ─────────────────────────────────────────────────────────────
// TRAINER ROUTES
// ─────────────────────────────────────────────────────────────
// Upload single 'photo' field
router.post(
  '/create',
  protect,
  trainerOnly,
  uploadHousePhoto.fields([{ name: 'photo', maxCount: 1 }]),
  createTrainee
);

router.get('/my-list', protect, trainerOnly, getTrainerTrainees);

// ─────────────────────────────────────────────────────────────
// MANAGER ROUTES
// ─────────────────────────────────────────────────────────────
router.get('/manager/list', protect, managerOnly, getManagerTrainees);

router.put(
  '/:id',
  protect,
  managerOnly,
  uploadHousePhoto.fields([{ name: 'photo', maxCount: 1 }]),
  updateTrainee
);

router.delete('/:id', protect, managerOnly, deleteTrainee);

module.exports = router;
