const Movie = require('../models/Movie');

// @desc    Get all movies with filtering, search, and sorting
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { search, genre, status, sort } = req.query;
    let query = {};

    // Filter by Now Showing vs Coming Soon
    if (status === 'now_showing') {
      query.isNowShowing = true;
    } else if (status === 'coming_soon') {
      query.isNowShowing = false;
    }

    // Filter by Genre
    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    // Keyword Search (title, synopsis, director)
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { synopsis: { $regex: term, $options: 'i' } },
        { director: { $regex: term, $options: 'i' } },
        { cast: { $regex: term, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { releaseDate: -1 };
    if (sort === 'rating') {
      sortOption = { ratingScore: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'duration') {
      sortOption = { durationMinutes: 1 };
    }

    const movies = await Movie.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error('getMovies error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching movies.',
    });
  }
};

// @desc    Get single movie by ID or slug
// @route   GET /api/movies/:idOrSlug
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let movie;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(idOrSlug);
    } else {
      movie = await Movie.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error('getMovieById error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching movie details.',
    });
  }
};

// @desc    Get featured movies for banner / carousel
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ featured: true }).limit(5);
    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching featured movies.',
    });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  getFeaturedMovies,
};
