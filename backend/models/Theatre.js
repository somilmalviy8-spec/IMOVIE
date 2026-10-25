const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    screens: [
      {
        screenNumber: { type: Number, required: true },
        name: { type: String, required: true }, // e.g. "Screen 1 - IMAX"
        format: {
          type: String,
          enum: ['IMAX 3D', 'Dolby Atmos', 'Standard 2D', '4DX', 'VIP Lounge'],
          default: 'Standard 2D',
        },
      },
    ],
    facilities: {
      type: [String],
      default: ['Air Conditioning', 'Concessions Bar', 'Wheelchair Accessible'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Theatre', theatreSchema);
