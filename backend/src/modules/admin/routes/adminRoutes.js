const express = require("express");
const {
  register,
  login,
  addNewManager,
  getAllManagers,
  getManager,
  updateManager,
  deleteManager,
  resetManagerPassword,
  getAllTrainers,
  getTrainer,
  updateTrainer,
  toggleTrainerStatus,
  logout,
  deleteAccount,
  getDashboardStats,
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  getPhotosByDate,
  getPhotosByTrainer,
  exchangeTrainerProject,
} = require("../controllers/adminController");
const { 
  exportStaffPerformance, 
  downloadProjectPhotos, 
  exportProjectSummary,
  exportPhotoSummaryReport,
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../../../middlewares/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);

// ─────────────────────────────────────────────
// Auth routes
// ─────────────────────────────────────────────
// Dashboard / Reports
// ─────────────────────────────────────────────
router.get("/dashboard-stats", protect, adminOnly, getDashboardStats);
router.get("/logout", protect, logout);
router.delete("/delete-account", protect, adminOnly, deleteAccount);
router.route("/projects")
  .get(protect, adminOnly, getAllProjects)
  .post(protect, adminOnly, createProject);

router.route("/projects/:id")
  .get(protect, adminOnly, getProject)
  .put(protect, adminOnly, updateProject);

// ─────────────────────────────────────────────
// Manager CRUD
// ─────────────────────────────────────────────
router.post("/add-manager", protect, adminOnly, addNewManager);
router.get("/managers", protect, adminOnly, getAllManagers);

router
  .route("/managers/:id")
  .get(protect, adminOnly, getManager)
  .put(protect, adminOnly, updateManager)
  .delete(protect, adminOnly, deleteManager);

// Reset Manager Password (dedicated endpoint)
router.put("/managers/:id/reset-password", protect, adminOnly, resetManagerPassword);

// ─────────────────────────────────────────────
// Photo Monitoring (Admin)
// ─────────────────────────────────────────────
router.get("/photos/date-wise", protect, adminOnly, getPhotosByDate);
router.get("/photos/trainer-wise", protect, adminOnly, getPhotosByTrainer);

// ─────────────────────────────────────────────
// Trainer Management (Admin)
// ─────────────────────────────────────────────
router.get("/trainers", protect, adminOnly, getAllTrainers);

router
  .route("/trainers/:id")
  .get(protect, adminOnly, getTrainer)
  .put(protect, adminOnly, updateTrainer);

// Exchange Trainer Project (Admin)
router.post("/trainers/exchange-project", protect, adminOnly, exchangeTrainerProject);

// Activate / Deactivate Trainer
router.patch("/trainers/:id/status", protect, adminOnly, toggleTrainerStatus);

// ─────────────────────────────────────────────
// Reports & Exports
// ─────────────────────────────────────────────
router.get("/reports/staff-performance", protect, adminOnly, exportStaffPerformance);
router.get("/reports/project-photos/:projectId", protect, adminOnly, downloadProjectPhotos);
router.get("/reports/project-summary/:id", protect, exportProjectSummary);
router.get("/reports/photo-summary", protect, adminOnly, exportPhotoSummaryReport);

module.exports = router;
