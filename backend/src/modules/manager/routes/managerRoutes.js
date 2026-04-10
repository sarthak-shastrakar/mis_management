const express = require('express');
const {
  login,
  getMe,
  updateProfile,
  updatePassword,
  assignTrainer,
  sendNotification,
  getPendingAttendances,
  approveAttendance,
  rejectAttendance,
  getDashboard,
  getAssignedProjects,
  setupProjectDetails,
  getProjectDetails,
  assignTrainersToProject,
} = require('../controllers/managerController');

const {
  addNewTrainer,
  getAllTrainers,
  getTrainer,
  updateTrainer,
  deleteTrainer,
} = require('../../trainer/controllers/trainerController');

const { protect, managerOnly } = require('../../../middlewares/authMiddleware');

const router = express.Router();

// ─────────────────────────────────────────────
// Public
// ─────────────────────────────────────────────
router.post('/login', login);

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
router.get('/dashboard', protect, managerOnly, getDashboard);
router.get('/my-projects', protect, getAssignedProjects);
router.get('/projects/:id', protect, managerOnly, getProjectDetails);

// ─────────────────────────────────────────────
// Manager Profile
// ─────────────────────────────────────────────
router.get('/me', protect, managerOnly, getMe);
router.put('/update-profile', protect, managerOnly, updateProfile);
router.put('/update-password', protect, managerOnly, updatePassword);


// ─────────────────────────────────────────────
// Trainer Management (by Manager)
// ─────────────────────────────────────────────
router.post('/trainers/add', protect, managerOnly, addNewTrainer);
router.get('/trainers', protect, managerOnly, getAllTrainers);

router
  .route('/trainers/:id')
  .get(protect, managerOnly, getTrainer)
  .put(protect, managerOnly, updateTrainer)
  .delete(protect, managerOnly, deleteTrainer);

// ─────────────────────────────────────────────
// Project Setup (Manager One-Time)
// ─────────────────────────────────────────────
router.put('/projects/:id/setup', protect, managerOnly, setupProjectDetails);
router.post('/projects/:id/assign-trainers', protect, managerOnly, assignTrainersToProject);

// ─────────────────────────────────────────────
// Assign Trainer to Project
// ─────────────────────────────────────────────
router.post('/assign-trainer', protect, managerOnly, assignTrainer);

// ─────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────
router.post('/send-notification', protect, managerOnly, sendNotification);

// ─────────────────────────────────────────────
// Attendance Approvals
// ─────────────────────────────────────────────
router.get('/attendance/pending', protect, managerOnly, getPendingAttendances);
router.put('/attendance/:id/approve', protect, managerOnly, approveAttendance);
router.put('/attendance/:id/reject', protect, managerOnly, rejectAttendance);

module.exports = router;

