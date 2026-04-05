// ─────────────────────────────────────────────────────────────
// Middleware: requireProfileComplete
// Blocks all feature routes until trainer has:
//   1. Set their new password (isFirstLogin = false)
//   2. Completed their profile (isProfileComplete = true)
// ─────────────────────────────────────────────────────────────

exports.requireProfileComplete = (req, res, next) => {
  const user = req.user;

  // Only enforce for trainers
  if (user.role !== 'trainer') return next();

  // Step 1: Password not set yet
  if (user.isFirstLogin) {
    return res.status(403).json({
      success: false,
      message: 'Please set your new password first before using any features.',
      nextStep: 'SET_PASSWORD',
      redirectTo: '/trainer/auth/set-password',
    });
  }

  // Step 2: Profile not completed
  if (!user.isProfileComplete) {
    return res.status(403).json({
      success: false,
      message: 'Please complete your profile before accessing this feature.',
      nextStep: 'COMPLETE_PROFILE',
      redirectTo: '/trainer/auth/complete-profile',
    });
  }

  next();
};


// ─────────────────────────────────────────────────────────────
// Middleware: trainerOnly
// Allows only trainers (not admin/manager)
// ─────────────────────────────────────────────────────────────
exports.trainerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'trainer') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Trainers only' });
  }
};
