const express = require('express');
const router = express.Router();
const {
  createMovie,
  updateMovie,
  deleteMovie,
  createShowtime,
  deleteShowtime,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

// All admin routes require both authentication and the admin role
router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);
router.post('/showtimes', createShowtime);
router.delete('/showtimes/:id', deleteShowtime);

module.exports = router;
