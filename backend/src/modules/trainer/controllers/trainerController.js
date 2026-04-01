const Trainer = require('../models/trainerModel');
const crypto = require('crypto');

// @desc    Add new trainer
// @route   POST /api/v1/trainer/add-trainer
// @access  Private (Manager/Admin Only)
exports.addNewTrainer = async (req, res) => {
  try {
    const { fullName, mobileNumber, assignedProject, state, district } = req.body;

    // 1. Check if trainer already exists by mobile
    let trainerExist = await Trainer.findOne({ mobileNumber });
    if (trainerExist) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists' });
    }

    // 2. Generate and verify Trainer ID
    const trainerCount = await Trainer.countDocuments();
    let trainerId = `T-${(trainerCount + 1001).toString()}`;
    
    // Safety check for trainerId uniqueness
    let idExists = await Trainer.findOne({ trainerId });
    if (idExists) {
        // Fallback or increment if colliding
        trainerId = `T-${(trainerCount + 1002).toString()}`;
    }
    
    // 3. Username: tr_ + last 4 digits of mobile
    let username = `tr_${mobileNumber.slice(-4)}`;
    
    // Safety check for username uniqueness (handle collisions)
    let usernameExists = await Trainer.findOne({ username });
    if (usernameExists) {
        // If collision, append a random letter
        username = `${username}_${crypto.randomBytes(1).toString('hex')}`;
    }
    
    // 4. Password: Random 8 characters
    const password = crypto.randomBytes(4).toString('hex');

    // Create trainer
    const trainer = await Trainer.create({
      fullName,
      mobileNumber,
      trainerId,
      assignedProject,
      state,
      district,
      username,
      password,
      plainPassword: password, // Store plain password for manager display
    });

    res.status(201).json({
      success: true,
      data: {
        _id: trainer._id,
        trainerId: trainer.trainerId,
        username: trainer.username,
        password: password, // Raw password for UI feedback
        fullName: trainer.fullName,
      },
    });
  } catch (err) {
    // Handle Mongoose duplicate key error specifically
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get all trainers
// @route   GET /api/v1/trainer/trainers
// @access  Private (Manager/Admin Only)
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single trainer
// @route   GET /api/v1/trainer/trainers/:id
// @access  Private (Manager/Admin Only)
exports.getTrainer = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update trainer
// @route   PUT /api/v1/trainer/trainers/:id
// @access  Private (Manager/Admin Only)
exports.updateTrainer = async (req, res) => {
  try {
    const { fullName, mobileNumber, assignedProject, state, district, status, password } = req.body;

    let trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Check mobile uniqueness if changed
    if (mobileNumber && mobileNumber !== trainer.mobileNumber) {
      const existing = await Trainer.findOne({ mobileNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Mobile number already in use' });
      }
      trainer.mobileNumber = mobileNumber;
      trainer.username = `tr_${mobileNumber.slice(-4)}`;
    }

    // Update fields
    if (fullName) trainer.fullName = fullName;
    if (assignedProject) trainer.assignedProject = assignedProject;
    if (state) trainer.state = state;
    if (district) trainer.district = district;
    if (status) trainer.status = status;
    
    // Handle password update
    if (password) {
      trainer.password = password;
      trainer.plainPassword = password;
    }

    await trainer.save();

    res.status(200).json({
      success: true,
      data: trainer,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete trainer
// @route   DELETE /api/v1/trainer/trainers/:id
// @access  Private (Manager/Admin Only)
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    await Trainer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Trainer deleted successfully',
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
