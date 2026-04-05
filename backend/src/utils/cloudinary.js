const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generic Storage for Project Documents (PDF, JPG)
 */
const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tms/projects',
    allowed_formats: ['jpg', 'png', 'pdf'],
    resource_type: 'auto', // Important for PDF support
  },
});

/**
 * Storage for Beneficiary House Photos (4 photos/day rule)
 */
const housePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tms/attendance',
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi'],
    resource_type: 'auto', // Support both images and videos
    transformation: [{ width: 1000, crop: "limit", quality: "auto" }], // Auto compress
  },
});

/**
 * Storage for Staff Selfies & Profile Photos
 */
const staffStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tms/staff',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  },
});

const uploadProjectDoc = multer({ storage: projectStorage });
const uploadHousePhoto = multer({ storage: housePhotoStorage });
const uploadStaffPhoto = multer({ storage: staffStorage });

module.exports = {
  cloudinary,
  uploadProjectDoc,
  uploadHousePhoto,
  uploadStaffPhoto,
};
