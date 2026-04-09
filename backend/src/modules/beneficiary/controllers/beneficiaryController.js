const Beneficiary = require('../models/beneficiaryModel');
const Project = require('../../project/models/projectModel');
const Attendance = require('../../attendance/models/attendanceModel');
const { cloudinary } = require('../../../utils/cloudinary');

// ─────────────────────────────────────────────────────────────
// @desc    Add single beneficiary
// @route   POST /api/v1/beneficiaries
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.createBeneficiary = async (req, res) => {
  try {
    const { 
      name, 
      beneficiaryId, 
      assignedStaffId, 
      projectId, 
      address, 
      phoneNumber 
    } = req.body;

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Create beneficiary
    const beneficiary = await Beneficiary.create({
      name,
      beneficiaryId,
      assignedStaff: assignedStaffId,
      project: projectId,
      address: typeof address === 'string' ? JSON.parse(address) : address,
      phoneNumber
    });

    res.status(201).json({ success: true, data: beneficiary });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Beneficiary ID (PMAY-G) already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Batch create beneficiaries (Upload List)
// @route   POST /api/v1/beneficiaries/batch
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.batchCreateBeneficiaries = async (req, res) => {
  try {
    const { beneficiaries, projectId } = req.body;

    if (!Array.isArray(beneficiaries) || beneficiaries.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of beneficiaries' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Supplement each entry with project ID
    const docs = beneficiaries.map(b => ({
      ...b,
      project: projectId,
      assignedStaff: b.assignedStaffId || project.manager // Default to manager if staff not specified
    }));

    const result = await Beneficiary.insertMany(docs, { ordered: false });

    res.status(201).json({
      success: true,
      count: result.length,
      message: `${result.length} beneficiaries imported successfully`
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message.includes('E11000') ? 'Some Beneficiary IDs already exist' : err.message,
      error: err 
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Upload Multiple House Monitoring Photos (4/day rule)
// @route   POST /api/v1/beneficiaries/:id/monitoring/multi
// @access  Private (Trainer/Staff)
// ─────────────────────────────────────────────────────────────
exports.uploadMonitoringPhotos = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one photo' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyEntry = beneficiary.monitoring.find(m => m.date === todayStr);

    const newPhotoUrls = files.map(f => f.path);

    if (!dailyEntry) {
      const sliced = newPhotoUrls.slice(0, 4);
      beneficiary.monitoring.push({
        date: todayStr,
        photoUrls: sliced,
        status: sliced.length >= 4 ? 'Ok' : 'Error'
      });
      dailyEntry = beneficiary.monitoring[beneficiary.monitoring.length - 1];
    } else {
      const remaining = 4 - dailyEntry.photoUrls.length;
      if (remaining <= 0) {
        return res.status(400).json({ success: false, message: 'Daily limit of 4 photos already reached for this house' });
      }
      const toAdd = newPhotoUrls.slice(0, remaining);
      dailyEntry.photoUrls.push(...toAdd);
      if (dailyEntry.photoUrls.length >= 4) dailyEntry.status = 'Ok';
    }

    await beneficiary.save();

    res.status(200).json({
      success: true,
      message: `${Math.min(files.length, 4)} photo(s) uploaded successfully`,
      photosUploadedToday: dailyEntry.photoUrls.length,
      dailyStatus: dailyEntry.status
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Upload Single House Monitoring Photo
// @route   POST /api/v1/beneficiaries/:id/monitoring
// @access  Private (Trainer/Staff)
// ─────────────────────────────────────────────────────────────
exports.uploadMonitoringPhoto = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a photo' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyEntry = beneficiary.monitoring.find(m => m.date === todayStr);

    if (!dailyEntry) {
      beneficiary.monitoring.push({ date: todayStr, photoUrls: [req.file.path], status: 'Error' });
    } else {
      if (dailyEntry.photoUrls.length >= 4) {
        return res.status(400).json({ success: false, message: 'Daily limit of 4 photos reached for this house' });
      }
      dailyEntry.photoUrls.push(req.file.path);
      if (dailyEntry.photoUrls.length === 4) dailyEntry.status = 'Ok';
    }

    await beneficiary.save();
    res.status(200).json({ success: true, message: 'Photo uploaded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get monitoring logs (photos + attendance) for logged-in trainer
// @route   GET /api/v1/beneficiaries/my-logs
// @access  Private (Trainer)
// ─────────────────────────────────────────────────────────────
exports.getMyLogs = async (req, res) => {
  try {
    const { date, village } = req.query;
    const filter = { assignedStaff: req.user.id };
    if (village) filter['address.village'] = new RegExp(village, 'i');

    const beneficiaries = await Beneficiary.find(filter)
      .populate('project', 'workOrderNo projectCategory')
      .lean();

    // Flatten monitoring logs, filtered by date if provided
    const logs = [];
    for (const b of beneficiaries) {
      for (const entry of (b.monitoring || [])) {
        if (date && entry.date !== date) continue;
        logs.push({
          beneficiaryId: b._id,
          beneficiaryName: b.name,
          beneficiaryCode: b.beneficiaryId,
          village: b.address?.village,
          district: b.address?.district,
          taluka: b.address?.taluka,
          state: b.address?.state,
          project: b.project,
          date: entry.date,
          photoUrls: entry.photoUrls,
          status: entry.status,
          musterRoll: entry.musterRollSubmitted,
        });
      }
    }

    // --- 2. Trainer Presence (Attendance) Logs ---
    const attendanceRecords = await Attendance.find({ trainerId: req.user.id })
       .sort({ date: -1 });

    const attendanceLogs = attendanceRecords.map(att => ({
      _id: att._id,
      type: 'attendance',
      date: att.date.toISOString().split('T')[0],
      photos: att.photos || [],
      status: att.status,
      projectId: att.projectId,
      location: att.location,
      remarks: att.remarks
    }));

    // Sort Monitoring Logs by date descending
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ 
      success: true, 
      count: logs.length + attendanceLogs.length, 
      data: {
        monitoring: logs,
        attendance: attendanceLogs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update Beneficiary House Level & Status
// @route   PUT /api/v1/beneficiaries/:id
// @access  Private (Trainer/Manager)
// ─────────────────────────────────────────────────────────────
exports.updateBeneficiaryStatus = async (req, res) => {
  try {
    const { houseLevel, ftoStatus, masonPaymentStatus, musterRollStatus } = req.body;

    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    if (houseLevel)        beneficiary.houseLevel        = houseLevel;
    if (ftoStatus)         beneficiary.ftoStatus         = ftoStatus;
    if (masonPaymentStatus) beneficiary.masonPaymentStatus = masonPaymentStatus;

    // Update Muster Roll Status for today if exists
    if (musterRollStatus) {
      const todayStr = new Date().toISOString().split('T')[0];
      let dailyEntry = beneficiary.monitoring.find(m => m.date === todayStr);
      if (dailyEntry) {
        dailyEntry.musterRollSubmitted = musterRollStatus;
      }
    }

    await beneficiary.save();

    res.status(200).json({ success: true, message: 'Beneficiary updated successfully', data: beneficiary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get List of Beneficiaries (Filters: Staff, Project)
// @route   GET /api/v1/beneficiaries
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getBeneficiaries = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'trainer') {
      query = Beneficiary.find({ assignedStaff: req.user.id });
    } else if (req.user.role === 'manager') {
      // Find all beneficiaries for projects managed by this user
      const projects = await Project.find({ manager: req.user.id }).select('_id');
      query = Beneficiary.find({ project: { $in: projects } });
    } else {
      query = Beneficiary.find();
    }

    const beneficiaries = await query.populate('assignedStaff', 'fullName staffId').populate('project', 'workOrderNo projectCategory');
    res.status(200).json({ success: true, count: beneficiaries.length, data: beneficiaries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update Beneficiary details
// @route   PUT /api/v1/beneficiaries/:id
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.updateBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    // Authorization check
    if (req.user.role === 'manager' && beneficiary.project.toString()) {
       const project = await Project.findById(beneficiary.project);
       if (project.manager.toString() !== req.user.id) {
         return res.status(403).json({ success: false, message: 'Not authorized to edit this beneficiary' });
       }
    }

    const updated = await Beneficiary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete Beneficiary
// @route   DELETE /api/v1/beneficiaries/:id
// @access  Private (Manager/Admin)
// ─────────────────────────────────────────────────────────────
exports.deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    // Authorization check for managers
    if (req.user.role === 'manager') {
       const project = await Project.findById(beneficiary.project);
       if (project.manager.toString() !== req.user.id) {
         return res.status(403).json({ success: false, message: 'Not authorized to delete this beneficiary' });
       }
    }

    await Beneficiary.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Beneficiary removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
