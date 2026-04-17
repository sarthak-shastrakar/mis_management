const Project = require('../models/projectModel');
const { cloudinary } = require('../../../utils/cloudinary');

// ─────────────────────────────────────────────────────────────
// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private (Admin/Manager)
// ─────────────────────────────────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const { 
      projectCategory, 
      workOrderNo, 
      description, 
      allocatedTarget, 
      trainingHours, 
      trainingCostPerHour,
      startDate,
      endDate,
      location,
      projectAddress,
      maxDemonstrators
    } = req.body;

    // Check if project exists
    const projectExists = await Project.findOne({ workOrderNo });
    if (projectExists) {
      return res.status(400).json({ success: false, message: 'Project with this Work Order No already exists' });
    }

    // Sanction Order File is mandatory
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a Sanction Order (PDF/JPG)' });
    }

    // Cost Calculation
    const totalProjectCost = allocatedTarget * trainingHours * trainingCostPerHour;

    const project = await Project.create({
      projectCategory,
      workOrderNo,
      description,
      sanctionOrderUrl: req.file.path, // Cloudinary URL
      allocatedTarget,
      trainingHours,
      trainingCostPerHour,
      totalProjectCost,
      startDate,
      endDate,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      projectAddress,
      maxDemonstrators,
      manager: req.user.role === 'admin' ? req.body.managerId : req.user.id,
      managerAssignedAt: (req.user.role === 'admin' && req.body.managerId) || (req.user.role === 'manager') ? new Date() : undefined,
      isLocked: false // Open for first-time filling of details
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update project details (Installments, Assessment)
// @route   PUT /api/v1/projects/:id
// @access  Private (Admin/Manager)
// ─────────────────────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Business Rule: Manager can only update if not locked
    if (req.user.role === 'manager' && project.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Project details are locked. Please contact Admin to make further changes.' 
      });
    }

    const {
      installment1Status,
      installment1Date,
      assessmentFeesPaidBy,
      assessmentStatus,
      assessmentDate,
      totalPassOut,
      installment2Status,
      installment2Date,
      progressStatus,
      lockProject // Flag to lock the project after first entry
    } = req.body;

    // Update fields
    if (installment1Status)   project.installment1Status   = installment1Status;
    if (installment1Date)     project.installment1Date     = installment1Date;
    if (assessmentFeesPaidBy) project.assessmentFeesPaidBy = assessmentFeesPaidBy;
    if (assessmentStatus)     project.assessmentStatus     = assessmentStatus;
    if (assessmentDate)       project.assessmentDate       = assessmentDate;
    if (totalPassOut)         project.totalPassOut         = totalPassOut;
    if (installment2Status)   project.installment2Status   = installment2Status;
    if (installment2Date)     project.installment2Date     = installment2Date;
    if (progressStatus)       project.progressStatus       = progressStatus;

    // Lock logic: If manager saves, it becomes locked
    if (req.user.role === 'manager' && lockProject) {
      project.isLocked = true;
    }

    // Admin can toggle lock and change manager
    if (req.user.role === 'admin') {
      if (req.body.isLocked !== undefined) {
        project.isLocked = req.body.isLocked;
      }
      if (req.body.managerId !== undefined && req.body.managerId !== project.manager?.toString()) {
        project.manager = req.body.managerId;
        project.managerAssignedAt = new Date();
      }
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get All Projects
// @route   GET /api/v1/projects
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({ manager: req.user.id });
    }

    const projects = await query.populate('manager', 'fullName');
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
