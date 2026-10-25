const express = require('express');
const router = express.Router();
const {
  getShowtimes,
  getShowtimeSeats,
  holdSeats,
  releaseSeats,
} = require('../controllers/showtimeController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', getShowtimes);
router.get('/:id/seats', optionalAuth, getShowtimeSeats);
router.post('/:id/hold-seats', protect, holdSeats);
router.post('/:id/release-seats', protect, releaseSeats);

module.exports = router;
