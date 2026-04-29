const express = require('express');
const router = express.Router();

const { protect } = require('../../../middlewares/authMiddleware');
const { adminOnly } = require('../../admin/middlewares/adminMiddleware');
const { trainerOnly } = require('../../trainer/middlewares/trainerMiddleware');
const { managerOnly } = require('../../manager/middlewares/managerMiddleware');

const {
  createBeneficiary,
  getAllBeneficiaries,
  getBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
} = require('../controllers/beneficiaryController');

const {
  getAllBeneficiariesForTrainer,
  assignBeneficiary,
  getMyAssignments,
  getManagerRequests,
  approveAssignment,
  rejectAssignment,
} = require('../controllers/beneficiaryAssignmentController');

// ── Admin Routes ─────────────────────────────────────────────────
router.post('/create',  protect, adminOnly, createBeneficiary);
router.get('/list',     protect, adminOnly, getAllBeneficiaries);

// ── Trainer Routes ── (before /:id to avoid conflict) ───────────
router.get('/all',            protect, trainerOnly, getAllBeneficiariesForTrainer);
router.post('/assign',        protect, trainerOnly, assignBeneficiary);
router.get('/my-assignments', protect, trainerOnly, getMyAssignments);

// ── Manager Routes ───────────────────────────────────────────────
router.get('/requests',             protect, managerOnly, getManagerRequests);
router.put('/requests/:id/approve', protect, managerOnly, approveAssignment);
router.put('/requests/:id/reject',  protect, managerOnly, rejectAssignment);

// ── Admin Parameterized Routes ───────────────────────────────────
router.get('/:id',    protect, adminOnly, getBeneficiary);
router.put('/:id',    protect, adminOnly, updateBeneficiary);
router.delete('/:id', protect, adminOnly, deleteBeneficiary);

module.exports = router;
