const Trainer = require('../models/trainerModel');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────
// @desc    Trainer Login
// @route   POST /api/v1/trainer/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
exports.trainerLogin = async (req, res) => {
  try {
    const { username, password, oneSignalPlayerId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const trainer = await Trainer.findOne({ username }).select('+password');

    if (!trainer) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (trainer.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact your manager.' });
    }

    const isMatch = await trainer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update OneSignal ID if provided
    if (oneSignalPlayerId) {
      trainer.oneSignalPlayerId = oneSignalPlayerId;
      await trainer.save();
    }

    const token = generateToken(trainer._id);

    // Tell frontend what step the trainer is at
    res.status(200).json({
      success: true,
      token,
      trainer: {
        id: trainer._id,
        trainerId: trainer.trainerId,
        fullName: trainer.fullName,
        username: trainer.username,
        role: trainer.role,
        isFirstLogin: trainer.isFirstLogin,
        isProfileComplete: trainer.isProfileComplete,
      },
      // If first login or profile not complete, force to /complete-profile
      nextStep: (trainer.isFirstLogin || !trainer.isProfileComplete)
        ? 'COMPLETE_PROFILE'
        : 'DASHBOARD',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ─────────────────────────────────────────────────────────────
// @desc    Trainer completes profile (mandatory before dashboard)
// @route   PUT /api/v1/trainer/auth/complete-profile
// @access  Private (Trainer - isProfileComplete = false only)
// ─────────────────────────────────────────────────────────────
exports.completeProfile = async (req, res) => {
  try {
    const {
      gender,
      state,
      district,
      city,
      taluka,
      pincode,
      aadharNumber,
      bankName,
      accountNumber,
      ifscCode,
      address,
    } = req.body;

    // All fields are required for profile completion based on new UI
    const missingFields = [];
    if (!gender)        missingFields.push('gender');
    if (!state)         missingFields.push('state');
    if (!district)      missingFields.push('district');
    if (!city)          missingFields.push('city');
    if (!taluka)        missingFields.push('taluka');
    if (!pincode)       missingFields.push('pincode');
    if (!aadharNumber)  missingFields.push('aadharNumber');
    if (!bankName)      missingFields.push('bankName');
    if (!accountNumber) missingFields.push('accountNumber');
    if (!ifscCode)      missingFields.push('ifscCode');
    if (!address)       missingFields.push('address');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please fill all required fields: ${missingFields.join(', ')}`,
        missingFields,
      });
    }

    const trainer = await Trainer.findById(req.user.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    if (trainer.isProfileComplete) {
      return res.status(400).json({ success: false, message: 'Profile is already complete.' });
    }

    // Check Aadhar uniqueness
    const aadharExists = await Trainer.findOne({ aadharNumber, _id: { $ne: req.user.id } });
    if (aadharExists) {
      return res.status(400).json({ success: false, message: 'Aadhar number already registered' });
    }

    // Fill profile fields
    trainer.gender = gender;
    trainer.state = state;
    trainer.district = district;
    trainer.city = city;
    trainer.taluka = taluka;
    trainer.pincode = pincode;
    trainer.aadharNumber = aadharNumber;
    trainer.bankName = bankName;
    trainer.accountNumber = accountNumber;
    trainer.ifscCode = ifscCode;
    trainer.address = address;

    // Handle profile photo from body (if Cloudinary URL was uploaded)
    if (req.body.profilePhoto) {
      trainer.profilePhoto = req.body.profilePhoto;
    }

    // Mark profile as complete and clear first login flag
    trainer.isProfileComplete = true;
    trainer.isFirstLogin = false;
    
    await trainer.save();

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully! You can now access all features.',
      nextStep: 'DASHBOARD',
      data: {
        trainerId: trainer.trainerId,
        fullName: trainer.fullName,
        email: trainer.email,
        isProfileComplete: trainer.isProfileComplete,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Reset password directly via mobile verification
// @route   POST /api/v1/trainer/auth/reset-password-direct
// @access  Public
// ─────────────────────────────────────────────────────────────
exports.resetPasswordDirect = async (req, res) => {
  try {
    const { mobileNumber, newPassword, confirmPassword } = req.body;

    if (!mobileNumber || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const trainer = await Trainer.findOne({ mobileNumber });

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'No trainer found with this mobile number' });
    }

    // Update password
    trainer.password = newPassword;
    
    // Update plain password so user/admin can see it in MIS if needed
    trainer.plainPassword = newPassword;

    await trainer.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
