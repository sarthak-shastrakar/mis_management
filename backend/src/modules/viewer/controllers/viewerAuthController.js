const Viewer = require('../models/viewerModel');
const jwt = require('jsonwebtoken');

// @desc    Viewer Login
// @route   POST /api/v1/viewer/auth/login
// @access  Public
exports.viewerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const viewer = await Viewer.findOne({ username }).select('+password');

    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (viewer.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account is inactive. Contact Admin.' });
    }

    const isMatch = await viewer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: viewer._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: viewer._id,
        name: viewer.name,
        username: viewer.username,
        role: viewer.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Current Viewer Profile
// @route   GET /api/v1/viewer/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const viewer = await Viewer.findById(req.user.id).populate('assignedProjects', 'name projectId');
    if (!viewer) {
      return res.status(404).json({ success: false, message: 'Viewer not found' });
    }

    res.status(200).json({
      success: true,
      data: viewer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
