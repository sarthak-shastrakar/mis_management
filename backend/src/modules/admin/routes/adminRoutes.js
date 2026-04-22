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
  deleteTrainer,
  getDashboardStats,
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getPhotosByDate,
  getPhotosByTrainer,
  exchangeTrainerProject,
  resetAdminPasswordDirect,
  addViewer,
  getAllViewers,
  deleteViewer,
} = require("../controllers/adminController");
const { 
  addExpense,
  getProjectExpenses,
  deleteExpense,
  updateProjectFinancials,
  updateExpense
} = require("../controllers/expenseController");
const { 
  addNewTrainer 
} = require("../../trainer/controllers/trainerController");
const { 
  exportStaffPerformance, 
  downloadProjectPhotos, 
  exportProjectSummary,
  exportPhotoSummaryReport,
  exportProjectStatusExcel,
  generatePhotoAlbumPDF,
  exportAttendanceZip,
} = require("../controllers/reportController");
const { protect, adminOnly, viewAccess } = require("../../../middlewares/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────
router.post("/login", login);
router.post("/reset-password", resetAdminPasswordDirect);

// ─────────────────────────────────────────────
// Auth routes
// ─────────────────────────────────────────────
// Dashboard / Reports
// ─────────────────────────────────────────────
router.get("/dashboard-stats", protect, viewAccess, getDashboardStats);
router.get("/logout", protect, logout);
router.delete("/delete-account", protect, adminOnly, deleteAccount);
router.route("/projects")
  .get(protect, viewAccess, getAllProjects)
  .post(protect, adminOnly, createProject);

router.route("/projects/:id")
  .get(protect, viewAccess, getProject)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

router.put("/projects/:id/financials", protect, adminOnly, updateProjectFinancials);

// Expense Routes
router.route("/expenses")
  .post(protect, adminOnly, addExpense);

router.route("/expenses/:projectId")
  .get(protect, viewAccess, getProjectExpenses);

router.route("/expenses/record/:id")
  .put(protect, adminOnly, updateExpense)
  .delete(protect, adminOnly, deleteExpense);

// ─────────────────────────────────────────────
// Manager CRUD
// ─────────────────────────────────────────────
router.get("/managers", protect, viewAccess, getAllManagers);
router.post("/add-manager", protect, adminOnly, addNewManager);

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
router.get("/photos/date-wise", protect, viewAccess, getPhotosByDate);
router.get("/photos/trainer-wise", protect, viewAccess, getPhotosByTrainer);

// Viewer Management
router.get("/viewers", protect, adminOnly, getAllViewers);
router.post("/viewers", protect, adminOnly, addViewer);
router.delete("/viewers/:id", protect, adminOnly, deleteViewer);

// ─────────────────────────────────────────────
// Trainer Management (Admin)
// ─────────────────────────────────────────────
router.get("/trainers", protect, viewAccess, getAllTrainers);
router.post("/trainers/add", protect, adminOnly, addNewTrainer);

router
  .route("/trainers/:id")
  .get(protect, viewAccess, getTrainer)
  .put(protect, adminOnly, updateTrainer)
  .delete(protect, adminOnly, deleteTrainer);

// Exchange Trainer Project (Admin)
router.post("/trainers/exchange-project", protect, adminOnly, exchangeTrainerProject);

// Activate / Deactivate Trainer
router.patch("/trainers/:id/status", protect, adminOnly, toggleTrainerStatus);

// ─────────────────────────────────────────────
// Reports & Exports
// ─────────────────────────────────────────────
router.get("/reports/staff-performance", protect, viewAccess, exportStaffPerformance);
router.get("/reports/project-photos/:projectId", protect, viewAccess, downloadProjectPhotos);
router.get("/reports/project-summary/:id", protect, exportProjectSummary);
router.get("/reports/project-status-excel", protect, viewAccess, exportProjectStatusExcel);
router.get("/reports/photo-album-pdf", protect, viewAccess, generatePhotoAlbumPDF);
router.get("/reports/photo-summary", protect, viewAccess, exportPhotoSummaryReport);
router.get("/reports/attendance-zip", protect, viewAccess, exportAttendanceZip);

const { getAllEvidence } = require("../../attendance/controllers/evidenceController");
router.get("/evidence", protect, viewAccess, getAllEvidence);

module.exports = router;
