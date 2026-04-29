const PMBeneficiary = require('../models/beneficiaryModel');
const BeneficiaryAssignment = require('../models/beneficiaryAssignmentModel');
const Trainee = require('../../trainee/models/traineeModel');
const Trainer = require('../../trainer/models/trainerModel');

// ── Helper: Generate Trainee Code ─────────────────────────────
const generateTraineeCode = (state = 'XX', district = 'YY', year = new Date().getFullYear()) => {
  const seq = Math.floor(10000 + Math.random() * 90000);
  const stCode = state.slice(0, 2).toUpperCase();
  const distCode = district.slice(0, 3).toUpperCase();
  return `RM-${stCode}-${distCode}-${year}-${seq}`;
};

// ─────────────────────────────────────────────────────────────────
// TRAINER ROUTES
// ─────────────────────────────────────────────────────────────────

// @desc    Get all active beneficiaries (for trainer to search/select)
// @route   GET /api/v1/beneficiary/all
// @access  Trainer
exports.getAllBeneficiariesForTrainer = async (req, res) => {
  try {
    const { q, state, district, block, village } = req.query;

    const query = { status: 'Active' };

    if (q) {
      query.$or = [
        { beneficiaryId: { $regex: q, $options: 'i' } },
        { beneficiaryName: { $regex: q, $options: 'i' } },
      ];
    }
    if (state) query.state = { $regex: state, $options: 'i' };
    if (district) query.district = { $regex: district, $options: 'i' };
    if (block) query.block = { $regex: block, $options: 'i' };
    if (village) query.village = { $regex: village, $options: 'i' };

    const beneficiaries = await PMBeneficiary.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: beneficiaries.length,
      data: beneficiaries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trainer assigns a beneficiary to one of their trainees
// @route   POST /api/v1/beneficiary/assign
// @access  Trainer
exports.assignBeneficiary = async (req, res) => {
  try {
    const { traineeId, beneficiaryId, maxTraineeToAssign } = req.body;

    if (!traineeId || !beneficiaryId || !maxTraineeToAssign) {
      return res.status(400).json({
        success: false,
        message: 'traineeId, beneficiaryId, and maxTraineeToAssign are required',
      });
    }

    // 1. Verify trainee belongs to this trainer
    const trainee = await Trainee.findOne({ _id: traineeId, createdBy: req.user._id });
    if (!trainee) {
      return res.status(403).json({
        success: false,
        message: 'Trainee not found or does not belong to you',
      });
    }

    // 2. Verify beneficiary exists and is active
    const beneficiary = await PMBeneficiary.findById(beneficiaryId);
    if (!beneficiary || beneficiary.status !== 'Active') {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found or is inactive',
      });
    }

    // 3. Get trainer's reporting manager
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer || !trainer.reportingManager) {
      return res.status(400).json({
        success: false,
        message: 'You have no assigned manager. Please contact admin.',
      });
    }

    // 4. Check if this trainee already has a pending/approved assignment
    const existingAssignment = await BeneficiaryAssignment.findOne({
      traineeId,
      status: { $in: ['Pending', 'Approved'] },
    });
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This trainee already has a pending or approved assignment',
      });
    }

    // 5. Create assignment request
    const assignment = await BeneficiaryAssignment.create({
      traineeId,
      beneficiaryId,
      assignedBy: req.user._id,
      managerId: trainer.reportingManager,
      maxTraineeToAssign,
    });

    const populated = await BeneficiaryAssignment.findById(assignment._id)
      .populate('traineeId', 'name aadhaarNumber mobileNumber trainingStatus')
      .populate('beneficiaryId', 'beneficiaryId beneficiaryName mobileNumber state district')
      .populate('assignedBy', 'fullName trainerId')
      .populate('managerId', 'fullName managerId');

    res.status(201).json({
      success: true,
      message: 'Assignment request submitted. Awaiting manager approval.',
      data: populated,
    });
  } catch (error) {
    console.error('Error in assignBeneficiary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's own assignment requests
// @route   GET /api/v1/beneficiary/my-assignments
// @access  Trainer
exports.getMyAssignments = async (req, res) => {
  try {
    const assignments = await BeneficiaryAssignment.find({ assignedBy: req.user._id })
      .populate('traineeId', 'name mobileNumber trainingStatus')
      .populate('beneficiaryId', 'beneficiaryId beneficiaryName state district')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// MANAGER ROUTES
// ─────────────────────────────────────────────────────────────────

// @desc    Get all assignment requests for this manager
// @route   GET /api/v1/beneficiary/requests
// @access  Manager
exports.getManagerRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { managerId: req.user._id };
    if (status) query.status = status;

    const assignments = await BeneficiaryAssignment.find(query)
      .populate('traineeId', 'name aadhaarNumber mobileNumber trainingStatus isKYCDone')
      .populate('beneficiaryId', 'beneficiaryId beneficiaryName mobileNumber state district block village maxTraineeLimit')
      .populate('assignedBy', 'fullName trainerId mobileNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve an assignment request
// @route   PUT /api/v1/beneficiary/requests/:id/approve
// @access  Manager
exports.approveAssignment = async (req, res) => {
  try {
    const assignment = await BeneficiaryAssignment.findById(req.params.id)
      .populate('traineeId')
      .populate('beneficiaryId');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (assignment.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Assignment is no longer pending' });
    }

    // Generate trainee code using beneficiary location
    const state = assignment.beneficiaryId?.state || 'XX';
    const district = assignment.beneficiaryId?.district || 'YY';
    const code = generateTraineeCode(state, district);

    assignment.status = 'Approved';
    assignment.generatedTraineeCode = code;
    assignment.managerRemarks = req.body.remarks || null;
    await assignment.save();

    // ── Update the Trainee document ──
    await Trainee.findByIdAndUpdate(assignment.traineeId._id, {
      assignedBeneficiary: assignment.beneficiaryId._id,
      generatedTraineeCode: code,
      trainingStatus: 'Assigned', // Optionally update status
    });

    res.status(200).json({
      success: true,
      message: `Assignment approved. Generated Code: ${code}`,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject an assignment request
// @route   PUT /api/v1/beneficiary/requests/:id/reject
// @access  Manager
exports.rejectAssignment = async (req, res) => {
  try {
    const assignment = await BeneficiaryAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (assignment.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Assignment is no longer pending' });
    }

    assignment.status = 'Rejected';
    assignment.managerRemarks = req.body.remarks || 'Rejected by manager';
    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment rejected',
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
