const Trainee = require('../models/traineeModel');
const Trainer = require('../../trainer/models/trainerModel');

// @desc    Create new trainee (Rural Mason)
// @route   POST /api/v1/trainee/create
// @access  Private (Trainer only)
exports.createTrainee = async (req, res) => {
  try {
    const trainerId = req.user._id;

    // We need the trainer's reportingManager to link the trainee to the manager
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    if (!trainer.reportingManager) {
      return res.status(400).json({ success: false, message: 'Trainer has no assigned manager to link trainee to.' });
    }

    // Process file if present (assumes uploadHousePhoto middleware is used on the route, populating req.files)
    let photoUrl = null;
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      photoUrl = req.files.photo[0].path; // Depending on Cloudinary middleware, usually req.files.fieldname[0].path
    }

    // Prepare data
    const generateTraineeId = 'RM' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

    const traineeData = {
      ...req.body,
      traineeId: generateTraineeId,
      photo: photoUrl,
      createdBy: trainerId,
      managerId: trainer.reportingManager,
    };

    const trainee = await Trainee.create(traineeData);

    res.status(201).json({
      success: true,
      message: 'Trainee created successfully',
      data: trainee,
    });
  } catch (error) {
    console.error('Error in createTrainee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trainees created by logged-in trainer
// @route   GET /api/v1/trainee/my-list
// @access  Private (Trainer only)
exports.getTrainerTrainees = async (req, res) => {
  try {
    const trainees = await Trainee.find({ createdBy: req.user._id })
      .populate('assignedBeneficiary', 'beneficiaryName beneficiaryId village')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainees.length,
      data: trainees,
    });
  } catch (error) {
    console.error('Error in getTrainerTrainees:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trainees managed by the logged-in manager
// @route   GET /api/v1/trainee/manager/list
// @access  Private (Manager only)
exports.getManagerTrainees = async (req, res) => {
  try {
    // Find all trainees where managerId matches the logged in manager
    const trainees = await Trainee.find({ managerId: req.user._id })
      .populate('createdBy', 'fullName trainerId')
      .populate('assignedBeneficiary', 'beneficiaryName beneficiaryId village')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainees.length,
      data: trainees,
    });
  } catch (error) {
    console.error('Error in getManagerTrainees:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update trainee details
// @route   PUT /api/v1/trainee/:id
// @access  Private (Manager only)
exports.updateTrainee = async (req, res) => {
  try {
    let trainee = await Trainee.findById(req.params.id);

    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Trainee not found' });
    }

    // Ensure the manager owns this trainee
    if (trainee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this trainee' });
    }

    // Handle photo update if needed
    console.log('Update Request Body:', req.body);
    let updatedData = { ...req.body };
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      updatedData.photo = req.files.photo[0].path;
    }

    trainee = await Trainee.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });
    console.log('Updated Trainee:', trainee);

    res.status(200).json({
      success: true,
      message: 'Trainee updated successfully',
      data: trainee,
    });
  } catch (error) {
    console.error('Error in updateTrainee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete trainee
// @route   DELETE /api/v1/trainee/:id
// @access  Private (Manager only)
exports.deleteTrainee = async (req, res) => {
  try {
    const trainee = await Trainee.findById(req.params.id);

    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Trainee not found' });
    }

    // Ensure the manager owns this trainee
    if (trainee.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this trainee' });
    }

    await Trainee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Trainee deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteTrainee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
