const Showtime = require('../models/Showtime');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: theatres.length,
      theatres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching theatres.',
    });
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    res.status(200).json({ success: true, theatre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get showtimes with filters (movie, theatre, date)
// @route   GET /api/showtimes
// @access  Public
const getShowtimes = async (req, res) => {
  try {
    const { movieId, theatreId, date } = req.query;
    let query = {};

    if (movieId) {
      query.movie = movieId;
    }
    if (theatreId) {
      query.theatre = theatreId;
    }

    if (date) {
      // Filter showtimes for the specific calendar day (from 00:00:00 to 23:59:59 in target date)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const showtimes = await Showtime.find(query)
      .populate('movie', 'title slug posterUrl ageRating durationMinutes')
      .populate('theatre', 'name city address screens')
      .select('-seats') // Don't send huge seat array in listing
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: showtimes.length,
      showtimes,
    });
  } catch (error) {
    console.error('getShowtimes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching showtimes.',
    });
  }
};

// @desc    Get single showtime details with live seat availability
// @route   GET /api/showtimes/:id/seats
// @access  Public (optional auth for user's own holds)
const getShowtimeSeats = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title posterUrl ageRating durationMinutes language')
      .populate('theatre', 'name city address');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    const now = new Date();
    const currentUserId = req.user ? req.user._id.toString() : null;

    // Dynamically evaluate seat statuses (handling expired holds)
    const sanitizedSeats = showtime.seats.map((seat) => {
      let effectiveStatus = seat.status;

      // If held, but hold has expired -> treat dynamically as available!
      if (seat.status === 'held' && seat.heldUntil && new Date(seat.heldUntil) < now) {
        effectiveStatus = 'available';
      }

      const isMyHold =
        effectiveStatus === 'held' &&
        currentUserId &&
        seat.heldBy &&
        seat.heldBy.toString() === currentUserId;

      return {
        row: seat.row,
        number: seat.number,
        tier: seat.tier,
        price: seat.price,
        status: effectiveStatus,
        isMyHold: Boolean(isMyHold),
        heldUntil: effectiveStatus === 'held' ? seat.heldUntil : null,
      };
    });

    res.status(200).json({
      success: true,
      showtime: {
        id: showtime._id,
        movie: showtime.movie,
        theatre: showtime.theatre,
        screenName: showtime.screenName,
        screenFormat: showtime.screenFormat,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        basePrice: showtime.basePrice,
        tierPricing: showtime.tierPricing,
        currency: showtime.currency || 'INR',
      },
      seats: sanitizedSeats,
    });
  } catch (error) {
    console.error('getShowtimeSeats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching seat layout.',
    });
  }
};

// @desc    Acquire a temporary hold on selected seats (10-minute hold)
// @route   POST /api/showtimes/:id/hold-seats
// @access  Private
const holdSeats = async (req, res) => {
  try {
    const { seats } = req.body; // Array of { row: 'C', number: 4 }
    const showtimeId = req.params.id;
    const userId = req.user._id;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one seat to hold.',
      });
    }

    if (seats.length > 8) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 8 seats can be selected per booking.',
      });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    const now = new Date();
    const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes
    const heldUntil = new Date(Date.now() + HOLD_DURATION_MS);
    const holdUntil = heldUntil;

    // Concurrency check: Ensure every requested seat is either available, or held by this user, or held with expired timestamp
    for (const reqSeat of seats) {
      const match = showtime.seats.find(
        (s) => s.row === reqSeat.row && s.number === Number(reqSeat.number)
      );

      if (!match) {
        return res.status(400).json({
          success: false,
          message: `Seat ${reqSeat.row}${reqSeat.number} does not exist in this auditorium.`,
        });
      }

      if (match.status === 'booked') {
        return res.status(409).json({
          success: false,
          message: `Seat ${match.row}${match.number} has already been booked by another customer.`,
        });
      }

      if (
        match.status === 'held' &&
        match.heldUntil &&
        new Date(match.heldUntil) >= now &&
        match.heldBy &&
        match.heldBy.toString() !== userId.toString()
      ) {
        return res.status(409).json({
          success: false,
          message: `Seat ${match.row}${match.number} is currently held by another customer. Please choose other seats.`,
        });
      }
    }

    // First release any previous holds by this user on this showtime that are not in the new selection
    showtime.seats.forEach((s) => {
      if (
        s.status === 'held' &&
        s.heldBy &&
        s.heldBy.toString() === userId.toString()
      ) {
        const stillSelected = seats.some(
          (reqS) => reqS.row === s.row && Number(reqS.number) === s.number
        );
        if (!stillSelected) {
          s.status = 'available';
          s.heldBy = null;
          s.heldUntil = null;
        }
      }
    });

    // Apply the hold to all requested seats
    const heldSeatsInfo = [];
    for (const reqSeat of seats) {
      const target = showtime.seats.find(
        (s) => s.row === reqSeat.row && s.number === Number(reqSeat.number)
      );
      target.status = 'held';
      target.heldBy = userId;
      target.heldUntil = holdUntil;

      heldSeatsInfo.push({
        row: target.row,
        number: target.number,
        tier: target.tier,
        price: target.price,
      });
    }

    await showtime.save();

    res.status(200).json({
      success: true,
      message: 'Seats held successfully for 10 minutes.',
      heldUntil,
      currency: 'INR',
      heldSeats: heldSeatsInfo,
    });
  } catch (error) {
    console.error('holdSeats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error acquiring seat hold.',
    });
  }
};

// @desc    Release temporary hold on seats
// @route   POST /api/showtimes/:id/release-seats
// @access  Private
const releaseSeats = async (req, res) => {
  try {
    const showtimeId = req.params.id;
    const userId = req.user._id;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    let releasedCount = 0;
    showtime.seats.forEach((seat) => {
      if (
        seat.status === 'held' &&
        seat.heldBy &&
        seat.heldBy.toString() === userId.toString()
      ) {
        seat.status = 'available';
        seat.heldBy = null;
        seat.heldUntil = null;
        releasedCount++;
      }
    });

    await showtime.save();

    res.status(200).json({
      success: true,
      message: `Released ${releasedCount} seats.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error releasing seats.',
    });
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  getShowtimes,
  getShowtimeSeats,
  holdSeats,
  releaseSeats,
};
