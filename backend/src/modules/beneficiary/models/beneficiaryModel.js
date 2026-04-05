const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add beneficiary name'],
    },
    beneficiaryId: { // PMAY-G ID
      type: String,
      required: [true, 'Please add beneficiary (PMAY-G) ID'],
      unique: true,
    },
    ftoStatus: {
      type: String,
      enum: ['Done', 'Yet to be done'],
      default: 'Yet to be done',
    },
    houseLevel: {
      type: String,
      enum: [
        'Mark Layout',
        'Soak pit',
        'PCC Work',
        'Brick Work',
        'Lintel Level',
        'Shuttering Level',
        'Slab Casting',
        'Plastering and logo'
      ],
      default: 'Mark Layout',
    },
    houseStartDate: {
      type: Date,
    },
    houseEndDate: {
      type: Date,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    masonPaymentStatus: {
      type: String,
      enum: ['Done', 'Not Done', 'Muster roll submitted'],
      default: 'Not Done',
    },
    phoneNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
    },
    address: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      taluka: { type: String, required: true },
      village: { type: String, required: true },
      fullAddress: { type: String },
    },
    shortNote: {
      type: String,
    },
    profilePhotoUrl: {
      type: String, // Standing in front of house
    },
    
    // ── Photo Monitoring Logic ───────────────
    // Array of photo entries by date to enforce the "4 photos/day" rule
    monitoring: [
      {
        date: {
          type: String, // YYYY-MM-DD
          required: true,
        },
        photoUrls: [String], // Array of 4 photo URLs
        status: {
          type: String,
          enum: ['Ok', 'Error'],
          default: 'Error', // "Done-Display / Ok, Not Done - Display Error"
        },
        musterRollSubmitted: {
          type: String,
          enum: ['Ok', 'Error'],
          default: 'Error',
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
