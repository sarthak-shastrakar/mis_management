const express = require('express');
const { addNewTrainer, getAllTrainers, getTrainer, updateTrainer, deleteTrainer } = require('../controllers/trainerController');
const { protect } = require('../../../middlewares/authMiddleware');
const { managerOnly } = require('../../manager/middlewares/managerMiddleware');

const router = express.Router();

// Define routes with protection and authorization
router.post('/add-trainer', protect, managerOnly, addNewTrainer);
router.get('/trainers', protect, managerOnly, getAllTrainers);

router.route('/trainers/:id')
  .get(protect, managerOnly, getTrainer)
  .put(protect, managerOnly, updateTrainer)
  .delete(protect, managerOnly, deleteTrainer);

module.exports = router;
