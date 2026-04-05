const Trainer = require('../models/trainerModel');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────
// @desc    Trainer Login
// @route   POST /api/v1/trainer/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
exports.trainerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

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
      // Frontend should redirect based on these flags:
      // isFirstLogin = true  → force to /set-password
      // isProfileComplete = false → force to /complete-profile
      // both false → go to dashboard
      nextStep: trainer.isFirstLogin
        ? 'SET_PASSWORD'
        : !trainer.isProfileComplete
        ? 'COMPLETE_PROFILE'
        : 'DASHBOARD',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Trainer sets new password on first login (mandatory)
// @route   PUT /api/v1/trainer/auth/set-password
// @access  Private (Trainer - isFirstLogin only)
// ─────────────────────────────────────────────────────────────
exports.setFirstPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide newPassword and confirmPassword' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const trainer = await Trainer.findById(req.user.id).select('+password');
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    if (!trainer.isFirstLogin) {
      return res.status(400).json({ success: false, message: 'Password already set. Use update-password instead.' });
    }

    // Set new password — pre-save hook will hash it
    trainer.password = newPassword;
    trainer.plainPassword = newPassword;  // store plain text as requested by user
    trainer.isFirstLogin = false;  // mark first login done

    await trainer.save();

    res.status(200).json({
      success: true,
      message: 'Password set successfully. Please complete your profile.',
      nextStep: 'COMPLETE_PROFILE',
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
      email,
      alternativeMobileNumber,
      alternativeEmail,
      dateOfBirth,
      gender,
      address,
      pincode,
      aadharNumber,
      panCardNumber,
      bankName,
      accountNumber,
      totStatus,
      totLevel,
      residentCity,
      joiningLocation,
      qualification,
      taluka,
    } = req.body;

    // All fields are required for profile completion
    const missingFields = [];
    if (!email)         missingFields.push('email');
    if (!dateOfBirth)   missingFields.push('dateOfBirth');
    if (!gender)        missingFields.push('gender');
    if (!address)       missingFields.push('address');
    if (!pincode)       missingFields.push('pincode');
    if (!aadharNumber)  missingFields.push('aadharNumber');
    if (!bankName)      missingFields.push('bankName');
    if (!accountNumber) missingFields.push('accountNumber');
    if (!qualification) missingFields.push('qualification');
    if (!taluka)        missingFields.push('taluka');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please fill all required fields: ${missingFields.join(', ')}`,
        missingFields,
      });
    }

    const trainer = await Trainer.findById(req.user.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    if (trainer.isFirstLogin) {
      return res.status(400).json({
        success: false,
        message: 'Please set your new password first before completing profile',
        nextStep: 'SET_PASSWORD',
      });
    }

    if (trainer.isProfileComplete) {
      return res.status(400).json({ success: false, message: 'Profile is already complete. Use update-profile to make changes.' });
    }

    // Check Aadhar uniqueness
    const aadharExists = await Trainer.findOne({ aadharNumber, _id: { $ne: req.user.id } });
    if (aadharExists) {
      return res.status(400).json({ success: false, message: 'Aadhar number already registered with another trainer' });
    }

    // Check email uniqueness
    const emailExists = await Trainer.findOne({ email, _id: { $ne: req.user.id } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already in use by another trainer' });
    }

    // Fill all profile fields
    trainer.email = email;
    trainer.alternativeMobileNumber = alternativeMobileNumber;
    trainer.alternativeEmail = alternativeEmail;
    trainer.dateOfBirth = dateOfBirth;
    trainer.gender = gender;
    trainer.address = address;
    trainer.pincode = pincode;
    trainer.aadharNumber = aadharNumber;
    trainer.panCardNumber = panCardNumber;
    trainer.bankName = bankName;
    trainer.accountNumber = accountNumber;
    trainer.totStatus = totStatus;
    trainer.totLevel = totLevel;
    trainer.residentCity = residentCity;
    trainer.joiningLocation = joiningLocation;
    trainer.qualification = qualification;
    trainer.taluka = taluka;

    // Handle profile photo from body (if Cloudinary URL was uploaded)
    if (req.body.profilePhoto) {
      trainer.profilePhoto = req.body.profilePhoto;
    }

    // Mark profile as complete → unlock all features
    trainer.isProfileComplete = true;

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
// Helper
// ─────────────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
