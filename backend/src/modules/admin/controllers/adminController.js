const Admin = require('../models/adminModel');
const Manager = require('../../manager/models/managerModel');
const Trainer = require('../../trainer/models/trainerModel');
const Project = require('../../project/models/projectModel');
const Beneficiary = require('../../beneficiary/models/beneficiaryModel');
const Attendance = require('../../attendance/models/attendanceModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// @desc    Get Dashboard Stats
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeManagers = await Manager.countDocuments(); // Active + Inactive for overall count
    const fieldTrainers = await Trainer.countDocuments();
    
    // Count daily uploads (today)
    const today = new Date().toISOString().split('T')[0];
    // This is a naive way, but works for now. 
    // In production, an aggregation pipeline would be better.
    const beneficiaries = await Beneficiary.find({ 'monitoring.date': today });
    
    let dailyUploadsCount = 0;
    beneficiaries.forEach(ben => {
      const todayEntry = ben.monitoring.find(m => m.date === today);
      if (todayEntry) {
         dailyUploadsCount += todayEntry.photoUrls.length;
      }
    });

    // Fetch recent active projects
    const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(5);
    
    // Supplement project data with manager names and trainer counts
    const projectsWithDetails = await Promise.all(recentProjects.map(async (prj) => {
      const manager = await Manager.findOne({ assignedProject: prj.name });
      const trainersCount = await Trainer.countDocuments({ assignedProject: prj.name });
      return {
        id: prj.projectId || prj._id.toString().slice(-6).toUpperCase(),
        mongoId: prj._id,
        name: prj.name,
        manager: manager ? manager.fullName : 'Not Assigned',
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
      manager: managerId, 
      state, 
      district, 
      budget, 
      startDate, 
      endDate, 
      workOrderNo,
      projectCategory,
      allocatedTarget,
      trainingHours,
      trainingCostPerHour
    } = req.body;

    // Check if work order number already exists
    const projectExists = await Project.findOne({ workOrderNo });
    if (projectExists) {
      return res.status(400).json({ success: false, message: 'Work Order Number already exists' });
    }

    // Generate unique project ID (e.g., PRJ-01)
    const projectCount = await Project.countDocuments();
    const projectId = `PRJ-${(projectCount + 1).toString().padStart(2, '0')}`;

    const project = await Project.create({
      name,
      workOrderNo: workOrderNo || `WO-${Math.random().toString(36).substring(7).toUpperCase()}`, // Fallback if missing
      projectCategory: projectCategory || 'None',
      allocatedTarget: allocatedTarget || 0,
      trainingHours: trainingHours || 72,
      trainingCostPerHour: trainingCostPerHour || 38.5,
      startDate,
      endDate,
      totalProjectCost: budget,
      location: {
        state,
        district,
        taluka: 'TBD', // Placeholder
        village: 'TBD' // Placeholder
      },
      manager: managerId || null,
      status: 'active',
      projectId // Custom ID
    });

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
    const projects = await Project.find().sort({ createdAt: -1 });
    
    const projectsWithDetails = await Promise.all(projects.map(async (prj) => {
      const manager = await Manager.findById(prj.manager);
      const trainersCount = await Trainer.countDocuments({ assignedProject: prj.name });
      return {
        id: prj.projectId || prj._id.toString().slice(-6).toUpperCase(),
        mongoId: prj._id,
        name: prj.name,
        manager: manager ? manager.fullName : 'Not Assigned',
        location: `${prj.location.district}, ${prj.location.state}`,
        trainers: trainersCount,
        startDate: prj.startDate ? prj.startDate.toISOString().split('T')[0] : 'N/A',
        endDate: prj.endDate ? prj.endDate.toISOString().split('T')[0] : 'N/A',
        progress: prj.progressStatus || 0,
        status: prj.status === 'active' ? 'Active' : 'Completed'
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
    const project = await Project.findById(req.params.id).populate('manager', 'fullName managerId');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const trainersCount = await Trainer.countDocuments({ assignedProject: project.name });

    res.status(200).json({
      success: true,
      data: {
        ...project._doc,
        id: project.projectId || project._id.toString().slice(-6).toUpperCase(),
        managerName: project.manager ? project.manager.fullName : 'Not Assigned',
        managerId: project.manager ? project.manager.managerId : 'N/A',
        trainers: trainersCount
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
      manager: managerId, 
      state, 
      district, 
      budget, 
      startDate, 
      endDate,
      status,
      progressStatus,
      description
    } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updateData = {
      name,
      manager: managerId,
      location: { 
        ...project.location,
        state: state || project.location.state, 
        district: district || project.location.district 
      },
      totalProjectCost: budget,
      startDate,
      endDate,
      status: status?.toLowerCase() || 'active',
      progressStatus,
      description
    };

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
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
    const { fullName, mobileNumber, emailAddress, state, district, assignedProject } = req.body;

    // 1. Check if manager already exists by mobile, email, or project
    const managerExists = await Manager.findOne({
      $or: [
        { mobileNumber },
        { emailAddress },
        { assignedProject: { $eq: assignedProject, $ne: 'None' } }
      ],
    });

    if (managerExists) {
      if (managerExists.mobileNumber === mobileNumber) {
        return res.status(400).json({ success: false, message: 'Mobile number already exists' });
      }
      if (managerExists.emailAddress === emailAddress) {
        return res.status(400).json({ success: false, message: 'Email address already exists' });
      }
      if (managerExists.assignedProject === assignedProject) {
        return res.status(400).json({ success: false, message: `The project "${assignedProject}" is already assigned to another manager` });
      }
    }

    // 2. Generate Manager ID: MGR-01, MGR-02, etc.
    const managerCount = await Manager.countDocuments();
    const managerSeq = (managerCount + 1).toString().padStart(2, '0');
    const managerId = `MGR-${managerSeq}`;

    // 3. Generate Credentials
    // Username: mgr_ + sequential number from managerId (always unique)
    // Example: MGR-01 → mgr_01, MGR-02 → mgr_02
    const username = `mgr_${managerSeq}`;
    
    // Password: Random 8 characters
    const password = crypto.randomBytes(4).toString('hex');

    // 4. Create Manager
    const manager = await Manager.create({
      fullName,
      mobileNumber,
      emailAddress,
      state,
      district,
      assignedProject,
      managerId,
      username,
      password, // Hashed in pre-save
      plainPassword: password, // Stored for admin display
    });

    // 5. Sync Project Model: Update the project's manager field
    if (assignedProject && assignedProject !== 'None') {
      await Project.findOneAndUpdate(
        { name: assignedProject },
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
    const managers = await Manager.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers,
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
    const { fullName, mobileNumber, emailAddress, state, district, assignedProject, status, password } = req.body;

    // Select +password so isModified('password') works correctly in pre-save hook
    let manager = await Manager.findById(req.params.id).select('+password');

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    // Validate uniqueness if mobile, email, or project is being updated
    if (mobileNumber || emailAddress || (assignedProject && assignedProject !== 'None' && assignedProject !== manager.assignedProject)) {
      const query = {
        _id: { $ne: req.params.id },
        $or: [
          mobileNumber ? { mobileNumber } : null,
          emailAddress ? { emailAddress } : null,
          (assignedProject && assignedProject !== 'None') ? { assignedProject } : null
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
        if (assignedProject && assignedProject !== 'None' && existing.assignedProject === assignedProject) {
          return res.status(400).json({ success: false, message: 'Project already assigned to another manager' });
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
    if (assignedProject) manager.assignedProject = assignedProject;
    if (status) manager.status = status;
    
    // Handle password update
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      manager.password = password;       // pre-save hook will hash this
      manager.plainPassword = password;  // store plain text for admin visibility
    }

    await manager.save();

    // Sync Project Model: Update the project's manager field if assignedProject changed
    if (assignedProject && assignedProject !== 'None') {
      await Project.findOneAndUpdate(
        { name: assignedProject },
        { manager: manager._id }
      );
    }

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
    const trainers = await Trainer.find().sort({ createdAt: -1 });

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
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

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
    const { fullName, mobileNumber, state, district, assignedProject } = req.body;

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

// @desc    Get Photos Date-wise
// @route   GET /api/v1/admin/photos/date-wise
// @access  Private (Admin)
exports.getPhotosByDate = async (req, res, next) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ success: false, message: 'Please provide a date' });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const beneficiaries = await Beneficiary.find({ 'monitoring.date': date })
      .populate('project', 'name')
      .populate('assignedStaff', 'fullName');

    // --- 2. Trainer Attendance Records (Presence) ---
    const attendances = await Attendance.find({ date: { $gte: start, $lt: end } })
      .populate('trainerId', 'fullName');
    // --- 3. Combine into a Unified Structure ---
    const combined = [];

    // Add Monitoring
    beneficiaries.forEach(ben => {
      const entry = ben.monitoring.find(m => m.date === date);
      if (entry) {
        combined.push({
          type: 'monitoring',
          beneficiaryId: ben.beneficiaryId,
          beneficiaryName: ben.name,
          projectName: ben.project ? ben.project.name : 'Unknown',
          trainerName: ben.assignedStaff ? ben.assignedStaff.fullName : 'Not Assigned',
          photoUrls: entry.photoUrls,
          status: entry.status,
          date: entry.date,
          village: ben.location?.village || 'N/A',
          taluka: ben.location?.taluka || 'N/A'
        });
      }
    });

    // Add Attendance
    attendances.forEach(att => {
      combined.push({
        type: 'attendance',
        trainerId: att.trainerId?._id,
        trainerName: att.trainerId?.fullName || 'N/A',
        projectName: att.projectId || 'N/A',
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

    const beneficiaries = await Beneficiary.find({ assignedStaff: trainerId })
      .populate('project', 'name')
      .populate('assignedStaff', 'fullName');

    // --- 2. Attendance Presence for this Trainer ---
    const attendances = await Attendance.find({ trainerId })
       .populate('trainerId', 'fullName');

    // --- 3. Combine ---
    const combined = [];

    beneficiaries.forEach(ben => {
      ben.monitoring.forEach(entry => {
        combined.push({
          type: 'monitoring',
          beneficiaryId: ben.beneficiaryId,
          beneficiaryName: ben.name,
          projectName: ben.project ? ben.project.name : 'Unknown',
          trainerName: ben.assignedStaff ? ben.assignedStaff.fullName : 'Not Assigned',
          photoUrls: entry.photoUrls || [],
          status: entry.status,
          date: entry.date,
          village: ben.location?.village || 'N/A',
          taluka: ben.location?.taluka || 'N/A'
        });
      });
    });

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
    },
  });
};
