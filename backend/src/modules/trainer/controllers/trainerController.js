const mongoose = require('mongoose');
const Trainer = require('../models/trainerModel');
const Attendance = require('../../attendance/models/attendanceModel');
const Project = require('../../project/models/projectModel');
const crypto = require('crypto');

// @desc    Add new trainer (Manager fills basic info only)
// @route   POST /api/v1/manager/trainers/add
// @access  Private (Manager/Admin Only)
exports.addNewTrainer = async (req, res) => {
  try {
    // Manager fills fields as per the UI Mockup + new MIS requirements:
    // Full Name, Trainer ID, Mobile Number, Assign Project, State, District, Account Role, Staff ID
    const { 
      fullName, 
      trainerId: manualTrainerId, 
      mobileNumber,
      state,
      district,
      assignedProjects: assignedProjectsFromReq, // Handle possible plural field
      assignedProject: assignedProjectFromReq,  // Handle possible singular field
      alternativeMobileNumber,
      alternativeEmail,
      panCardNumber,
      totStatus,
      totLevel,
      residentCity,
      joiningLocation,
      reportingManager: reportingManagerId 
    } = req.body;

    if (!fullName || !mobileNumber || !state || !district) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, mobileNumber, state, and district',
      });
    }

    // 1. Check duplicate mobile
    const trainerExist = await Trainer.findOne({ mobileNumber });
    if (trainerExist) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists' });
    }

    // 2. Handle Trainer ID / Staff ID
    let trainerId = manualTrainerId;
    if (!trainerId) {
      // Auto-generate if not provided by manager
      const trainerCount = await Trainer.countDocuments();
      const trainerSeq = trainerCount + 1001;
      trainerId = `T-${trainerSeq}`;
      
      const idExists = await Trainer.findOne({ trainerId });
      if (idExists) trainerId = `T-${trainerSeq + 1}`;
    } else {
      // Check if manual ID exists
      const idExists = await Trainer.findOne({ trainerId });
      if (idExists) {
        return res.status(400).json({ success: false, message: 'Trainer ID already exists' });
      }
    }

    // 3. Username: Derive from Trainer ID (e.g., T-1434 -> tr_1434)
    let username;
    if (trainerId.includes('-')) {
      const parts = trainerId.split('-');
      username = `tr_${parts[parts.length - 1]}`;
    } else {
      username = `tr_${trainerId.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Check if username exists
    const userExists = await Trainer.findOne({ username });
    if (userExists) {
      username = `${username}_${Math.floor(10 + Math.random() * 90)}`;
    }

    // 4. Password: [FirstName]@123
    const firstName = fullName.split(' ')[0].toLowerCase();
    const password = `${firstName}@123`;

    // 5. Resolve Projects correctly (Manager sends array of Project IDs or Names)
    let finalProjectIds = [];
    const projectsToResolve = assignedProjectsFromReq || (assignedProjectFromReq ? [assignedProjectFromReq] : []);
    
    if (projectsToResolve && Array.isArray(projectsToResolve)) {
      for (const prjId of projectsToResolve) {
        if (prjId === 'None') continue;
        const foundProject = await Project.findOne({
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(prjId) ? prjId : null },
            { projectId: prjId },
            { name: prjId }
          ].filter(q => Object.values(q)[0] !== null)
        });
        if (foundProject) finalProjectIds.push(foundProject._id);
      }
    }

    // 6. Create trainer
    const trainer = await Trainer.create({
      fullName,
      mobileNumber,
      trainerId,
      staffId: trainerId,
      assignedProjects: finalProjectIds,
      state,
      district,
      username,
      password,
      plainPassword: password,
      reportingManager: (req.user.role === 'admin' && reportingManagerId) ? reportingManagerId : req.user.id,
      createdBy: req.user.id,
      assignedBy: finalProjectIds.length > 0 ? req.user.id : null,
      
      // New MIS Fields
      accountRole: 'trainer',
      alternativeMobileNumber,
      alternativeEmail,
      panCardNumber,
      totStatus,
      totLevel,
      residentCity,
      joiningLocation
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully.',
      data: {
        _id: trainer._id,
        trainerId: trainer.trainerId,
        staffId: trainer.staffId,
        fullName: trainer.fullName,
        accountRole: trainer.accountRole,
        username: trainer.username,
        tempPassword: password,
        isFirstLogin: false,
        isProfileComplete: false,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all trainers
// @route   GET /api/v1/manager/trainers
// @access  Private (Manager/Admin Only)
exports.getAllTrainers = async (req, res) => {
  try {
    let query = {};

    // Filtering logic for Managers
    if (req.user.role === 'manager') {
      query = { createdBy: req.user.id };
    }

    const trainers = await Trainer.find(query)
      .populate('createdBy', 'fullName')
      .populate('reportingManager', 'fullName')
      .populate('assignedBy', 'fullName')
      .populate('assignedProjects', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    // Add real stats for each trainer
    for (const trainer of trainers) {
      const attendanceCount = await Attendance.countDocuments({ 
        trainerId: trainer._id,
        status: { $in: ['present', 'approved'] } 
      });
      trainer.totalUploads = attendanceCount;
      // Simple attendance rate Calculation: (uploads / days since joined)
      const diffTime = Math.abs(new Date() - new Date(trainer.createdAt));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      trainer.attendanceRate = Math.min(100, Math.round((attendanceCount / diffDays) * 100));
    }

    res.status(200).json({ success: true, count: trainers.length, data: trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single trainer
// @route   GET /api/v1/manager/trainers/:id
// @access  Private (Manager/Admin Only)
exports.getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('createdBy', 'fullName')
      .populate('reportingManager', 'fullName')
      .populate('assignedBy', 'fullName')
      .populate('assignedProjects', 'name')
      .lean();
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Add real stats for this specific trainer
    const attendanceCount = await Attendance.countDocuments({ 
      trainerId: trainer._id,
      status: { $in: ['present', 'approved'] } 
    });
    
    trainer.totalUploads = attendanceCount;
    // Calculation: (Total Uploads / Days since creation) * 100
    const diffTime = Math.abs(new Date() - new Date(trainer.createdAt));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    trainer.attendanceRate = Math.min(100, Math.round((attendanceCount / diffDays) * 100));

    res.status(200).json({ success: true, data: trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update trainer
// @route   PUT /api/v1/manager/trainers/:id
// @access  Private (Manager/Admin Only)
exports.updateTrainer = async (req, res) => {
  try {
    const { 
      fullName, 
      mobileNumber, 
      assignedProject, 
      assignedProjects,
      state, 
      district, 
      status, 
      password,
      accountRole
    } = req.body;

    let trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    if (mobileNumber && mobileNumber !== trainer.mobileNumber) {
      const existing = await Trainer.findOne({ mobileNumber });
      if (existing) return res.status(400).json({ success: false, message: 'Mobile number already in use' });
      trainer.mobileNumber = mobileNumber;
      trainer.username = `tr_${mobileNumber.slice(-4)}`;
    }

    if (fullName)        trainer.fullName        = fullName;
    if (state)           trainer.state           = state;
    if (district)        trainer.district        = district;
    if (accountRole)     trainer.accountRole     = accountRole;

    const projectsToUpdate = assignedProjects || (assignedProject ? [assignedProject] : null);

    if (projectsToUpdate && Array.isArray(projectsToUpdate)) {
      let finalProjectIds = [];
      for (const prjId of projectsToUpdate) {
        if (prjId === 'None') continue;
        const foundProject = await Project.findOne({
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(prjId) ? prjId : null },
            { projectId: prjId },
            { name: prjId }
          ].filter(q => Object.values(q)[0] !== null)
        });
        if (foundProject) finalProjectIds.push(foundProject._id);
      }
      trainer.assignedProjects = finalProjectIds;
      trainer.assignedBy = req.user.id;
    }
    
    if (status)          trainer.status          = status;

    if (password) {
      trainer.password      = password;
      trainer.plainPassword = password;
    }

    await trainer.save();
    res.status(200).json({ success: true, data: trainer });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete trainer
// @route   DELETE /api/v1/manager/trainers/:id
// @access  Private (Manager/Admin Only)
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    await Trainer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Trainer deleted successfully', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
