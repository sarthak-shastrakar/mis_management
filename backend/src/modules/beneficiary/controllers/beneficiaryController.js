const Beneficiary = require('../models/beneficiaryModel');

// ── Helper: Generate unique Beneficiary ID ─────────────────────
const generateBeneficiaryId = () => {
  const prefix = 'PMAYG';
  const timestamp = Date.now().toString().slice(-7);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// @desc    Create a new beneficiary
// @route   POST /api/v1/beneficiary/create
// @access  Admin only
exports.createBeneficiary = async (req, res) => {
  try {
    const beneficiaryId = generateBeneficiaryId();

    const beneficiary = await Beneficiary.create({
      ...req.body,
      beneficiaryId,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Beneficiary created successfully',
      data: beneficiary,
    });
  } catch (error) {
    console.error('Error in createBeneficiary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all beneficiaries (with pagination & search)
// @route   GET /api/v1/beneficiary/list?search=&status=&page=&limit=
// @access  Admin only
exports.getAllBeneficiaries = async (req, res) => {
  try {
    const { search = '', status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { beneficiaryName: { $regex: search, $options: 'i' } },
        { beneficiaryId: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Beneficiary.countDocuments(query);
    const beneficiaries = await Beneficiary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: beneficiaries.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: beneficiaries,
    });
  } catch (error) {
    console.error('Error in getAllBeneficiaries:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single beneficiary by ID
// @route   GET /api/v1/beneficiary/:id
// @access  Admin only
exports.getBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }
    res.status(200).json({ success: true, data: beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a beneficiary
// @route   PUT /api/v1/beneficiary/:id
// @access  Admin only
exports.updateBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }
    res.status(200).json({ success: true, message: 'Beneficiary updated successfully', data: beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a beneficiary
// @route   DELETE /api/v1/beneficiary/:id
// @access  Admin only
exports.deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findByIdAndDelete(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }
    res.status(200).json({ success: true, message: 'Beneficiary deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

