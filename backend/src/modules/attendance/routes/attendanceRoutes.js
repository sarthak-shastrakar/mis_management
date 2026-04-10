const express = require('express');
const router = express.Router();
const { protect, managerOnly, adminOnly } = require('../../../middlewares/authMiddleware');
const { uploadHousePhoto } = require('../../../utils/cloudinary');
const {
  markAttendance,
  getMyAttendance,
  getProjectAttendance,
  getAllAttendanceForManager,
  approveBulkRequest,
  rejectBulkRequest,
  getAllBulkRequests
} = require('../controllers/attendanceController');

// ─────────────────────────────────────────────────────────────
// Attendance Routes
// ─────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/attendance/all-projects
 * @desc    Get all attendance for manager's trainers
 * @access  Private (Manager/Admin)
 */
router.get('/all-projects', protect, getAllAttendanceForManager);

/**
 * @route   POST /api/v1/attendance/mark
 * @desc    Submit daily attendance with photos
 * @access  Private (Trainer)
 */
router.post('/mark', protect, uploadHousePhoto.array('photos', 4), markAttendance);

/**
 * @route   GET /api/v1/attendance/my-history/:projectId
 * @desc    Get trainer's specific project history
 * @access  Private (Trainer)
 */
router.get('/my-history/:projectId', protect, getMyAttendance);

/**
 * @route   GET /api/v1/attendance/project/:projectId
 * @desc    Get project-wide attendance (for Managers)
 * @access  Private (Manager/Admin)
 */
router.get('/project/:projectId', protect, getProjectAttendance);

// --- Bulk Request Operations ---
router.get('/bulk-requests/all', protect, managerOnly, getAllBulkRequests);
router.put('/bulk-request/:id/approve', protect, managerOnly, approveBulkRequest);
router.put('/bulk-request/:id/reject', protect, managerOnly, rejectBulkRequest);

module.exports = router;
