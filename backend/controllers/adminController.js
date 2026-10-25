const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Theatre = require('../models/Theatre');
const Booking = require('../models/Booking');

// Helper to generate seat grid for an auditorium
const generateDefaultAuditoriumSeats = (basePrice = 250) => {
  const seats = [];
  const standardPrice = Number(basePrice);
  const premiumPrice = Math.round(basePrice * 1.35 * 100) / 100;
  const vipPrice = Math.round(basePrice * 1.8 * 100) / 100;

  // Rows A-B: Standard (seats 1-12)
  ['A', 'B'].forEach((row) => {
    for (let num = 1; num <= 12; num++) {
      seats.push({
        row,
        number: num,
        tier: 'standard',
        price: standardPrice,
        status: 'available',
      });
    }
  });

  // Rows C-F: Premium (seats 1-12)
  ['C', 'D', 'E', 'F'].forEach((row) => {
    for (let num = 1; num <= 12; num++) {
      seats.push({
        row,
        number: num,
        tier: 'premium',
        price: premiumPrice,
        status: 'available',
      });
    }
  });

  // Rows G-H: VIP Recliner (seats 1-10)
  ['G', 'H'].forEach((row) => {
    for (let num = 1; num <= 10; num++) {
      seats.push({
        row,
        number: num,
        tier: 'vip',
        price: vipPrice,
        status: 'available',
      });
    }
  });

  return {
    seats,
    tierPricing: {
      standard: standardPrice,
      premium: premiumPrice,
      vip: vipPrice,
    },
  };
};

// @desc    Create new movie
// @route   POST /api/admin/movies
// @access  Admin
const createMovie = async (req, res) => {
  try {
    const {
      title,
      synopsis,
      posterUrl,
      backdropUrl,
      trailerYoutubeId,
      genre,
      durationMinutes,
      releaseDate,
      language,
      ageRating,
      ratingScore,
      isNowShowing,
      director,
      cast,
      featured,
    } = req.body;

    if (!title || !synopsis || !posterUrl || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Title, synopsis, poster URL, and duration are required.',
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const movie = await Movie.create({
      title,
      slug,
      synopsis,
      posterUrl,
      backdropUrl: backdropUrl || posterUrl,
      trailerYoutubeId: trailerYoutubeId || '',
      genre: Array.isArray(genre) ? genre : (genre ? genre.split(',').map((g) => g.trim()) : ['Drama']),
      durationMinutes: Number(durationMinutes),
      releaseDate: releaseDate || Date.now(),
      language: language || 'English',
      ageRating: ageRating || 'PG-13',
      ratingScore: Number(ratingScore) || 8.0,
      isNowShowing: isNowShowing !== undefined ? isNowShowing : true,
      director: director || '',
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map((c) => c.trim()) : []),
      featured: Boolean(featured),
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      movie,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/admin/movies/:id
// @access  Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully.',
      movie: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie
// @route   DELETE /api/admin/movies/:id
// @access  Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new showtime with default seat grid
// @route   POST /api/admin/showtimes
// @access  Admin
const createShowtime = async (req, res) => {
  try {
    const {
      movieId,
      theatreId,
      screenName,
      screenFormat,
      startTime,
      durationMinutes,
      basePrice,
    } = req.body;

    if (!movieId || !theatreId || !startTime || !basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Movie, Theatre, Start Time, and Base Price are required.',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found.' });
    }

    const start = new Date(startTime);
    const duration = durationMinutes || movie.durationMinutes || 120;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const { seats, tierPricing } = generateDefaultAuditoriumSeats(Number(basePrice));

    const showtime = await Showtime.create({
      movie: movieId,
      theatre: theatreId,
      screenName: screenName || 'Screen 1',
      screenFormat: screenFormat || 'Standard 2D',
      startTime: start,
      endTime: end,
      basePrice: Number(basePrice),
      tierPricing,
      currency: 'INR',
      seats,
    });

    res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully with 88 seats.',
      showtime,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete showtime
// @route   DELETE /api/admin/showtimes/:id
// @access  Admin
const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    await Showtime.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Showtime deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Overview Statistics
// @route   GET /api/admin/stats
// @access  Admin
const getAdminStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalShowtimes = await Showtime.countDocuments();
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });

    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0] ? revenueResult[0].total : 0;

    const recentBookings = await Booking.find()
      .populate('movie', 'title')
      .populate('theatre', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        totalTheatres,
        totalShowtimes,
        totalBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        currency: 'INR',
      },
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  createShowtime,
  deleteShowtime,
  getAdminStats,
};
