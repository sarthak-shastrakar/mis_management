const express = require('express');
const { viewerLogin, getMe } = require('../controllers/viewerAuthController');
const { protect } = require('../../../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', viewerLogin);
router.get('/me', protect, getMe);

module.exports = router;
