const express = require('express');
const router = express.Router();
const { protect, adminOnly, managerOnly } = require('../../../middlewares/authMiddleware');
const { uploadProjectDoc } = require('../../../utils/cloudinary');
const { createProject, updateProject, getProjects } = require('../controllers/projectController');

// ─────────────────────────────────────────────────────────────
// Project Routes
// ─────────────────────────────────────────────────────────────

// @route   POST /api/v1/projects
// @desc    Admin or Manager creates a project with Sanction Order
router.post('/', protect, uploadProjectDoc.single('sanctionOrder'), createProject);

// @route   GET /api/v1/projects
// @desc    List projects (Admin = All, Manager = Assigned Only)
router.get('/', protect, getProjects);

// @route   PUT /api/v1/projects/:id
// @desc    Update project (Locked for Manager after initial entry)
router.put('/:id', protect, updateProject);

module.exports = router;
