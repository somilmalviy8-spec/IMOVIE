const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  getFeaturedMovies,
} = require('../controllers/movieController');

router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:idOrSlug', getMovieById);

module.exports = router;
