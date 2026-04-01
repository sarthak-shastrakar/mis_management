const Manager = require('../models/managerModel');
const jwt = require('jsonwebtoken');

// @desc    Login Manager
// @route   POST /api/v1/manager/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide a username and password' });
    }

    // Check for manager
    const manager = await Manager.findOne({ username }).select('+password');

    if (!manager) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await manager.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(manager, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (manager, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: manager._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    manager: {
      id: manager._id,
      fullName: manager.fullName,
      username: manager.username,
      managerId: manager.managerId,
    },
  });
};
