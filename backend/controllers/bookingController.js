const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// Generate unique readable booking reference (e.g. IM-83FA91)
const generateBookingReference = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IM-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// @desc    Confirm booking (converts active held seats to confirmed booking)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;
    const userId = req.user._id;

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID and selected seats are required.',
      });
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate('movie', 'title posterUrl durationMinutes ageRating')
      .populate('theatre', 'name city address');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    const now = new Date();

    // STRICT ATOMIC CONCURRENCY CHECK:
    // Every single seat must have an ACTIVE hold held by THIS user that has NOT expired
    const validatedSeats = [];
    for (const reqSeat of seats) {
      const seat = showtime.seats.find(
        (s) => s.row === reqSeat.row && s.number === Number(reqSeat.number)
      );

      if (!seat) {
        return res.status(400).json({
          success: false,
          message: `Seat ${reqSeat.row}${reqSeat.number} is invalid for this showtime.`,
        });
      }

      if (seat.status === 'booked') {
        return res.status(409).json({
          success: false,
          message: `Seat ${seat.row}${seat.number} has already been booked.`,
        });
      }

      // Check if hold is expired or not held by this user
      const isHeldByMe =
        seat.status === 'held' &&
        seat.heldBy &&
        seat.heldBy.toString() === userId.toString();

      const isHoldActive =
        seat.heldUntil && new Date(seat.heldUntil) >= now;

      if (!isHeldByMe || !isHoldActive) {
        return res.status(409).json({
          success: false,
          message: `Seat hold on ${seat.row}${seat.number} has expired or is invalid. Please return to seat selection and choose your seats again.`,
        });
      }

      validatedSeats.push(seat);
    }

    // Generate unique reference
    let bookingReference = generateBookingReference();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Booking.findOne({ bookingReference });
      if (!existing) {
        isUnique = true;
      } else {
        bookingReference = generateBookingReference();
      }
    }

    // Convert seats to booked in showtime
    for (const seat of validatedSeats) {
      seat.status = 'booked';
      seat.bookedBy = userId;
      seat.bookingReference = bookingReference;
      seat.heldBy = null;
      seat.heldUntil = null;
    }

    await showtime.save();

    // Calculate total amount
    const totalAmount = validatedSeats.reduce((acc, s) => acc + s.price, 0);

    // Build QR payload
    const qrPayload = JSON.stringify({
      ref: bookingReference,
      user: req.user.email,
      movie: showtime.movie.title,
      theatre: showtime.theatre.name,
      screen: showtime.screenName,
      time: showtime.startTime,
      seats: validatedSeats.map((s) => `${s.row}${s.number}`).join(','),
      amount: totalAmount,
      currency: 'INR',
      issuedAt: new Date().toISOString(),
    });

    // Create the booking document
    const booking = await Booking.create({
      bookingReference,
      user: userId,
      showtime: showtime._id,
      movie: showtime.movie._id,
      theatre: showtime.theatre._id,
      seats: validatedSeats.map((s) => ({
        row: s.row,
        number: s.number,
        tier: s.tier,
        price: s.price,
      })),
      totalAmount,
      currency: 'INR',
      status: 'confirmed',
      paymentNote: 'Direct confirmation. Payment processing is out of scope.',
      qrData: qrPayload,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl durationMinutes ageRating language')
      .populate('theatre', 'name city address screens')
      .populate('showtime', 'startTime endTime screenName screenFormat');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error confirming booking.',
    });
  }
};

// @desc    Get user's booking history
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl durationMinutes ageRating')
      .populate('theatre', 'name city address')
      .populate('showtime', 'startTime endTime screenName screenFormat')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving bookings.',
    });
  }
};

// @desc    Get single booking by ID or Reference
// @route   GET /api/bookings/:idOrRef
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const { idOrRef } = req.params;
    let query = {};

    if (idOrRef.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idOrRef;
    } else {
      query.bookingReference = idOrRef.toUpperCase();
    }

    const booking = await Booking.findOne(query)
      .populate('movie', 'title posterUrl durationMinutes ageRating language genre')
      .populate('theatre', 'name city address facilities')
      .populate('showtime', 'startTime endTime screenName screenFormat')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Verify ownership unless admin
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching booking details.',
    });
  }
};

// @desc    Cancel a booking (allowed >= 2 hours before showtime)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showtime');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Check 2 hours before showtime
    const showtime = await Showtime.findById(booking.showtime);
    if (showtime) {
      const showStartTime = new Date(showtime.startTime).getTime();
      const now = Date.now();
      const twoHoursMs = 2 * 60 * 60 * 1000;

      if (showStartTime - now < twoHoursMs) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation is only allowed up to 2 hours prior to the showtime start.',
        });
      }

      // Release seats in showtime
      for (const bookedSeat of booking.seats) {
        const match = showtime.seats.find(
          (s) => s.row === bookedSeat.row && s.number === bookedSeat.number
        );
        if (match && match.status === 'booked') {
          match.status = 'available';
          match.bookedBy = null;
          match.bookingReference = null;
          match.heldBy = null;
          match.heldUntil = null;
        }
      }
      await showtime.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Your seats have been released.',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error cancelling booking.',
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
