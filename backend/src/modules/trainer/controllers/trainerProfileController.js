const Trainer = require('../models/trainerModel');
const Project = require('../../project/models/projectModel');

// ─────────────────────────────────────────────────────────────
// @desc    Get own profile
// @route   GET /api/v1/trainer/profile/me
// @access  Private (Trainer - profile complete)
// ─────────────────────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.user.id)
      .populate('reportingManager', 'fullName role')
      .populate('assignedProjects', 'name projectCategory projectId status');

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Prepare response data with FULL details as per UI mockup for editing/viewing
    const profileData = {
      fullName: trainer.fullName,
      trainerId: trainer.trainerId,
      mobileNumber: trainer.mobileNumber,
      email: trainer.email,
      location: {
        state: trainer.state,
        district: trainer.district,
        city: trainer.city || trainer.residentCity,
        taluka: trainer.taluka,
        pincode: trainer.pincode,
        address: trainer.address,
      },
      dateJoined: trainer.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
      status: trainer.status,
      assignedProject: trainer.assignedProject,
      assignedProjects: trainer.assignedProjects,
      
      // Personal Details
      gender: trainer.gender,
      aadharNumber: trainer.aadharNumber,
      panCardNumber: trainer.panCardNumber,
      dateOfBirth: trainer.dateOfBirth,
      
      // Banking Details
      bankName: trainer.bankName,
      accountNumber: trainer.accountNumber,
      ifscCode: trainer.ifscCode,
      
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
// @desc    Get assigned projects for trainer
// @route   GET /api/v1/trainer/projects
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.getAssignedProjects = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.user.id).populate('assignedProjects');
    
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    res.status(200).json({
      success: true,
      count: trainer.assignedProjects.length,
      data: trainer.assignedProjects
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
    const { 
      email, dateOfBirth, gender, address, pincode, 
      qualification, taluka, profilePhoto, city, 
      state, district, bankName, accountNumber, ifscCode, aadharNumber 
    } = req.body;

    const trainer = await Trainer.findById(req.user.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    // Check email uniqueness if changed
    if (email && email !== trainer.email) {
      const emailExists = await Trainer.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
      trainer.email = email;
    }

    // Update fields allowed for trainer edit
    if (dateOfBirth) trainer.dateOfBirth   = dateOfBirth;
    if (gender)      trainer.gender        = gender;
    if (address)     trainer.address       = address;
    if (pincode)     trainer.pincode       = pincode;
    if (qualification) trainer.qualification = qualification;
    if (taluka)      trainer.taluka        = taluka;
    if (city)        trainer.city          = city;
    if (state)       trainer.state         = state;
    if (district)    trainer.district      = district;
    if (bankName)    trainer.bankName      = bankName;
    if (accountNumber) trainer.accountNumber = accountNumber;
    if (ifscCode)    trainer.ifscCode      = ifscCode;
    if (aadharNumber) trainer.aadharNumber  = aadharNumber;
    if (profilePhoto) trainer.profilePhoto  = profilePhoto;

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
// @desc    Get attendance history for a trainer
// @route   GET /api/v1/trainer/attendance/history/:projectId
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const trainerId = req.user.id;
    const Attendance = require('../../attendance/models/attendanceModel');

    const rawHistory = await Attendance.find({
      trainerId,
      projectId
    }).sort({ date: -1 });

    // Format for UI (Matches screenshot: Marked, Pending, etc.)
    const history = rawHistory.map(entry => {
      let displayStatus = 'Pending';
      if (entry.status === 'approved' || entry.status === 'present') displayStatus = 'Marked';
      if (entry.status === 'rejected') displayStatus = 'Rejected';

      return {
        id: entry._id,
        date: entry.date,
        day: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(entry.date),
        status: displayStatus,
        rawStatus: entry.status,
        remarks: entry.remarks,
        photos: entry.photos || [],
        videos: entry.videos || [],
        location: entry.location || { latitude: 0, longitude: 0 }
      };
    });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get Beneficiaries assigned to this Trainer
// @route   GET /api/v1/trainer/beneficiaries
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.getMyBeneficiaries = async (req, res) => {
  try {
    const Beneficiary = require('../../project/models/beneficiaryModel');
    const { regNo, village } = req.query;
    
    let query = { assignedTrainer: req.user.id };
    
    if (regNo) {
      query.registrationNo = { $regex: regNo, $options: 'i' };
    }
    if (village) {
      query['location.village'] = { $regex: village, $options: 'i' };
    }

    const beneficiaries = await Beneficiary.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: beneficiaries.length,
      data: beneficiaries
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get Dashboard Summary Stats for Trainer
// @route   GET /api/v1/trainer/dashboard-summary
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.getDashboardSummary = async (req, res) => {
  try {
    const Beneficiary = require('../../project/models/beneficiaryModel');
    const Attendance = require('../../attendance/models/attendanceModel');
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Total Beneficiaries
    const totalBeneficiaries = await Beneficiary.countDocuments({ assignedTrainer: req.user.id });

    // 2. Uploaded Today (Unique beneficiaries for which work was marked today)
    const uploadedTodayRecords = await Attendance.distinct('beneficiaryId', {
      trainerId: req.user.id,
      date: { $gte: today, $lt: tomorrow },
      beneficiaryId: { $ne: null }
    });
    const uploadedCount = uploadedTodayRecords.length;

    // 3. Pending (Simple subtraction for the day)
    const pendingCount = Math.max(0, totalBeneficiaries - uploadedCount);

    res.status(200).json({
      success: true,
      data: {
        totalBeneficiaries,
        uploadedCount,
        pendingCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update Push Token (OneSignal Player ID)
// @route   PUT /api/v1/trainer/push-token
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.updatePushToken = async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ success: false, message: 'Player ID required' });

    const trainer = await Trainer.findByIdAndUpdate(
      req.user.id,
      { oneSignalPlayerId: playerId },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Push token updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
