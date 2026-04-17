const mongoose = require('mongoose');
const Attendance = require('../models/attendanceModel');
const Project = require('../../project/models/projectModel');
const Trainer = require('../../trainer/models/trainerModel');
const BulkRequest = require('../models/bulkRequestModel');

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
      .populate('trainerId', 'fullName trainerId mobileNumber accountRole')
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
    if (diffDays > 4) {
      // Robust Date Range Check for Bulk Approval
      const dayStart = new Date(attendanceDate);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(attendanceDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const approvedRequest = await BulkRequest.findOne({
        trainerId: trainerId,
        projectId: { $in: [foundProject._id.toString(), foundProject.projectId] },
        status: 'Approved',
        requestedDates: { $elemMatch: { $gte: dayStart, $lte: dayEnd } }
      });

      if (!approvedRequest) {
        return res.status(403).json({ 
          success: false, 
          message: `Attendance for ${diffDays + 1} days ago cannot be marked directly. Please submit an approval request through the Bulk Request section.` 
        });
      }
    }

    // 4. Auto-Remark and Status
    const autoRemark = " - Marked";
    const finalRemarks = remarks ? `${remarks}${autoRemark}` : 'Marked';

    // 5. Check for duplicate (by ObjectId AND custom projectId to catch auto-created records)
    const existingEntry = await Attendance.findOne({ 
      trainerId, 
      projectId: { $in: [projectId, foundProject.projectId, foundProject._id.toString()] }, 
      date: attendanceDate 
    });
    if (existingEntry) {
      return res.status(200).json({ success: true, message: 'Attendance already marked for this date and project', data: existingEntry });
    }

    // 6. Create record
    const attendance = await Attendance.create({
      trainerId,
      projectId: foundProject._id.toString(), // Use ObjectId for consistency
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
      message: 'Attendance marked successfully',
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

    // 2. Create the bulk request record (Normalize dates to midnight)
    const normalizedDates = requestedDates.map(d => {
      const dateObj = new Date(d);
      dateObj.setHours(0, 0, 0, 0);
      return dateObj;
    });

    const request = await BulkRequest.create({
      trainerId,
      projectId: foundProject.projectId, // Store custom ID for display
      requestedDates: normalizedDates,
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
      // Find trainers created by this manager OR reporting to this manager
      const trainers = await Trainer.find({ 
        $or: [
          { createdBy: req.user.id },
          { reportingManager: req.user.id }
        ]
      }).select('_id');
      const trainerIds = trainers.map(t => t._id);
      query = { trainerId: { $in: trainerIds } };
    } else if (req.user.role === 'viewer') {
      const assigned = req.user.assignedProjects || [];
      query = { projectId: { $in: assigned } };
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
        id: att._id,
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
// ─────────────────────────────────────────────────────────────
// @desc    Approve Bulk Attendance Request
// @route   PUT /api/v1/attendance/bulk-request/:id/approve
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.approveBulkRequest = async (req, res) => {
  try {
    const request = await BulkRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending Approval') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // 1. Update Request Status
    request.status = 'Approved';
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    // 2. Clear any existing "placeholder" attendance records for these dates
    // This allows the trainer to mark them properly with their actual location/photos.
    const dayDates = request.requestedDates.map(d => {
      const dt = new Date(d);
      dt.setHours(0,0,0,0);
      return dt;
    });

    await Attendance.deleteMany({
      trainerId: request.trainerId,
      projectId: { $in: [request.projectId] }, // May need variant check but this is the primary ID
      date: { $in: dayDates }
    });

    // 3. We NO LONGER automatically create Attendance records.
    res.status(200).json({
      success: true,
      message: 'Bulk Request approved. The trainer can now mark attendance for the requested dates.',
      data: request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Reject Bulk Attendance Request
// @route   PUT /api/v1/attendance/bulk-request/:id/reject
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.rejectBulkRequest = async (req, res) => {
  try {
    const request = await BulkRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending Approval') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    request.status = 'Rejected';
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Bulk Request rejected.',
      data: request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all bulk requests (Manager/Admin)
// @route   GET /api/v1/attendance/bulk-requests/all
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.getAllBulkRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      // Find requests specifically assigned to this manager
      query = { managerId: req.user.id };
    } else if (req.user.role !== 'admin' && req.user.role !== 'viewer') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const requests = await BulkRequest.find(query)
      .populate('trainerId', 'fullName trainerId mobileNumber')
      .sort({ submittedAt: -1 })
      .lean();

    // Attach project names
    const projects = await Project.find({}).lean();
    const enrichedRequests = requests.map(r => {
      const proj = projects.find(p => String(p._id) === String(r.projectId) || p.projectId === r.projectId || p.name === r.projectId);
      return {
        ...r,
        id: r._id,
        projectName: proj ? proj.name : 'Unknown Project'
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedRequests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get Specific Trainer's attendance (For Admin/Manager)
// @route   GET /api/v1/attendance/trainer/:trainerId
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.getTrainerAttendance = async (req, res) => {
  try {
    const { trainerId } = req.params;

    // Optional: Manager ownership check
    if (req.user.role === 'manager') {
      const trainer = await Trainer.findById(trainerId);
      if (!trainer || (String(trainer.createdBy) !== req.user.id && String(trainer.reportingManager) !== req.user.id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this trainer\'s records' });
      }
    }

    const attendance = await Attendance.find({ trainerId })
      .populate('projectId', 'name customProjectId')
      .sort({ date: -1 })
      .lean();

    // Resolve project names if projectId is just a string (custom ID)
    const projects = await Project.find({}).lean();
    const enriched = attendance.map(att => {
      const pId = String(att.projectId?._id || att.projectId);
      const projDoc = projects.find(p => String(p._id) === pId || p.projectId === pId || p.name === pId);
      return {
        ...att,
        projectName: projDoc ? projDoc.name : (pId.length > 10 ? 'Project Deleted' : pId)
      };
    });

    res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
