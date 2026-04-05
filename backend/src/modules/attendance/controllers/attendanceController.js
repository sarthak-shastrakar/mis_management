const Attendance = require('../models/attendanceModel');
const Project = require('../../project/models/projectModel');

// ─────────────────────────────────────────────────────────────
// @desc    Mark attendance for a project
// @route   POST /api/v1/attendance/mark
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  try {
    const { projectId, date, latitude, longitude, remarks } = req.body;
    const trainerId = req.user.id;

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
      return res.status(400).json({ success: false, message: 'Attendance already marked for this date' });
    }

    // Extract Cloudinary URLs from multer files (already handled above)

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
