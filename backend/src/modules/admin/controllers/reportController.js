const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const axios = require('axios');
const Trainer = require('../../trainer/models/trainerModel');
const Project = require('../../project/models/projectModel');
const Attendance = require('../../attendance/models/attendanceModel');
const { cloudinary } = require('../../../utils/cloudinary');

// ─────────────────────────────────────────────────────────────
// @desc    Export Trainer/Staff Performance to Excel
// @route   GET /api/v1/admin/reports/staff-performance
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
exports.exportStaffPerformance = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'viewer') {
      query = { assignedProjects: { $in: req.user.assignedProjects || [] } };
    }
    const staffs = await Trainer.find(query).populate('reportingManager', 'fullName');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Staff Performance');

    // Define Columns
    worksheet.columns = [
      { header: 'Staff ID', key: 'staffId', width: 15 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Role', key: 'accountRole', width: 15 },
      { header: 'Mobile', key: 'mobileNumber', width: 15 },
      { header: 'Reporting Manager', key: 'manager', width: 25 },
      { header: 'ToT Status', key: 'totStatus', width: 15 },
      { header: 'Assigned Project', key: 'assignedProject', width: 25 },
      { header: 'Total Uploads', key: 'totalUploads', width: 15 },
      { header: 'Attendance Rate', key: 'attendanceRate', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Add Rows
    staffs.forEach(staff => {
      worksheet.addRow({
        staffId: staff.staffId || staff.trainerId,
        fullName: staff.fullName,
        accountRole: staff.accountRole,
        mobileNumber: staff.mobileNumber,
        manager: staff.reportingManager ? staff.reportingManager.fullName : 'N/A',
        totStatus: staff.totStatus || 'NE',
        assignedProject: staff.assignedProject,
        totalUploads: staff.totalUploads,
        attendanceRate: `${staff.attendanceRate}%`,
        status: staff.status,
      });
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Staff_Performance_Report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Download Project Photos in ZIP
// @route   GET /api/v1/admin/reports/project-photos/:projectId
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
exports.downloadProjectPhotos = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { date, trainerId } = req.query; // Optional filters

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Security Check for Viewer
    if (req.user.role === 'viewer' && !req.user.assignedProjects.includes(projectId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to download photos for this project' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=Project_${project.workOrderNo}_Photos.zip`);

    archive.pipe(res);

    // --- 2. Trainer Attendance Photos ---
    let attQuery = { projectId: projectId };
    if (date) {
      const d = new Date(date);
      attQuery.date = { 
        $gte: new Date(d.setHours(0,0,0,0)), 
        $lte: new Date(d.setHours(23,59,59,999)) 
      };
    }
    if (trainerId) attQuery.trainerId = trainerId;

    const attendances = await Attendance.find(attQuery).populate('trainerId', 'fullName trainerId');

    for (const att of attendances) {
      if (att.photos && att.photos.length > 0) {
        for (let i = 0; i < att.photos.length; i++) {
          const url = att.photos[i];
          const trainerName = att.trainerId?.fullName?.replace(/\s+/g, '_') || 'Unknown';
          const fileName = `Presence_${trainerName}_${att.date.toISOString().split('T')[0]}_img${i + 1}.jpg`;
          
          try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            archive.append(Buffer.from(response.data), { name: `Attendance/${trainerName}/${fileName}` });
          } catch (error) {
            console.error(`Failed to download attendance image: ${url}`);
          }
        }
      }
    }

    archive.finalize();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Export Photo Summary Report to Excel
// @route   GET /api/v1/admin/reports/photo-summary
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
exports.exportPhotoSummaryReport = async (req, res) => {
  try {
    const { date, projectId } = req.query;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Photo Upload Summary');

    worksheet.columns = [
      { header: 'ID', key: 'benId', width: 20 },
      { header: 'Name', key: 'name', width: 35 },
      { header: 'Project', key: 'project', width: 25 },
      { header: 'Staff Name', key: 'staff', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Photos Count', key: 'count', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // --- 2. Trainer Attendance Entries ---
    let attQuery = {};
    if (req.user.role === 'viewer') {
      const assigned = req.user.assignedProjects || [];
      attQuery.projectId = { $in: assigned };
    }
    if (projectId) {
      if (req.user.role === 'viewer' && !req.user.assignedProjects.includes(projectId)) {
         return res.status(403).json({ success: false, message: 'Not authorized for this project' });
      }
      attQuery.projectId = projectId;
    }
    if (date) {
      const d = new Date(date);
      attQuery.date = { 
        $gte: new Date(d.setHours(0,0,0,0)), 
        $lte: new Date(d.setHours(23,59,59,999)) 
      };
    }

    const attendances = await Attendance.find(attQuery).populate('trainerId', 'fullName trainerId');

    attendances.forEach(att => {
      worksheet.addRow({
        benId: att.trainerId?.trainerId || 'N/A',
        name: `[PRESENCE] ${att.trainerId?.fullName || 'N/A'}`,
        project: att.projectId || 'N/A',
        staff: att.trainerId?.fullName || 'N/A',
        date: att.date.toISOString().split('T')[0],
        count: att.photos.length,
        status: att.status,
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Photo_Summary_Report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Export Project Summary to PDF
// @route   GET /api/v1/admin/reports/project-summary/:projectId
// @access  Private (Admin/Manager)
// ─────────────────────────────────────────────────────────────
exports.exportProjectSummary = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('manager', 'fullName');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Security Check for Viewer
    if (req.user.role === 'viewer' && !req.user.assignedProjects.includes(project._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Project_${project.workOrderNo}_Summary.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Project Status Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Project Category: ${project.projectCategory}`);
    doc.text(`Work Order Number: ${project.workOrderNo}`);
    doc.text(`Assigned Manager: ${project.manager.fullName}`);
    doc.text(`Location: ${project.location.state} > ${project.location.district} > ${project.location.taluka}`);
    doc.moveDown();

    // Financials
    doc.fontSize(16).text('Financial & Progress Details', { underline: true });
    doc.fontSize(12).text(`Allocated Target: ${project.allocatedTarget}`);
    doc.text(`Completion Rate: ${project.progressStatus}%`);
    doc.text(`Total Project Cost: Rs. ${project.totalProjectCost}`);
    doc.text(`1st Installment: ${project.installment1Status}`);
    doc.text(`Assessment Status: ${project.assessmentStatus}`);
    doc.text(`2nd Installment: ${project.installment2Status}`);
    
    doc.moveDown();
    doc.text(`Start Date: ${project.startDate.toDateString()}`);
    doc.text(`Target Completion: ${project.endDate.toDateString()}`);

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
