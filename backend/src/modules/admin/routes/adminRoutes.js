const express = require('express');
const { register, login, addNewManager, getAllManagers, getManager, updateManager, deleteManager, logout, deleteAccount } = require('../controllers/adminController');
const { protect } = require('../../../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private routes (Admin Only)
router.get('/logout', protect, logout);
router.delete('/delete-account', protect, adminOnly, deleteAccount);
router.post('/add-manager', protect, adminOnly, addNewManager);
router.get('/managers', protect, adminOnly, getAllManagers);

router.route('/managers/:id')
  .get(protect, adminOnly, getManager)
  .put(protect, adminOnly, updateManager)
  .delete(protect, adminOnly, deleteManager);

module.exports = router;
