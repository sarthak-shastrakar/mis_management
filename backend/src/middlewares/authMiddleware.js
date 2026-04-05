const jwt = require('jsonwebtoken');
const Admin = require('../modules/admin/models/adminModel');
const Manager = require('../modules/manager/models/managerModel');
const Trainer = require('../modules/trainer/models/trainerModel');

// ─────────────────────────────────────────────────────────────
// Authentication Middleware
// ─────────────────────────────────────────────────────────────

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check Admin → Manager → Trainer in order
    let user = await Admin.findById(decoded.id);
    if (!user) user = await Manager.findById(decoded.id);
    if (!user) user = await Trainer.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact admin.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
  }
};

const managerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Manager only' });
  }
};

module.exports = {
  protect,
  adminOnly,
  managerOnly
};
