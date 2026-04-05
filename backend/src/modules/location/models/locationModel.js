const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: [true, 'Please add state name'],
    },
    district: {
      type: String,
      required: [true, 'Please add district name'],
    },
    taluka: {
      type: String,
      required: [true, 'Please add taluka name'],
    },
    cityVillage: {
      type: String,
      required: [true, 'Please add city or village name'],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index to prevent duplicate entries
locationSchema.index({ state: 1, district: 1, taluka: 1, cityVillage: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
