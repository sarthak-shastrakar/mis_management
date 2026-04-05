const express = require("express");
const router = express.Router();

const { protect } = require("../../../middlewares/authMiddleware");
const {
  trainerOnly,
  requireProfileComplete,
} = require("../middlewares/trainerMiddleware");

const { uploadStaffPhoto } = require("../../../utils/cloudinary");
const {
  trainerLogin,
  setFirstPassword,
  completeProfile,
} = require("../controllers/trainerAuthController");

// Profile Controllers
const {
  getMyProfile,
  updateMyProfile,
  updatePassword,
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
router.put("/auth/set-password", protect, trainerOnly, setFirstPassword);
router.put("/auth/complete-profile", protect, trainerOnly, completeProfile);

// Selfie Upload (Can be done during onboarding)
router.post(
  "/profile/photo-upload",
  protect,
  trainerOnly,
  uploadStaffPhoto.single("photo"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload a photo" });
    res.status(200).json({ success: true, url: req.file.path });
  }
);

// ─────────────────────────────────────────────────────────────
// FULLY PROTECTED — Trainer must be logged in AND profile complete
//                  All feature routes go here
// ─────────────────────────────────────────────────────────────
router.get(
  "/profile/me",
  protect,
  trainerOnly,
  requireProfileComplete,
  getMyProfile,
);
router.put(
  "/profile/update",
  protect,
  trainerOnly,
  requireProfileComplete,
  updateMyProfile,
);
router.put(
  "/profile/update-password",
  protect,
  trainerOnly,
  requireProfileComplete,
  updatePassword,
);

module.exports = router;
