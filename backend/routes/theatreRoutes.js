const express = require('express');
const router = express.Router();
const {
  getTheatres,
  getTheatreById,
} = require('../controllers/showtimeController');

router.get('/', getTheatres);
router.get('/:id', getTheatreById);

module.exports = router;
