const Manager = require('../models/managerModel');
const Trainer = require('../../trainer/models/trainerModel');
const Attendance = require('../../attendance/models/attendanceModel');
const sendEmail = require('../../../utils/sendEmail');
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

    const manager = await Manager.findOne({ username }).select('+password');

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
    const manager = await Manager.findById(req.user.id);
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });

    res.status(200).json({ success: true, data: manager });
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

    const manager = await Manager.findById(req.user.id);
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
    const { trainerId, projectName } = req.body;

    if (!trainerId || !projectName) {
      return res.status(400).json({ success: false, message: 'Please provide trainerId and projectName' });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    if (trainer.status === 'inactive') {
      return res.status(400).json({ success: false, message: 'Cannot assign project to an inactive trainer' });
    }

    trainer.assignedProject = projectName;
    await trainer.save();

    res.status(200).json({
      success: true,
      message: `Trainer "${trainer.fullName}" (${trainer.trainerId}) assigned to project "${projectName}"`,
      data: {
        trainerId: trainer.trainerId,
        fullName: trainer.fullName,
        assignedProject: trainer.assignedProject,
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
    // await sendEmail({ to: trainer.email, subject, text: message });

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
      .populate('trainerId', 'fullName trainerId mobileNumber assignedProject')
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

    attendance.status = 'rejected';
    attendance.approvedBy = req.user.id;
    attendance.approvedAt = new Date();
    attendance.rejectionReason = rejectionReason;

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
    const manager = await Manager.findById(req.user.id);
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });

    // ── 1. Assigned Projects Status ─────────────────────────
    const Project = require('../../project/models/projectModel');
    const projects = await Project.find({ manager: req.user.id });

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
      const trainersCount = await Trainer.countDocuments({ assignedProject: prj.name });
      const presentToday = todayProjectAttendance[prj.name] || 0;
      const percentage = trainersCount > 0 ? Math.round((presentToday / trainersCount) * 100) : 0;

      return {
        projectName: prj.name,
        location: `${prj.location.district}, ${prj.location.state}`,
        totalTrainers: trainersCount,
        presentToday,
        completionPercentage: percentage,
        healthStatus: percentage >= 70 ? 'HEALTHY' : 'ATTENTION NEEDED',
      };
    }));

    // ── 2. Approval Insights ─────────────────────────────────
    const pendingApprovals = await Attendance.countDocuments({ status: 'pending_approval' });

    // Approved today by this manager
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const approvedToday = await Attendance.countDocuments({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const approvalInsights = {
      pendingApprovals,
      approvedToday,
      tip: 'Trainers with more than 8 days of missing attendance require manual verification before approving their late uploads.',
    };

    // ── 3. Late Submission Approvals (> 5 days late) ─────────
    const lateSubmissions = await Attendance.find({
      status: 'pending_approval',
      daysLate: { $gt: 5 },
    })
      .populate('trainerId', 'fullName trainerId mobileNumber assignedProject district')
      .sort({ daysLate: -1 }); // most late first

    const lateSubmissionList = lateSubmissions.map((att) => ({
      attendanceId: att._id,
      trainer: {
        name: att.trainerId?.fullName || 'N/A',
        trainerId: att.trainerId?.trainerId || 'N/A',
        mobile: att.trainerId?.mobileNumber || 'N/A',
      },
      project: att.projectId,
      date: att.date,
      daysMissing: att.daysLate,
      status: att.status,
      remarks: att.remarks || null,
    }));

    // ── Final Response ────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        manager: {
          name: manager.fullName,
          managerId: manager.managerId,
          assignedProject: manager.assignedProject,
        },
        assignedProjectsStatus,
        approvalInsights,
        lateSubmissions: {
          activeRequests: lateSubmissionList.length,
          list: lateSubmissionList,
        },
      },
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
    let projects;

    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findById(req.user.id);
      if (!trainer || !trainer.assignedProject || trainer.assignedProject === 'None') {
        projects = [];
      } else {
        // Find project by name as assigned in Trainer's profile
        projects = await Project.find({ name: trainer.assignedProject });
      }
    } else {
      // Manager gets all projects assigned to them
      projects = await Project.find({ manager: req.user.id });
    }
    
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
      assignedProject: manager.assignedProject,
    },
  });
};
