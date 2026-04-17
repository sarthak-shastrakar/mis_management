const mongoose = require('mongoose');
const Admin = require('../models/adminModel');
const Manager = require('../../manager/models/managerModel');
const Trainer = require('../../trainer/models/trainerModel');
const Project = require('../../project/models/projectModel');
const Attendance = require('../../attendance/models/attendanceModel');
const Viewer = require('../../viewer/models/viewerModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// @desc    Get Dashboard Stats
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let projectQuery = {};
    let managerQuery = {};
    let trainerQuery = {};
    let attendanceQuery = { createdAt: { $gte: todayStart, $lte: todayEnd } };

    if (req.user.role === 'viewer') {
      const assigned = req.user.assignedProjects || [];
      projectQuery = { _id: { $in: assigned } };
      managerQuery = { assignedProjects: { $in: assigned } };
      trainerQuery = { assignedProjects: { $in: assigned } };
      attendanceQuery = {
        createdAt: { $gte: todayStart, $lte: todayEnd },
        projectId: { $in: assigned }
      };
    }

    const totalProjects = await Project.countDocuments(projectQuery);
    const activeManagers = await Manager.countDocuments(managerQuery);
    const fieldTrainers = await Trainer.countDocuments(trainerQuery);
    const dailyUploadsCount = await Attendance.countDocuments(attendanceQuery);

    // Fetch recent active projects
    const recentProjects = await Project.find(projectQuery)
      .populate('manager', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Supplement project data with trainer counts
    const projectsWithDetails = await Promise.all(recentProjects.map(async (prj) => {
      const trainersCount = await Trainer.countDocuments({ assignedProjects: prj._id });
      return {
        _id: prj._id,
        id: prj.projectId || prj._id.toString().slice(-6).toUpperCase(),
        mongoId: prj._id,
        name: prj.name,
        manager: prj.manager ? prj.manager.fullName : 'Not Assigned',
        trainers: trainersCount
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeManagers,
        fieldTrainers,
        dailyUploads: dailyUploadsCount,
        recentProjects: projectsWithDetails
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create New Project
// @route   POST /api/v1/admin/projects
// @access  Private (Admin Only)
exports.createProject = async (req, res, next) => {
  try {
    const {
      name,
      managerId,
      location,
      totalProjectCost,
      startDate,
      endDate,
      workOrderNo,
      projectCategory,
      allocatedTarget,
      trainingHours,
      description
    } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Request body is missing or empty' });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project Name is required' });
    }

    // Check if work order number already exists
    if (workOrderNo) {
      const projectExists = await Project.findOne({ workOrderNo });
      if (projectExists) {
        return res.status(400).json({ success: false, message: 'Work Order Number already exists' });
      }
    }

    // Generate unique project ID (Random suffix to prevent duplicates)
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const projectId = `PRJ-${uniqueSuffix}`;

    const project = await Project.create({
      name,
      workOrderNo: workOrderNo || `WO-${Math.random().toString(36).substring(7).toUpperCase()}`,
      projectCategory: projectCategory || 'None',
      allocatedTarget: allocatedTarget || 0,
      trainingHours: trainingHours || 120,
      trainingCostPerHour: req.body.trainingCostPerHour || 38.5,
      totalProjectCost: req.body.totalProjectCost || 0,
      description,
      installment1Status: req.body.installment1Status || 'None',
      installment1Date: req.body.installment1Date,
      assessmentFeesPaidBy: req.body.assessmentFeesPaidBy || 'None',
      assessmentStatus: req.body.assessmentStatus || 'None',
      assessmentDate: req.body.assessmentDate,
      totalPassOut: req.body.totalPassOut || 0,
      installment2Status: req.body.installment2Status || 'None',
      installment2Date: req.body.installment2Date,
      maxDemonstrators: req.body.maxDemonstrators || 1,
      startDate,
      endDate,
      location: {
        state: location?.state || 'Maharashtra',
        district: location?.district || 'TBD',
        taluka: location?.taluka || 'TBD',
        village: location?.village || 'TBD'
      },
      projectAddress: req.body.projectAddress || '',
      manager: managerId || null,
      status: 'active',
      projectId,
      isLocked: false
    });

    // 5. Sync Project Model: Update the project's manager field
    if (managerId && mongoose.Types.ObjectId.isValid(managerId)) {
      // Ensure this project is not in ANY OTHER manager's list
      await Manager.updateMany(
        { _id: { $ne: managerId } },
        { $pull: { assignedProjects: project._id } }
      );
      await Manager.findByIdAndUpdate(managerId, { $addToSet: { assignedProjects: project._id } });
    }

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get All Projects
// @route   GET /api/v1/admin/projects
// @access  Private (Admin Only)
exports.getAllProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      query = { manager: req.user.id };
    } else if (req.user.role === 'viewer') {
      query = { _id: { $in: req.user.assignedProjects || [] } };
    }

    const projects = await Project.find(query)
      .populate('manager', 'fullName managerId emailAddress district mobileNumber')
      .sort({ createdAt: -1 });

    const projectsWithDetails = await Promise.all(projects.map(async (prj) => {
      const trainersCount = await Trainer.countDocuments({ assignedProjects: prj._id });
      return {
        ...prj._doc,
        id: prj.projectId || prj._id.toString().slice(-6).toUpperCase(),
        mongoId: prj._id,
        managerName: prj.manager ? prj.manager.fullName : 'Not Assigned',
        managerPopulated: prj.manager,
        trainers: trainersCount,
        displayLocation: prj.location ? `${prj.location.village}, ${prj.location.district}` : 'N/A',
        statusDisplay: prj.status === 'active' ? 'Active' : 'Closed'
      };
    }));

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projectsWithDetails
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Single Project
// @route   GET /api/v1/admin/projects/:id
// @access  Private (Admin Only)
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'fullName managerId emailAddress mobileNumber district')
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Security Check for Viewer
    if (req.user.role === 'viewer' && !req.user.assignedProjects.includes(project._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    // Fetch details for drill-down
    const trainers = await Trainer.find({ assignedProjects: project._id })
      .select('fullName trainerId status mobileNumber')
      .lean();

    const trainersCount = trainers.length;

    // Get attendance stats for this project
    const attendanceStats = await Attendance.find({ projectId: project._id })
      .sort({ date: -1 })
      .limit(10)
      .populate('trainerId', 'fullName')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...project,
        id: project.projectId || project._id.toString().slice(-6).toUpperCase(),
        managerName: project.manager ? project.manager.fullName : 'Not Assigned',
        managerId: project.manager ? project.manager.managerId : 'N/A',
        trainers: trainersCount,
        trainersList: trainers,
        recentAttendance: attendanceStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update Project
// @route   PUT /api/v1/admin/projects/:id
// @access  Private (Admin Only)
exports.updateProject = async (req, res, next) => {
  try {
    const {
      name,
      managerId,
      location,
      totalProjectCost,
      startDate,
      endDate,
      status,
      progressStatus,
      description,
      workOrderNo,
      projectCategory,
      allocatedTarget,
      trainingHours
    } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Robust Manager Resolution
    let resolvedManagerId = managerId || project.manager;
    if (managerId && !mongoose.Types.ObjectId.isValid(managerId)) {
      // If it's a custom ID (e.g. MGR-6870), find the actual ObjectId
      const managerDoc = await Manager.findOne({ managerId: managerId });
      if (managerDoc) {
        resolvedManagerId = managerDoc._id;
      }
    }

    const updateData = {
      name: name || project.name,
      manager: resolvedManagerId,
      location: {
        state: location?.state || project.location.state,
        district: location?.district || project.location.district,
        taluka: location?.taluka || project.location.taluka,
        village: location?.village || project.location.village
      },
      projectAddress: req.body.projectAddress || project.projectAddress,
      totalProjectCost: req.body.totalProjectCost || project.totalProjectCost,
      startDate: startDate || project.startDate,
      endDate: endDate || project.endDate,
      status: status?.toLowerCase() || project.status,
      progressStatus: progressStatus !== undefined ? progressStatus : project.progressStatus,
      description: description || project.description,
      workOrderNo: workOrderNo || project.workOrderNo,
      projectCategory: projectCategory || project.projectCategory,
      allocatedTarget: allocatedTarget || project.allocatedTarget,
      trainingHours: trainingHours || project.trainingHours,
      trainingCostPerHour: req.body.trainingCostPerHour || project.trainingCostPerHour,
      installment1Status: req.body.installment1Status || project.installment1Status,
      installment1Date: req.body.installment1Date || project.installment1Date,
      assessmentFeesPaidBy: req.body.assessmentFeesPaidBy || project.assessmentFeesPaidBy,
      assessmentStatus: req.body.assessmentStatus || project.assessmentStatus,
      assessmentDate: req.body.assessmentDate || project.assessmentDate,
      totalPassOut: req.body.totalPassOut !== undefined ? req.body.totalPassOut : project.totalPassOut,
      installment2Status: req.body.installment2Status || project.installment2Status,
      installment2Date: req.body.installment2Date || project.installment2Date,
      maxDemonstrators: req.body.maxDemonstrators || project.maxDemonstrators,
      isLocked: req.body.isLocked !== undefined ? req.body.isLocked : project.isLocked
    };

    // Bi-directional Synchronization
    const newManagerId = resolvedManagerId;

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: false
    });

    // 2. Add to the new manager if specified
    if (newManagerId) {
      await Manager.findByIdAndUpdate(newManagerId, { $addToSet: { assignedProjects: project._id } });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete Project
// @route   DELETE /api/v1/admin/projects/:id
// @access  Private (Admin Only)
exports.deleteProject = async (req, res, next) => {
  try {
    const id = req.params.id;
    let project;

    if (mongoose.Types.ObjectId.isValid(id)) {
      project = await Project.findById(id);
    } else {
      project = await Project.findOne({ projectId: id });
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const projectId = project._id;

    // Remove this project from any Manager's assignedProjects array
    await Manager.updateMany(
      { assignedProjects: projectId },
      { $pull: { assignedProjects: projectId } }
    );

    // Remove this project from any Trainer's assignedProjects array
    await Trainer.updateMany(
      { assignedProjects: projectId },
      { $pull: { assignedProjects: projectId } }
    );

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully and unassigned from all staff'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// @desc    Register Admin
// @route   POST /api/v1/admin/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      name,
      username,
      password,
    });

    sendTokenResponse(admin, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Login Admin
// @route   POST /api/v1/admin/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide a username and password' });
    }

    // --- Absolute Hardcoded Admin Login ---
    if (username === '@admin' && password === 'admin00') {
      const admin = await Admin.findOneAndUpdate(
        { username: '@admin' },
        { name: 'Master Admin', password: 'admin00', role: 'admin' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return sendTokenResponse(admin, 200, res);
    }
    // --------------------------------------

    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(admin, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add New Manager
// @route   POST /api/v1/admin/add-manager
// @access  Private (Admin Only)
exports.addNewManager = async (req, res, next) => {
  try {
    const {
      fullName,
      mobileNumber, mobile, // Accept both names
      emailAddress, email,   // Accept both names
      state,
      district,
      assignedProjects, // This is now expected to be an array
      username: providedUsername, // Admin may provide credentials
      password: providedPassword
    } = req.body;

    // Use whichever names the frontend provided
    const finalMobile = mobileNumber || mobile;
    const finalEmail = emailAddress || email;

    if (!finalMobile || !finalEmail || !fullName) {
      return res.status(400).json({ success: false, message: 'Full Name, Mobile, and Email are required' });
    }

    // 1. Check if manager already exists
    const managerExists = await Manager.findOne({
      $or: [
        { mobileNumber: finalMobile },
        { emailAddress: finalEmail }
      ],
    });

    if (managerExists) {
      if (managerExists.mobileNumber === finalMobile) {
        return res.status(400).json({ success: false, message: 'Mobile number already exists' });
      }
      if (managerExists.emailAddress === finalEmail) {
        return res.status(400).json({ success: false, message: 'Email address already exists' });
      }
    }

    // 2. Generate Truly Unique Manager ID (Prevents duplicate errors after deletions)
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    const managerId = `MGR-${uniqueSuffix}`;

    // 3. Credentials (Use provided or generate)
    const username = providedUsername || `mgr_${uniqueSuffix}`;
    const password = providedPassword || Math.random().toString(36).slice(-8);

    // 4. Create Manager
    const manager = await Manager.create({
      fullName,
      mobileNumber: finalMobile,
      emailAddress: finalEmail,
      state,
      district,
      assignedProjects: (Array.isArray(assignedProjects) && assignedProjects.length > 0) ? assignedProjects : [],
      managerId,
      username,
      password: password, // This will be hashed by the pre-save hook
      plainPassword: password, // Store for admin display
      status: 'active'
    });

    // 5. Sync Project Model: Update the project's manager field
    if (Array.isArray(assignedProjects) && assignedProjects.length > 0) {
      // 5b. Update the project's manager field
      await Project.updateMany(
        { _id: { $in: assignedProjects } },
        { manager: manager._id }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        id: manager._id,
        managerId: manager.managerId,
        username: manager.username,
        password, // Sending raw password back to admin to copy
        fullName: manager.fullName,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get All Managers
// @route   GET /api/v1/admin/managers
// @access  Private (Admin Only)
exports.getAllManagers = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'viewer') {
      query = { assignedProjects: { $in: req.user.assignedProjects || [] } };
    }

    const managers = await Manager.find(query).sort({ createdAt: -1 });
    const allProjects = await Project.find().select('name manager');

    const managersWithProjects = managers.map((m) => {
      // Find all projects where this manager is the owner
      const projects = allProjects.filter(p => p.manager?.toString() === m._id.toString());

      return {
        ...m._doc,
        assignedProjectsNames: projects.map(p => p.name).join(', ') || 'None',
        assignedProjectsCount: projects.length
      };
    });

    res.status(200).json({
      success: true,
      count: managers.length,
      data: managersWithProjects,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get Single Manager
// @route   GET /api/v1/admin/managers/:id
// @access  Private (Admin Only)
exports.getManager = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.params.id);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update Manager
// @route   PUT /api/v1/admin/managers/:id
// @access  Private (Admin Only)
exports.updateManager = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, emailAddress, state, district, status, password } = req.body;

    // Select +password so isModified('password') works correctly in pre-save hook
    let manager = await Manager.findById(req.params.id).select('+password');

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    // Validate uniqueness if mobile or email is being updated
    if (mobileNumber || emailAddress) {
      const query = {
        _id: { $ne: req.params.id },
        $or: [
          mobileNumber ? { mobileNumber } : null,
          emailAddress ? { emailAddress } : null,
        ].filter(Boolean)
      };

      const existing = await Manager.findOne(query);

      if (existing) {
        if (mobileNumber && existing.mobileNumber === mobileNumber) {
          return res.status(400).json({ success: false, message: 'Mobile number already in use' });
        }
        if (emailAddress && existing.emailAddress === emailAddress) {
          return res.status(400).json({ success: false, message: 'Email address already in use' });
        }
      }
    }

    // Update fields
    if (fullName) manager.fullName = fullName;
    if (mobileNumber) {
      manager.mobileNumber = mobileNumber;
      // Update username if mobile number changes (mgr_ + last 4 digits)
      manager.username = `mgr_${mobileNumber.slice(-4)}`;
    }
    if (emailAddress) manager.emailAddress = emailAddress;
    if (state) manager.state = state;
    if (district) manager.district = district;
    if (status) manager.status = status;

    // Sync Project Model: Update handle unassignment and new assignment
    if (req.body.assignedProjects !== undefined) {
      const newProjectIds = Array.isArray(req.body.assignedProjects) ? req.body.assignedProjects : [];

      // 1. Find projects currently assigned to this manager
      const previouslyAssigned = await Project.find({ manager: manager._id });
      const previousIds = previouslyAssigned.map(p => p._id.toString());

      // 2. Identify projects to unassign (in previous but not in new)
      const toUnassign = previousIds.filter(id => !newProjectIds.includes(id));
      if (toUnassign.length > 0) {
        await Project.updateMany(
          { _id: { $in: toUnassign } },
          { $set: { manager: null } }
        );
      }

      // 3. Set manager for projects that are in the newProjectIds list
      await Project.updateMany(
        { _id: { $in: newProjectIds } },
        { $set: { manager: manager._id } }
      );

      // 4. Update the manager's assignedProjects array
      manager.assignedProjects = newProjectIds;
    }

    await manager.save();

    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete Manager
// @route   DELETE /api/v1/admin/managers/:id
// @access  Private (Admin Only)
exports.deleteManager = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.params.id);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    await Manager.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Manager deleted successfully',
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Logout Admin / Clear Cookie
// @route   GET /api/v1/admin/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
};

// @desc    Delete Self Admin Account
// @route   DELETE /api/v1/admin/delete-account
// @access  Private (Admin Only)
exports.deleteAccount = async (req, res, next) => {
  try {
    await Admin.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Admin account deleted successfully',
      data: {},
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reset Manager Password (by Admin)
// @route   PUT /api/v1/admin/managers/:id/reset-password
// @access  Private (Admin Only)
exports.resetManagerPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide newPassword' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Fetch manager WITH password field so pre-save hook detects isModified correctly
    const manager = await Manager.findById(req.params.id).select('+password');

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    // Set new password — pre-save hook in managerModel will hash it automatically
    manager.password = newPassword;
    manager.plainPassword = newPassword; // Store plain for admin visibility

    await manager.save();

    res.status(200).json({
      success: true,
      message: `Password for Manager "${manager.fullName}" (${manager.managerId}) reset successfully`,
      data: {
        managerId: manager.managerId,
        username: manager.username,
        newPassword,            // Shown once so admin can hand over credentials
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN → TRAINER APIs
// ─────────────────────────────────────────────

// @desc    Get All Trainers (Admin)
// @route   GET /api/v1/admin/trainers
// @access  Private (Admin Only)
exports.getAllTrainers = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'viewer') {
      query = { assignedProjects: { $in: req.user.assignedProjects || [] } };
    }

    const trainers = await Trainer.find(query)
      .populate('reportingManager', 'fullName')
      .populate('assignedProjects', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Add real stats for each trainer
    for (const trainer of trainers) {
      const attendanceCount = await Attendance.countDocuments({
        trainerId: trainer._id,
        status: { $in: ['present', 'approved'] }
      });
      trainer.totalUploads = attendanceCount;
      const diffTime = Math.abs(new Date() - new Date(trainer.createdAt));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      trainer.attendanceRate = Math.min(100, Math.round((attendanceCount / diffDays) * 100));
    }

    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Single Trainer (Admin)
// @route   GET /api/v1/admin/trainers/:id
// @access  Private (Admin Only)
exports.getTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('reportingManager', 'fullName')
      .populate('assignedProjects', 'name')
      .lean();

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Add real stats for this specific trainer
    const attendanceCount = await Attendance.countDocuments({
      trainerId: trainer._id,
      status: { $in: ['present', 'approved'] }
    });

    trainer.totalUploads = attendanceCount;
    const diffTime = Math.abs(new Date() - new Date(trainer.createdAt));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    trainer.attendanceRate = Math.min(100, Math.round((attendanceCount / diffDays) * 100));

    res.status(200).json({
      success: true,
      data: trainer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update Trainer details (Admin)
// @route   PUT /api/v1/admin/trainers/:id
// @access  Private (Admin Only)
exports.updateTrainer = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, state, district, assignedProject, reportingManager } = req.body;

    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Check mobile uniqueness if being changed
    if (mobileNumber && mobileNumber !== trainer.mobileNumber) {
      const mobileExists = await Trainer.findOne({ mobileNumber });
      if (mobileExists) {
        return res.status(400).json({ success: false, message: 'Mobile number already in use' });
      }
      trainer.mobileNumber = mobileNumber;
    }

    if (fullName) trainer.fullName = fullName;
    if (state) trainer.state = state;
    if (district) trainer.district = district;
    if (assignedProject) trainer.assignedProject = assignedProject;
    if (reportingManager !== undefined) trainer.reportingManager = reportingManager;

    await trainer.save();

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Activate or Deactivate Trainer (Admin)
// @route   PATCH /api/v1/admin/trainers/:id/status
// @access  Private (Admin Only)
exports.toggleTrainerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status as "active" or "inactive"',
      });
    }

    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    if (trainer.status === status) {
      return res.status(400).json({
        success: false,
        message: `Trainer is already ${status}`,
      });
    }

    trainer.status = status;
    await trainer.save();

    res.status(200).json({
      success: true,
      message: `Trainer "${trainer.fullName}" (${trainer.trainerId}) has been ${status === 'active' ? '✅ Activated' : '🚫 Deactivated'}`,
      data: {
        trainerId: trainer.trainerId,
        fullName: trainer.fullName,
        status: trainer.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete Trainer (Admin)
// @route   DELETE /api/v1/admin/trainers/:id
// @access  Private (Admin Only)
exports.deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Remove trainer from any project's assigned list
    await Project.updateMany(
      { trainers: trainer._id },
      { $pull: { trainers: trainer._id } }
    );

    // Delete all attendance records for this trainer
    await Attendance.deleteMany({ trainerId: trainer._id });

    await trainer.deleteOne();

    res.status(200).json({
      success: true,
      message: `Trainer "${trainer.fullName}" deleted successfully`,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// @desc    Get Photos Date-wise
// @route   GET /api/v1/admin/photos/date-wise
// @access  Private (Admin)
exports.getPhotosByDate = async (req, res, next) => {
  try {
    const { date } = req.query; // YYYY-MM-DD

    let query = {};
    if (date && date !== 'all') {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    // --- 1. Trainer Attendance Records (Presence) ---
    const [attendances, allProjects] = await Promise.all([
      Attendance.find(query).populate('trainerId', 'fullName'),
      Project.find({}, 'name')
    ]);

    // Create a mapping of project ID to name
    const projectMap = {};
    allProjects.forEach(p => { projectMap[p._id.toString()] = p.name; });

    // --- 2. Combine into a Unified Structure ---
    const combined = [];

    // Add Attendance
    attendances.forEach(att => {
      combined.push({
        type: 'attendance',
        trainerId: att.trainerId?._id,
        trainerName: att.trainerId?.fullName || 'N/A',
        projectId: att.projectId, // Adding this for frontend filtering
        projectName: projectMap[att.projectId] || att.projectId || 'N/A',
        photoUrls: att.photos || [],
        status: att.status,
        date: att.date.toISOString().split('T')[0],
        location: att.location
      });
    });

    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Photos Trainer-wise
// @route   GET /api/v1/admin/photos/trainer-wise
// @access  Private (Admin)
exports.getPhotosByTrainer = async (req, res, next) => {
  try {
    const { trainerId } = req.query;
    if (!trainerId) return res.status(400).json({ success: false, message: 'Please provide trainerId' });

    // --- 1. Attendance Presence for this Trainer ---
    const attendances = await Attendance.find({ trainerId })
      .populate('trainerId', 'fullName');

    // --- 2. Combine ---
    const combined = [];

    attendances.forEach(att => {
      combined.push({
        type: 'attendance',
        trainerName: att.trainerId?.fullName || 'N/A',
        projectName: att.projectId || 'N/A',
        photoUrls: att.photos || [],
        date: att.date.toISOString().split('T')[0],
        status: att.status,
        location: att.location
      });
    });

    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Exchange/Reassign Trainer Project
// @route   POST /api/v1/admin/trainers/exchange-project
// @access  Private (Admin)
exports.exchangeTrainerProject = async (req, res, next) => {
  try {
    const { trainerId, newProjectId } = req.body;

    if (!trainerId || !newProjectId) {
      return res.status(400).json({ success: false, message: 'Please provide trainerId and newProjectId' });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const newProject = await Project.findById(newProjectId);
    if (!newProject) return res.status(404).json({ success: false, message: 'New Project not found' });

    const oldProjectName = trainer.assignedProject;

    // Update trainer
    trainer.assignedProject = newProject.name;
    await trainer.save();

    // Note: We don't automatically moving beneficiaries as they are usually tied to a location/project.
    // But we update the trainer's status.

    res.status(200).json({
      success: true,
      message: `Trainer "${trainer.fullName}" reassigned from "${oldProjectName}" to "${newProject.name}"`,
      data: trainer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendTokenResponse = (admin, statusCode, res) => {
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      username: admin.username,
      role: admin.role || 'admin',
    },
  });
};
// @desc    Admin Reset Password Direct
// @route   POST /api/v1/admin/reset-password-direct
// @access  Public
exports.resetAdminPasswordDirect = async (req, res) => {
  try {
    const { username, newPassword, confirmPassword } = req.body;

    if (!username || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'No admin found with this username' });
    }

    // Update password (pre-save hook will hash it)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin password reset successfully. You can now login.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add New Viewer
// @route   POST /api/v1/admin/viewers
// @access  Private (Admin)
exports.addViewer = async (req, res) => {
  try {
    const { name, username, password, assignedProjects } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const viewerExists = await Viewer.findOne({ username });
    if (viewerExists) {
      return res.status(400).json({ success: false, message: 'Viewer username already exists' });
    }

    const viewer = await Viewer.create({
      name,
      username,
      password,
      assignedProjects: assignedProjects || []
    });

    res.status(201).json({ success: true, data: viewer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get All Viewers
// @route   GET /api/v1/admin/viewers
// @access  Private (Admin)
exports.getAllViewers = async (req, res) => {
  try {
    const viewers = await Viewer.find()
      .populate('assignedProjects', 'name projectId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: viewers.length, data: viewers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete Viewer
// @route   DELETE /api/v1/admin/viewers/:id
// @access  Private (Admin)
exports.deleteViewer = async (req, res) => {
  try {
    const viewer = await Viewer.findByIdAndDelete(req.params.id);
    if (!viewer) return res.status(404).json({ success: false, message: 'Viewer not found' });
    res.status(200).json({ success: true, message: 'Viewer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
