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

// ─────────────────────────────────────────────────────────────
// SEMI-PROTECTED — Trainer must be logged in but profile
//                 completion NOT required yet
//                 (These are the onboarding steps)
// ─────────────────────────────────────────────────────────────
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

module.exports = router;
