const mongoose = require('mongoose');
const Manager = require('../models/managerModel');
const Trainer = require('../../trainer/models/trainerModel');
const Attendance = require('../../attendance/models/attendanceModel');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
// @desc    Login Manager
// @route   POST /api/v1/manager/login
// @access  Public
// ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const manager = await Manager.findOne({ username }).select('+password').populate('assignedProjects', 'name');

    if (!manager) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (manager.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact admin.' });
    }

    const isMatch = await manager.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(manager, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Get own profile
// @route   GET /api/v1/manager/me
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.user.id).populate('assignedProjects', 'name');
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });

    // Count trainers created by this manager
    const managerId = new mongoose.Types.ObjectId(req.user.id);
    const trainerCount = await Trainer.countDocuments({ 
      $or: [
        { createdBy: managerId },
        { reportingManager: managerId }
      ]
    });

    res.status(200).json({ 
      success: true, 
      data: {
        ...manager._doc,
        totalTrainersCreated: trainerCount
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ─────────────────────────────────────────────
// @desc    Update own profile
// @route   PUT /api/v1/manager/update-profile
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, emailAddress, state, district } = req.body;

    const manager = await Manager.findById(req.user.id).populate('assignedProjects', 'name');
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });

    if (fullName) manager.fullName = fullName;
    if (emailAddress) {
      const emailExists = await Manager.findOne({ emailAddress, _id: { $ne: req.user.id } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
      manager.emailAddress = emailAddress;
    }
    if (state) manager.state = state;
    if (district) manager.district = district;

    await manager.save();
    res.status(200).json({ success: true, message: 'Profile updated', data: manager });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Update own password
// @route   PUT /api/v1/manager/update-password
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Please provide currentPassword and newPassword' });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

    if (currentPassword === newPassword)
      return res.status(400).json({ success: false, message: 'New password must be different from current password' });

    const manager = await Manager.findById(req.user.id).select('+password');
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });

    const isMatch = await manager.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    manager.password = newPassword;
    manager.plainPassword = newPassword;
    await manager.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Assign Trainer to a Project
// @route   PUT /api/v1/manager/assign-trainer
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.assignTrainer = async (req, res, next) => {
  try {
    const { trainerId, projectIds } = req.body;

    if (!trainerId || !projectIds || !Array.isArray(projectIds)) {
      return res.status(400).json({ success: false, message: 'Please provide trainerId and an array of projectIds' });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    if (trainer.status === 'inactive') {
      return res.status(400).json({ success: false, message: 'Cannot assign project to an inactive trainer' });
    }

    trainer.assignedProjects = projectIds;
    await trainer.save();

    res.status(200).json({
      success: true,
      message: `Trainer "${trainer.fullName}" updated with assigned projects`,
      data: {
        trainerId: trainer.trainerId,
        fullName: trainer.fullName,
        assignedProjects: trainer.assignedProjects,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Send Email Notification to Trainer
// @route   POST /api/v1/manager/send-notification
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.sendNotification = async (req, res, next) => {
  try {
    const { trainerId, subject, message } = req.body;

    if (!trainerId || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide trainerId, subject, and message' });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    if (!trainer.mobileNumber) {
      return res.status(400).json({ success: false, message: 'Trainer has no contact info for notification' });
    }

    // --- Email Notification ---
    // Note: Trainer model currently stores mobileNumber. If you add email to trainer, use that.
    // WhatsApp: Future scope via Twilio/WA Business API — placeholder below.

    // Placeholder: log notification (real email requires trainer email field)

    // For now — log it as a record
    res.status(200).json({
      success: true,
      message: `Notification recorded for Trainer "${trainer.fullName}" (${trainer.trainerId})`,
      data: {
        trainerId: trainer.trainerId,
        fullName: trainer.fullName,
        mobile: trainer.mobileNumber,
        subject,
        message,
        sentAt: new Date().toISOString(),
        channel: 'email', // 'whatsapp' — future scope
        note: 'Add trainer email field to activate real email delivery',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Get All Pending Attendance Approval Requests
// @route   GET /api/v1/manager/attendance/pending
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.getPendingAttendances = async (req, res, next) => {
  try {
    const pendingList = await Attendance.find({ status: 'pending_approval' })
      .populate('trainerId', 'fullName trainerId mobileNumber assignedProjects')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingList.length,
      data: pendingList,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Approve Attendance Request
// @route   PUT /api/v1/manager/attendance/:id/approve
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.approveAttendance = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id).populate('trainerId', 'fullName trainerId');

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (attendance.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve — attendance is already "${attendance.status}"`,
      });
    }

    attendance.status = 'approved';
    attendance.approvedBy = req.user.id;
    attendance.approvedAt = new Date();
    if (remarks) attendance.remarks = remarks;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Attendance for "${attendance.trainerId.fullName}" on ${attendance.date} approved`,
      data: {
        attendanceId: attendance._id,
        trainer: attendance.trainerId.fullName,
        date: attendance.date,
        project: attendance.projectId,
        status: attendance.status,
        approvedAt: attendance.approvedAt,
        remarks: attendance.remarks,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Reject Attendance Request
// @route   PUT /api/v1/manager/attendance/:id/reject
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.rejectAttendance = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Please provide a rejectionReason' });
    }

    const attendance = await Attendance.findById(req.params.id).populate('trainerId', 'fullName trainerId');

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (attendance.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject — attendance is already "${attendance.status}"`,
      });
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Attendance for "${attendance.trainerId.fullName}" on ${attendance.date} rejected`,
      data: {
        attendanceId: attendance._id,
        trainer: attendance.trainerId.fullName,
        date: attendance.date,
        project: attendance.projectId,
        status: attendance.status,
        rejectionReason: attendance.rejectionReason,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Manager Dashboard
// @route   GET /api/v1/manager/dashboard
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.user.id).populate('assignedProjects');
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });

    const projects = manager.assignedProjects || [];
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.find({
      date: today,
      status: { $in: ['present', 'approved'] },
    });

    const todayProjectAttendance = {};
    todayAttendance.forEach((att) => {
      const proj = att.projectId;
      todayProjectAttendance[proj] = (todayProjectAttendance[proj] || 0) + 1;
    });

    const assignedProjectsStatus = await Promise.all(projects.map(async (prj) => {
      const managerId = new mongoose.Types.ObjectId(req.user.id);
      const trainersCount = await Trainer.countDocuments({ 
        assignedProjects: prj._id,
        $or: [
          { createdBy: managerId },
          { reportingManager: managerId }
        ]
      });
      const presentToday = todayProjectAttendance[prj._id] || todayProjectAttendance[prj.name] || 0;
      
      return {
        projectId: prj._id,
        projectName: prj.name,
        location: prj.location ? `${prj.location.district}, ${prj.location.state}` : 'N/A',
        totalTrainers: trainersCount,
        presentToday,
        completionPercentage: prj.progressStatus || 0,
        healthStatus: prj.progressStatus >= 70 ? 'HEALTHY' : 'ATTENTION NEEDED',
      };
    }));

    const projectIds = projects.map(p => p._id.toString());
    const projectCustomIds = projects.map(p => p.projectId).filter(Boolean);

    // 1. Fetch Late Attendance (Presently Attendance model)
    // Filter submissions to only show those from trainers created by this manager
    const trainerIdsByMe = (await Trainer.find({ 
      $or: [
        { createdBy: req.user.id },
        { reportingManager: req.user.id }
      ]
    }).select('_id')).map(t => t._id);

    const pendingSubmissions = await Attendance.find({
      status: 'pending_approval',
      trainerId: { $in: trainerIdsByMe }
    })
      .populate('trainerId', 'fullName trainerId mobileNumber assignedProject district')
      .sort({ createdAt: -1 });

    const pendingList = pendingSubmissions.map((att) => {
      const projectDoc = projects.find(p => p._id.toString() === att.projectId || p.name === att.projectId);
      return {
        attendanceId: att._id,
        trainer: {
          name: att.trainerId?.fullName || 'N/A',
          trainerId: att.trainerId?.trainerId || 'N/A',
          mobile: att.trainerId?.mobileNumber || 'N/A',
          _id: att.trainerId?._id
        },
        project: projectDoc ? projectDoc.name : att.projectId,
        date: att.date,
        daysMissing: att.daysLate,
        status: att.status,
        remarks: att.remarks || null,
      };
    });

    // 2. Fetch Bulk Requests (BulkAttendanceRequest model)
    const BulkRequest = require('../../attendance/models/bulkRequestModel');
    
    console.log('DEBUG: Logged in manager ID:', req.user.id);

    const bulkRequestsData = await BulkRequest.find({
      managerId: req.user.id,
      status: 'Pending Approval'
    })
      .populate('trainerId', 'fullName trainerId mobileNumber district')
      .sort({ createdAt: -1 })
      .lean();

    console.log('DEBUG: Bulk Requests found for this manager:', bulkRequestsData.length);
    if (bulkRequestsData.length === 0) {
      const anyData = await BulkRequest.find({}).limit(1);
      if (anyData.length > 0) {
        console.log('DEBUG: Found other manager request in DB with managerId:', anyData[0].managerId);
      }
    }

    const formattedBulkRequests = bulkRequestsData.map(r => {
      const proj = projects.find(p => String(p._id) === String(r.projectId) || p.projectId === r.projectId || p.name === r.projectId);
      return {
        ...r,
        projectName: proj ? proj.name : r.projectId
      };
    });

    res.status(200).json({
      success: true,
      data: {
        manager: {
          name: manager.fullName,
          managerId: manager.managerId,
          assignedProjects: manager.assignedProjects ? manager.assignedProjects.map(p => ({
            id: p._id,
            name: p.name
          })) : [],
        },
        assignedProjectsStatus,
        lateSubmissions: {
          list: pendingList,
        },
        bulkRequests: {
          activeRequests: formattedBulkRequests.length,
          list: formattedBulkRequests,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// @desc    Setup Project Details (Manager One-Time)
// @route   PUT /api/v1/manager/projects/:id/setup
// @access  Private (Manager only)
exports.setupProjectDetails = async (req, res, next) => {
  try {
    const Project = require('../../project/models/projectModel');
    
    // Robust Project Resolution
    let project = await Project.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
        { projectId: req.params.id }
      ].filter(q => Object.values(q)[0] !== null)
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify ownership or assignment
    const isOwner = project.manager && project.manager.toString() === req.user.id;
    const isAssigned = req.user.assignedProjects && req.user.assignedProjects.some(pid => pid.toString() === project._id.toString());

    if (!isOwner && !isAssigned) {
      return res.status(403).json({ success: false, message: 'Not authorized to setup this project' });
    }

    // Check if already locked
    if (project.isLocked) {
      return res.status(400).json({ success: false, message: 'Project details are locked. Contact Admin for changes.' });
    }

    // Update fields
    const {
      projectCategory,
      workOrderNo,
      description,
      allocatedTarget,
      trainingHours,
      trainingCostPerHour,
      totalProjectCost,
      installment1Status,
      installment1Date,
      assessmentFeesPaidBy,
      assessmentStatus,
      assessmentDate,
      totalPassOut,
      installment2Status,
      installment2Date,
      maxDemonstrators,
      location,
      projectAddress,
      startDate,
      endDate
    } = req.body;

    const updateData = {
      projectCategory: projectCategory || project.projectCategory,
      workOrderNo: workOrderNo || project.workOrderNo,
      description: description || project.description,
      allocatedTarget: allocatedTarget || project.allocatedTarget,
      trainingHours: trainingHours || project.trainingHours,
      trainingCostPerHour: trainingCostPerHour || project.trainingCostPerHour,
      totalProjectCost: totalProjectCost || project.totalProjectCost,
      installment1Status: installment1Status || project.installment1Status,
      installment1Date: installment1Date || project.installment1Date,
      assessmentFeesPaidBy: assessmentFeesPaidBy || project.assessmentFeesPaidBy,
      assessmentStatus: assessmentStatus || project.assessmentStatus,
      assessmentDate: assessmentDate || project.assessmentDate,
      totalPassOut: totalPassOut !== undefined ? totalPassOut : project.totalPassOut,
      installment2Status: installment2Status || project.installment2Status,
      installment2Date: installment2Date || project.installment2Date,
      maxDemonstrators: maxDemonstrators || project.maxDemonstrators,
      location: location || project.location,
      projectAddress: projectAddress || project.projectAddress,
      startDate: startDate || project.startDate,
      endDate: endDate || project.endDate,
      isLocked: true // Lock after first setup
    };

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: false
    });

    res.status(200).json({
      success: true,
      message: 'Project details submitted and locked successfully',
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Projects Assigned to this Manager
// @route   GET /api/v1/manager/my-projects
// @access  Private (Manager only)
exports.getAssignedProjects = async (req, res, next) => {
  try {
    const Project = require('../../project/models/projectModel');
    let rawProjects;

    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findById(req.user.id).populate('assignedProjects');
      rawProjects = (trainer && trainer.assignedProjects) ? trainer.assignedProjects : [];
    } else {
      // Find all projects where this manager is assigned
      rawProjects = await Project.find({ manager: req.user.id });
    }
    
    // Standardize the response format
    const projects = rawProjects.map(p => ({
      projectId: p._id,
      name: p.name,
      category: p.projectCategory,
      workOrderNo: p.workOrderNo,
      status: p.status,
      address: p.projectAddress,
      location: p.location,
      startDate: p.startDate,
      endDate: p.endDate,
      progress: p.progressStatus,
      isLocked: p.isLocked
    }));

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Get detailed project info
// @route   GET /api/v1/manager/projects/:id
// @access  Private (Manager)
// ─────────────────────────────────────────────
exports.getProjectDetails = async (req, res, next) => {
  try {
    const Project = require('../../project/models/projectModel');
    
    // Robust Project Resolution
    const project = await Project.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
        { projectId: req.params.id }
      ].filter(q => Object.values(q)[0] !== null)
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Security: check if this project is assigned to the manager (fetch fresh from DB)
    const Manager = require('../models/managerModel');
    const managerDoc = await Manager.findById(req.user.id).select('assignedProjects');
    const isAssigned = managerDoc && managerDoc.assignedProjects &&
      managerDoc.assignedProjects.some(pid => pid.toString() === project._id.toString());
    const isOwner = project.manager && project.manager.toString() === req.user.id;

    if (!isOwner && !isAssigned) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this project' });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// Helper — JWT token response
// ─────────────────────────────────────────────
const sendTokenResponse = (manager, statusCode, res) => {
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
      role: manager.role,
      assignedProjects: manager.assignedProjects,
    },
  });
};

// ─────────────────────────────────────────────
// @desc    Assign multiple Trainers to a Project (Sync)
// @route   POST /api/v1/manager/projects/:id/assign-trainers
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────
exports.assignTrainersToProject = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { trainerIds } = req.body; // Array of Trainer IDs

    if (!trainerIds || !Array.isArray(trainerIds)) {
      return res.status(400).json({ success: false, message: 'Please provide an array of trainerIds' });
    }

    // 1. Get all trainers that this manager is allowed to manage
    let query = {};
    if (req.user.role === 'manager') {
      const managerId = new mongoose.Types.ObjectId(req.user.id);
      query = { 
        $or: [
          { createdBy: managerId },
          { reportingManager: managerId }
        ]
      };
    }
 else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const availableTrainers = await Trainer.find(query);

    // 2. Sync assignment
    const updatePromises = availableTrainers.map(async (trainer) => {
      const isSelected = trainerIds.includes(trainer._id.toString());
      const isCurrentlyAssigned = trainer.assignedProjects.some(pid => pid.toString() === projectId);

      if (isSelected && !isCurrentlyAssigned) {
        // Add project
        trainer.assignedProjects.push(projectId);
        trainer.assignedBy = req.user.id;
        await trainer.save();
      } else if (!isSelected && isCurrentlyAssigned) {
        // Remove project
        trainer.assignedProjects = trainer.assignedProjects.filter(pid => pid.toString() !== projectId);
        await trainer.save();
      }
    });

    await Promise.all(updatePromises);

    res.status(200).json({ 
      success: true, 
      message: 'Project personnel assignment synchronized successfully' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
