const express = require("express");
const router = express.Router();

const { protect } = require("../../../middlewares/authMiddleware");
const {
  trainerOnly,
  requireProfileComplete,
} = require("../middlewares/trainerMiddleware");

const {
  trainerLogin,
  completeProfile,
  resetPasswordDirect,
} = require("../controllers/trainerAuthController");

const {
  submitAttendance,
  submitBulkRequest,
  getBulkRequests
} = require("../../attendance/controllers/attendanceController");

// Profile Controllers
const {
  getMyProfile,
  updateMyProfile,
  getAttendanceHistory,
  getAssignedProjects,
} = require("../controllers/trainerProfileController");

// Manager-side Trainer CRUD (used in manager routes — kept here for reference)
const {
  addNewTrainer,
  getAllTrainers,
  getTrainer,
  updateTrainer,
  deleteTrainer,
} = require("../controllers/trainerController");

// ─────────────────────────────────────────────────────────────
// PUBLIC — No auth needed
// ─────────────────────────────────────────────────────────────
router.post("/auth/login", trainerLogin);

// Testing route to trigger 7:15 PM logic manually
const { runReminderJob } = require('../../../utils/reminderCron');
const Trainer = require('../models/trainerModel'); 
const { sendPushNotification } = require('../../../utils/onesignal');
const Notification = require('../../notification/models/notificationModel');

router.get("/auth/test-notification", async (req, res) => {
  try {
    const isForce = req.query.force === 'true';
    const isReset = req.query.reset === 'true';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isReset) {
      console.log('--- [RESET] Deleting today\'s absent records for testing ---');
      const Attendance = require('../../attendance/models/attendanceModel');
      await Attendance.deleteMany({ date: today, status: 'absent' });
    }

    if (isForce) {
      console.log('--- [FORCE] Sending test notifications to all active trainers with IDs ---');
      const trainers = await Trainer.find({ status: 'active', oneSignalPlayerId: { $ne: null } });
      const playerIds = trainers.map(t => t.oneSignalPlayerId);
      
      if (playerIds.length > 0) {
        await sendPushNotification(playerIds, "bhai tune attendance nahi lagayi gaddari karbe", "Test Force Notification", true);
        
        for (const t of trainers) {
          await Notification.create({
            recipientId: t._id,
            title: "Test Force Notification",
            message: "bhai tune attendance nahi lagayi gaddari karbe",
            type: 'test_force',
            status: 'sent'
          });
        }
        return res.json({ success: true, message: `Force notification sent to ${playerIds.length} trainers. Reset: ${isReset}` });
      }
      return res.json({ success: false, message: "No active trainers with OneSignal IDs found." });
    }

    const count = await runReminderJob();
    res.json({ success: true, message: `Job executed. Notifications sent to ${count} trainers. Reset: ${isReset}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SEMI-PROTECTED — Trainer must be logged in but profile
//                 completion NOT required yet
//                 (These are the onboarding steps)
// ─────────────────────────────────────────────────────────────
router.post('/auth/reset-password-direct', resetPasswordDirect);

router.post("/auth/complete-profile", protect, trainerOnly, completeProfile);

const { uploadHousePhoto } = require("../../../utils/cloudinary");
// Mark Attendance (Choose project -> Date -> Media -> Submit)
router.post(
  "/attendance/submit",
  protect,
  trainerOnly,
  requireProfileComplete,
  uploadHousePhoto.fields([
    { name: 'photos', maxCount: 4 },
    { name: 'videos', maxCount: 2 }
  ]),
  submitAttendance
);

// ─────────────────────────────────────────────────────────────
// FULLY PROTECTED — Trainer must be logged in AND profile complete
//                  All feature routes go here
// ─────────────────────────────────────────────────────────────

router.get(
  "/profile/me",
  protect,
  trainerOnly,
  getMyProfile,
);
router.get(
  "/projects",
  protect,
  trainerOnly,
  requireProfileComplete,
  getAssignedProjects,
);
router.post(
  "/profile/update",
  protect,
  trainerOnly,
  requireProfileComplete,
  updateMyProfile,
);
router.get(
  "/attendance/history/:projectId",
  protect,
  trainerOnly,
  requireProfileComplete,
  getAttendanceHistory,
);
router.post(
  "/attendance/bulk-request",
  protect,
  trainerOnly,
  requireProfileComplete,
  submitBulkRequest
);
router.get(
  "/attendance/requests",
  protect,
  trainerOnly,
  requireProfileComplete,
  getBulkRequests
);

const {
  uploadEvidence
} = require("../../attendance/controllers/evidenceController");

router.post(
  "/evidence/upload",
  protect,
  trainerOnly,
  requireProfileComplete,
  uploadHousePhoto.fields([
    { name: 'photos', maxCount: 3 },
    { name: 'video', maxCount: 1 }
  ]),
  uploadEvidence
);

module.exports = router;
