const mongoose = require('mongoose');

const traineeSchema = new mongoose.Schema(
  {
    // ── SECTION 1: Basic Identification ──────────────────────
    traineeId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add trainee name'],
    },
    aadhaarNumber: {
      type: String,
      required: [true, 'Please add Aadhaar number'],
      match: [/^[0-9]{12}$/, 'Please add a valid 12-digit Aadhaar number'],
    },
    gender: {
      type: String,
      required: [true, 'Please select gender'],
      enum: ['Male', 'Female', 'Other'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please add mobile number'],
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
    },
    religion: {
      type: String,
      required: [true, 'Please select religion'],
    },
    casteCategory: {
      type: String,
      required: [true, 'Please select caste category'],
    },
    disabilityType: {
      type: String,
      required: [true, 'Please select disability type'],
    },
    isBPL: {
      type: String,
      required: [true, 'Please select BPL status'],
      enum: ['Yes', 'No'],
    },
    isKYCDone: {
      type: String,
      required: [true, 'Please select KYC status'],
      enum: ['Done', 'Not Done'],
    },
    photo: {
      type: String, // Cloudinary URL
      default: null,
    },

    // ── SECTION 2: Rural Mason Residential Address ────────────
    address: {
      type: String,
      required: [true, 'Please add address'],
    },
    state: {
      type: String,
      required: [true, 'Please select state'],
    },
    district: {
      type: String,
      required: [true, 'Please select district'],
    },
    block: {
      type: String,
      required: [true, 'Please select block'],
    },
    village: {
      type: String,
      required: [true, 'Please add village'],
    },
    pinCode: {
      type: String,
      required: [true, 'Please add PIN code'],
      match: [/^[0-9]{6}$/, 'Please add a valid 6-digit PIN code'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add contact number'],
    },

    // ── SECTION 3: Rural Mason Bank Details ───────────────────
    bankName: {
      type: String,
      required: [true, 'Please add bank name'],
    },
    accountNumber: {
      type: String,
      required: [true, 'Please add bank account number'],
    },
    ifscCode: {
      type: String,
      required: [true, 'Please add IFSC code'],
    },
    branch: {
      type: String,
      required: [true, 'Please add branch name'],
    },

    // ── SECTION 4: Training Information ───────────────────────
    trainingStatus: {
      type: String,
      required: [true, 'Please select training status'],
    },
    preTrainingStatus: {
      type: String,
      required: [true, 'Please select pre-training status'],
    },
    educationalLevel: {
      type: String,
      required: [true, 'Please select educational level'],
    },
    technicalEducation: {
      type: String,
      required: [true, 'Please select technical education'],
    },
    skillingCategory: {
      type: String,
      required: [true, 'Please select skilling category'],
    },
    experienceYears: {
      type: String,
      required: [true, 'Please select years of experience'],
    },
    experienceMonths: {
      type: String,
      required: [true, 'Please select months of experience'],
    },

    // ── SECTION 5: Additional Remarks ─────────────────────────
    managerRemarks: {
      type: String,
      default: null,
    },

    // ── Beneficiary Assignment ────────────────────────────────
    assignedBeneficiary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PMBeneficiary',
      default: null,
    },
    generatedTraineeCode: {
      type: String,
      default: null,
    },

    // ── Ownership & Relationships ─────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trainee', traineeSchema);
