const Admin = require('../models/adminModel');
const Manager = require('../../manager/models/managerModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
    const managerId = `MGR-${(managerCount + 1).toString().padStart(2, '0')}`;

    // 3. Generate Credentials
    // Username: mgr_ + last 4 digits of mobile
    const username = `mgr_${mobileNumber.slice(-4)}`;
    
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

    let manager = await Manager.findById(req.params.id);

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
      manager.password = password;
      manager.plainPassword = password; // Keep visible for admin
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
