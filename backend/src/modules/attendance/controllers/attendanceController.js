const mongoose = require('mongoose');
const Attendance = require('../models/attendanceModel');
const Project = require('../../project/models/projectModel');
const Trainer = require('../../trainer/models/trainerModel');

// ─────────────────────────────────────────────────────────────
// @desc    Mark attendance for a project
// @route   POST /api/v1/attendance/mark
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  try {
    const { projectId, date, latitude, longitude, remarks } = req.body;
    const trainerId = req.user.id;

    // 1. Verify existence and assignment
    const trainer = await Trainer.findById(trainerId);
    if (!trainer || !trainer.assignedProjects.includes(projectId)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this project' });
    }

    // Photo/Video upload is now optional based on trainer choice
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = req.files.map(file => file.path);
    }

    // Convert date to start of day for unique check
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this day and project
    const existingEntry = await Attendance.findOne({
      trainerId: trainerId,
      projectId: projectId,
      date: attendanceDate
    });

    if (existingEntry) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this date and project' });
    }

    const attendance = await Attendance.create({
      trainerId: trainerId,
      projectId: projectId,
      date: attendanceDate,
      photos: photoUrls,
      location: { latitude, longitude },
      remarks
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get trainer's attendance history for a project
// @route   GET /api/v1/attendance/my-history/:projectId
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.getMyAttendance = async (req, res) => {
  try {
    const { projectId } = req.params;
    const trainerId = req.user.id;

    const history = await Attendance.find({
      trainerId: trainerId,
      projectId: projectId
    }).sort({ date: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all attendance for a project (for Managers)
// @route   GET /api/v1/attendance/project/:projectId
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.getProjectAttendance = async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await Attendance.find({ projectId: projectId })
      .populate('trainerId', 'name username employeeId staffRole')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ─────────────────────────────────────────────────────────────
// @desc    Submit attendance with multi-media (Photos & Videos)
// @route   POST /api/v1/trainer/attendance/submit
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.submitAttendance = async (req, res) => {
  try {
    const { projectId, date, latitude, longitude, remarks } = req.body;
    const trainerId = req.user.id;

    // 1. Verify existence and assignment
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    // Robust Project Resolution
    const foundProject = await Project.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(projectId) ? projectId : null },
        { projectId: projectId }
      ].filter(q => Object.values(q)[0] !== null)
    });

    if (!foundProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if project is assigned to trainer
    if (!trainer.assignedProjects.some(id => id.toString() === foundProject._id.toString())) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this project' });
    }

    // 2. Handle Media (Photos and Videos)
    const photoUrls = req.files && req.files['photos'] ? req.files['photos'].map(f => f.path) : [];
    const videoUrls = req.files && req.files['videos'] ? req.files['videos'].map(f => f.path) : [];

    // 3. Process Date and Late Logic
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate difference in days (0 = today, 1 = yesterday, etc.)
    const diffTime = today - attendanceDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (attendanceDate > today) {
      return res.status(400).json({ success: false, message: 'Cannot mark attendance for future dates' });
    }

    // Strict 5-day rule (e.g., if today is 10, then 10, 9, 8, 7, 6 are allowed)
    // 10-6 = 4 days difference. So diffDays <= 4 is allowed.
    if (diffDays > 4) {
      return res.status(403).json({ 
        success: false, 
        message: `Attendance for ${diffDays + 1} days ago cannot be marked directly. Please submit an approval request through the Bulk Request section.` 
      });
    }

    // 4. Auto-Remark and Status
    const autoRemark = " - Marked";
    const finalRemarks = remarks ? `${remarks}${autoRemark}` : 'Marked';

    // 5. Check for duplicate
    const existingEntry = await Attendance.findOne({ trainerId, projectId, date: attendanceDate });
    if (existingEntry) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this date and project' });
    }

    // 6. Create record
    const attendance = await Attendance.create({
      trainerId,
      projectId,
      date: attendanceDate,
      photos: photoUrls,
      videos: videoUrls,
      location: { 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      },
      status: 'present',
      requiresApproval: false,
      daysLate: diffDays,
      remarks: finalRemarks
    });

    res.status(201).json({
      success: true,
      message,
      data: attendance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Apply for bulk attendance permission
// @route   POST /api/v1/trainer/attendance/bulk-request
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.submitBulkRequest = async (req, res) => {
  try {
    const { projectId, requestedDates, remarks } = req.body;
    const trainerId = req.user.id;
    const BulkRequest = require('../models/bulkRequestModel');

    // 1. Find the project and verify assignment
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const foundProject = await Project.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(projectId) ? projectId : null },
        { projectId: projectId }
      ].filter(q => Object.values(q)[0] !== null)
    });

    if (!foundProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if assigned
    if (!trainer.assignedProjects.some(id => id.toString() === foundProject._id.toString())) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this project' });
    }

    if (!foundProject.manager) {
      return res.status(400).json({ success: false, message: 'No manager is currently assigned to this project. Cannot send request.' });
    }

    // 2. Create the bulk request record (No validations as per request)
    const request = await BulkRequest.create({
      trainerId,
      projectId: foundProject.projectId, // Store custom ID for display
      requestedDates: requestedDates.map(d => new Date(d)),
      managerId: foundProject.manager,
      remarks,
      status: 'Pending Approval'
    });

    res.status(201).json({
      success: true,
      message: 'Bulk attendance permission application submitted to manager.',
      data: request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get trainer's bulk request history
// @route   GET /api/v1/trainer/attendance/requests
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.getBulkRequests = async (req, res) => {
  try {
    const trainerId = req.user.id;
    const BulkRequest = require('../models/bulkRequestModel');

    const requests = await BulkRequest.find({ trainerId })
      .sort({ submittedAt: -1 });

    // We might want to attach project name manually since projectId is a string not ObjectId
    const enhancedRequests = await Promise.all(requests.map(async (reqDoc) => {
      const proj = await Project.findOne({ projectId: reqDoc.projectId });
      return {
        ...reqDoc._doc,
        projectName: proj ? proj.name : 'Unknown Project'
      };
    }));

    res.status(200).json({
      success: true,
      data: enhancedRequests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all attendance for manager's trainers
// @route   GET /api/v1/attendance/all-projects
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.getAllAttendanceForManager = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      // Find trainers created by this manager
      const trainers = await Trainer.find({ createdBy: req.user.id }).select('_id');
      const trainerIds = trainers.map(t => t._id);
      query = { trainerId: { $in: trainerIds } };
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const attendance = await Attendance.find(query)
      .populate('trainerId', 'fullName trainerId mobileNumber accountRole')
      .sort({ date: -1 })
      .lean();

    // Resolve Project Names with robust comparison
    const projects = await Project.find({}).lean();
    const enrichedAttendance = attendance.map(att => {
      const attProjId = String(att.projectId || '');
      
      // Look for project by _id, custom projectId, or even name
      const projectDoc = projects.find(p => 
        String(p._id) === attProjId || 
        String(p.projectId) === attProjId ||
        String(p.name) === attProjId
      );
      
      return {
        ...att,
        projectName: projectDoc ? projectDoc.name : (attProjId.length > 10 ? 'Project Deleted' : att.projectId)
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedAttendance.length,
      data: enrichedAttendance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
