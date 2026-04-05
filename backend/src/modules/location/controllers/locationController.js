const Location = require('../models/locationModel');
const Project = require('../../project/models/projectModel');

// ─────────────────────────────────────────────────────────────
// @desc    Add new location entry
// @route   POST /api/v1/locations
// @access  Private (Admin/Manager)
// ─────────────────────────────────────────────────────────────
exports.addLocation = async (req, res) => {
  try {
    const { state, district, taluka, cityVillage } = req.body;
    
    const location = await Location.create({ state, district, taluka, cityVillage });
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Location already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all unique states
// @route   GET /api/v1/locations/states
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getStates = async (req, res) => {
  try {
    // Merge unique states from Master Location AND existing Projects
    const masterStates = await Location.distinct('state');
    const projectStates = await Project.distinct('location.state');
    
    // Combine and remove duplicates
    const combined = [...new Set([...masterStates, ...projectStates])];
    
    res.status(200).json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get districts for a state
// @route   GET /api/v1/locations/districts
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getDistricts = async (req, res) => {
  try {
    const { state } = req.query;
    if (!state) return res.status(400).json({ success: false, message: 'Please provide state' });
    
    const masterDistricts = await Location.distinct('district', { state });
    const projectDistricts = await Project.distinct('location.district', { 'location.state': state });
    
    const combined = [...new Set([...masterDistricts, ...projectDistricts])];
    res.status(200).json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get talukas for a district
// @route   GET /api/v1/locations/talukas
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getTalukas = async (req, res) => {
  try {
    const { state, district } = req.query;
    if (!state || !district) return res.status(400).json({ success: false, message: 'Please provide state and district' });
    
    const masterTalukas = await Location.distinct('taluka', { state, district });
    const projectTalukas = await Project.distinct('location.taluka', { 'location.state': state, 'location.district': district });
    
    const combined = [...new Set([...masterTalukas, ...projectTalukas])];
    res.status(200).json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get villages for a taluka
// @route   GET /api/v1/locations/villages
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getVillages = async (req, res) => {
  try {
    const { state, district, taluka } = req.query;
    if (!state || !district || !taluka) return res.status(400).json({ success: false, message: 'Please provide state, district and taluka' });
    
    const masterVillages = await Location.distinct('cityVillage', { state, district, taluka });
    const projectVillages = await Project.distinct('location.village', { 'location.state': state, 'location.district': district, 'location.taluka': taluka });
    
    const combined = [...new Set([...masterVillages, ...projectVillages])];
    res.status(200).json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all locations
// @route   GET /api/v1/locations/all
// @access  Private (Admin)
exports.getAllLocations = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const locations = await Location.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Location.countDocuments();

    res.status(200).json({
      success: true,
      count: locations.length,
      total,
      data: locations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update location
// @route   PUT /api/v1/locations/:id
// @access  Private (Admin)
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    res.status(200).json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete location
// @route   DELETE /api/v1/locations/:id
// @access  Private (Admin)
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
