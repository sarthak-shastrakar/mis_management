const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/authMiddleware');
const locationController = require('../controllers/locationController');

// ─────────────────────────────────────────────────────────────
// Location Routes
// ─────────────────────────────────────────────────────────────

// @route   POST /api/v1/locations
// @desc    Admin or Manager adds single location
router.post('/', auth.protect, locationController.addLocation);

// @route   GET /api/v1/locations/all
// @desc    Get all locations (Paginated)
router.get('/all', auth.protect, auth.adminOnly, locationController.getAllLocations);

// @route   GET /api/v1/locations/states
// ─────────────────────────────────────────────────────────────
router.get('/states', auth.protect, locationController.getStates);
router.get('/districts', auth.protect, locationController.getDistricts);
router.get('/talukas', auth.protect, locationController.getTalukas);
router.get('/villages', auth.protect, locationController.getVillages);

// @route   PUT /api/v1/locations/:id
// @desc    Update location
router.put('/:id', auth.protect, auth.adminOnly, locationController.updateLocation);

// @route   DELETE /api/v1/locations/:id
// @desc    Delete location
router.delete('/:id', auth.protect, auth.adminOnly, locationController.deleteLocation);

module.exports = router;
