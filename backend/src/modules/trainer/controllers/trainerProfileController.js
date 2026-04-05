const Trainer = require('../models/trainerModel');

// ─────────────────────────────────────────────────────────────
// @desc    Get own profile
// @route   GET /api/v1/trainer/profile/me
// @access  Private (Trainer - profile complete)
// ─────────────────────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.user.id)
      .populate('reportingManager', 'fullName role');

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Prepare response data with masking as per UI mockup
    const profileData = {
      fullName: trainer.fullName,
      trainerId: trainer.trainerId,
      mobileNumber: trainer.mobileNumber,
      email: trainer.email,
      location: trainer.district,
      dateJoined: trainer.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
      address: trainer.address,
      status: trainer.status,
      assignedProject: trainer.assignedProject,
      
      // Masked Bank & Identity Details
      aadharNumber: trainer.aadharNumber 
        ? `****-****-${trainer.aadharNumber.slice(-4)}` 
        : null,
      bankName: trainer.bankName,
      accountNumber: trainer.accountNumber 
        ? `****${trainer.accountNumber.slice(-4)}` 
        : null,
      
      // Reporting Manager
      reportingManager: trainer.reportingManager ? {
        name: trainer.reportingManager.fullName,
        role: trainer.reportingManager.role
      } : null,

      // Performance Stats
      performance: {
        attendanceRate: `${trainer.attendanceRate || 0}%`,
        totalUploads: trainer.totalUploads || 0
      }
    };

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update own profile (after profile is complete)
// @route   PUT /api/v1/trainer/profile/update
// @access  Private (Trainer - profile complete)
// ─────────────────────────────────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  try {
    const { email, dateOfBirth, gender, address, pincode, qualification, taluka, profilePhoto } = req.body;

    const trainer = await Trainer.findById(req.user.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    // Check email uniqueness if changed
    if (email && email !== trainer.email) {
      const emailExists = await Trainer.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
      trainer.email = email;
    }

    // Update allowed fields (trainer cannot change: mobile, aadhar, trainerId, assignedProject)
    if (dateOfBirth) trainer.dateOfBirth   = dateOfBirth;
    if (gender)      trainer.gender        = gender;
    if (address)     trainer.address       = address;
    if (pincode)     trainer.pincode       = pincode;
    if (qualification) trainer.qualification = qualification;
    if (taluka)      trainer.taluka        = taluka;
    if (profilePhoto) trainer.profilePhoto = profilePhoto;

    await trainer.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: trainer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update own password (after first login)
// @route   PUT /api/v1/trainer/profile/update-password
// @access  Private (Trainer - profile complete)
// ─────────────────────────────────────────────────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide currentPassword, newPassword, and confirmPassword' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password' });
    }

    const trainer = await Trainer.findById(req.user.id).select('+password');
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const isMatch = await trainer.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    trainer.password = newPassword;
    trainer.plainPassword = newPassword;
    await trainer.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
