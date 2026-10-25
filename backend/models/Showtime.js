const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    row: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
    },
    tier: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'held', 'booked'],
      default: 'available',
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    heldUntil: {
      type: Date,
      default: null,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingReference: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
    },
    screenName: {
      type: String,
      required: true,
      default: 'Screen 1',
    },
    screenFormat: {
      type: String,
      enum: ['IMAX 3D', 'Dolby Atmos', 'Standard 2D', '4DX', 'VIP Lounge'],
      default: 'Standard 2D',
    },
    startTime: {
      type: Date,
      required: [true, 'Showtime start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Showtime end time is required'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base ticket price is required'],
      default: 250,
    },
    tierPricing: {
      standard: { type: Number, default: 250 },
      premium: { type: Number, default: 340 },
      vip: { type: Number, default: 450 },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    seats: [seatSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for querying showtimes by movie, theatre, date
showtimeSchema.index({ movie: 1, theatre: 1, startTime: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);
