const mongoose = require('mongoose');
const Evidence = require('../models/evidenceModel');
const Project = require('../../project/models/projectModel');
const Trainer = require('../../trainer/models/trainerModel');

// ─────────────────────────────────────────────────────────────
// @desc    Upload Work Evidence
// @route   POST /api/v1/trainer/evidence/upload
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.uploadEvidence = async (req, res) => {
  try {
    const { projectId, date, latitude, longitude, remarks } = req.body;
    const trainerId = req.user.id;

    // 1. Verify trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    // 2. Handle Media Files
    // photos: max 3, video: max 1
    const photoUrls = req.files && req.files['photos'] ? req.files['photos'].map(f => f.path) : [];
    const videoUrl = req.files && req.files['video'] ? req.files['video'][0].path : null;

    if (photoUrls.length === 0 && !videoUrl) {
      return res.status(400).json({ success: false, message: 'At least one photo or video is required' });
    }

    // 3. Create Record
    const evidence = await Evidence.create({
      trainerId,
      projectId,
      date: date ? new Date(date) : new Date(),
      photos: photoUrls.slice(0, 3), // Enforce limit
      video: videoUrl,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      remarks
    });

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: evidence
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all evidence for Admin/Manager
// @route   GET /api/v1/admin/evidence
// @access  Private (Admin/Manager)
// ─────────────────────────────────────────────────────────────
exports.getAllEvidence = async (req, res) => {
  try {
    let query = {};
    
    // Date Filtering
    const { date, projectId } = req.query;
    if (date && date !== 'all') {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    // Role-based filtering for Manager
    if (req.user.role === 'manager') {
      // Find trainers assigned to this manager's projects or managed by them
      const trainers = await Trainer.find({ 
        $or: [{ reportingManager: req.user.id }, { createdBy: req.user.id }] 
      }).select('_id');
      query.trainerId = { $in: trainers.map(t => t._id) };
    }

    // Project Filtering
    if (projectId && projectId !== 'all') {
      query.projectId = projectId;
    }

    const evidence = await Evidence.find(query)
      .populate('trainerId', 'fullName trainerId mobileNumber placementLocation beneficiaries')
      .sort({ date: -1 })
      .lean();

    // Resolve Project Names
    const projects = await Project.find({}).lean();
    const enrichedEvidence = evidence.map(ev => {
      const proj = projects.find(p => String(p._id) === String(ev.projectId) || p.projectId === ev.projectId || p.name === ev.projectId);
      return {
        ...ev,
        projectName: proj ? proj.name : 'Unknown Project',
        block: ev.trainerId?.placementLocation?.taluka || 'TBD',
        village: ev.trainerId?.placementLocation?.village || 'TBD',
        batchID: (ev.trainerId?.beneficiaries && ev.trainerId.beneficiaries[0]) || 'NoBatch'
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedEvidence.length,
      data: enrichedEvidence
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
