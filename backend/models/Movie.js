const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    synopsis: {
      type: String,
      required: [true, 'Movie synopsis is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerYoutubeId: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: true,
      default: ['Drama'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    language: {
      type: String,
      default: 'English',
    },
    ageRating: {
      type: String,
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'U', 'U/A', 'A'],
      default: 'PG-13',
    },
    ratingScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5,
    },
    votesCount: {
      type: Number,
      default: 120,
    },
    isNowShowing: {
      type: Boolean,
      default: true,
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search queries
movieSchema.index({ title: 'text', synopsis: 'text', director: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
