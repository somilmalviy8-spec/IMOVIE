import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Shield,
  Film,
  Calendar,
  IndianRupee,
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '../utils/currency';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'showtimes'

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // New Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    synopsis: '',
    posterUrl: '',
    backdropUrl: '',
    trailerYoutubeId: '',
    genre: 'Action, Sci-Fi',
    durationMinutes: 120,
    ageRating: 'PG-13',
    ratingScore: 8.5,
    isNowShowing: true,
    director: '',
    cast: '',
  });
  const [savingMovie, setSavingMovie] = useState(false);

  // New Showtime Form State
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    theatreId: '',
    screenName: 'Screen 1 - Laser',
    screenFormat: 'IMAX 3D',
    startTime: '',
    basePrice: 250,
  });
  const [savingShowtime, setSavingShowtime] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, moviesRes, theatresRes, showtimesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/movies'),
        api.get('/theatres'),
        api.get('/showtimes'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (moviesRes.data.success) setMovies(moviesRes.data.movies);
      if (theatresRes.data.success) setTheatres(theatresRes.data.theatres);
      if (showtimesRes.data.success) setShowtimes(showtimesRes.data.showtimes);

      // Set default IDs for showtime form
      if (moviesRes.data.movies.length > 0 && !showtimeForm.movieId) {
        setShowtimeForm((prev) => ({ ...prev, movieId: moviesRes.data.movies[0]._id }));
      }
      if (theatresRes.data.theatres.length > 0 && !showtimeForm.theatreId) {
        setShowtimeForm((prev) => ({ ...prev, theatreId: theatresRes.data.theatres[0]._id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Add Movie
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setSavingMovie(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/admin/movies', {
        ...movieForm,
        genre: movieForm.genre.split(',').map((g) => g.trim()),
        cast: movieForm.cast.split(',').map((c) => c.trim()),
      });

      if (res.data.success) {
        setMessage(`Movie "${movieForm.title}" added to catalog successfully.`);
        setMovieForm({
          title: '',
          synopsis: '',
          posterUrl: '',
          backdropUrl: '',
          trailerYoutubeId: '',
          genre: 'Action, Sci-Fi',
          durationMinutes: 120,
          ageRating: 'PG-13',
          ratingScore: 8.5,
          isNowShowing: true,
          director: '',
          cast: '',
        });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to create movie.');
    } finally {
      setSavingMovie(false);
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (movieId, movieTitle) => {
    if (!window.confirm(`Delete "${movieTitle}"? This cannot be undone.`)) return;

    try {
      const res = await api.delete(`/admin/movies/${movieId}`);
      if (res.data.success) {
        setMessage(`Movie "${movieTitle}" deleted.`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete movie.');
    }
  };

  // Schedule Showtime
  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    if (!showtimeForm.startTime) {
      setError('Please select a screening start date and time.');
      return;
    }

    setSavingShowtime(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/admin/showtimes', showtimeForm);
      if (res.data.success) {
        setMessage('Showtime scheduled successfully with 88 seats generated.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule showtime.');
    } finally {
      setSavingShowtime(false);
    }
  };

  // Delete Showtime
  const handleDeleteShowtime = async (showtimeId) => {
    if (!window.confirm('Delete this scheduled screening?')) return;

    try {
      const res = await api.delete(`/admin/showtimes/${showtimeId}`);
      if (res.data.success) {
        setMessage('Showtime removed.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete showtime.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status" style={{ color: 'var(--accent-coral)' }}>
          <span className="visually-hidden">Loading Admin Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Admin Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-4 mb-4 border-bottom gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <span className="badge text-uppercase fw-bold mb-2" style={{ backgroundColor: 'var(--accent-coral)', color: '#FFFFFF' }}>
            MANAGEMENT PORTAL
          </span>
          <h2 className="fw-black mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Shield size={28} style={{ color: 'var(--accent-coral)' }} /> Cinema Administrator Dashboard
          </h2>
          <p className="text-muted small mb-0 mt-1">
            Manage cinema catalog, schedule showtimes, and monitor booking analytics.
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
          <CheckCircle2 size={20} />
          <div>{message}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-5">
        <div className="col-lg-3 col-sm-6">
          <div className="cinema-card p-4 border-start border-4" style={{ borderLeftColor: 'var(--accent-coral) !important' }}>
            <div className="small text-uppercase fw-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Catalog Movies</div>
            <div className="fs-3 fw-black d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Film size={24} style={{ color: 'var(--accent-coral)' }} /> {stats?.totalMovies || 0}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="cinema-card p-4 border-start border-4" style={{ borderLeftColor: 'var(--accent-blue) !important' }}>
            <div className="small text-uppercase fw-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Active Showtimes</div>
            <div className="fs-3 fw-black d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Calendar size={24} style={{ color: 'var(--accent-blue)' }} /> {stats?.totalShowtimes || 0}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="cinema-card p-4 border-start border-4" style={{ borderLeftColor: '#10B981 !important' }}>
            <div className="small text-uppercase fw-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Total Bookings</div>
            <div className="fs-3 fw-black d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Ticket size={24} className="text-success" /> {stats?.totalBookings || 0}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="cinema-card p-4 border-start border-4" style={{ borderLeftColor: '#8B5CF6 !important' }}>
            <div className="small text-uppercase fw-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Total Revenue</div>
            <div className="fs-3 fw-black d-flex align-items-center gap-2" style={{ color: 'var(--accent-coral)' }}>
              <IndianRupee size={24} style={{ color: 'var(--accent-coral)' }} /> {formatINR(stats?.totalRevenue || 0, { showDecimals: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          type="button"
          className="btn pb-2 px-3 fw-bold border-0 rounded-0"
          style={{
            color: activeTab === 'overview' ? 'var(--accent-coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '2.5px solid var(--accent-coral)' : 'none',
          }}
          onClick={() => setActiveTab('overview')}
        >
          Overview & Movies ({movies.length})
        </button>

        <button
          type="button"
          className="btn pb-2 px-3 fw-bold border-0 rounded-0"
          style={{
            color: activeTab === 'showtimes' ? 'var(--accent-coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'showtimes' ? '2.5px solid var(--accent-coral)' : 'none',
          }}
          onClick={() => setActiveTab('showtimes')}
        >
          Schedule Showtimes ({showtimes.length})
        </button>
      </div>

      {/* TAB 1: Movie Management */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          {/* Add Movie Form */}
          <div className="col-lg-5">
            <div className="cinema-card p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <Plus size={18} style={{ color: 'var(--accent-coral)' }} /> Add New Cinema Title
              </h5>

              <form onSubmit={handleCreateMovie}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Movie Title</label>
                  <input
                    type="text"
                    className="form-control cinema-input"
                    placeholder="e.g. Blade Runner 2049"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Synopsis</label>
                  <textarea
                    rows={3}
                    className="form-control cinema-input"
                    placeholder="Brief movie plot summary..."
                    value={movieForm.synopsis}
                    onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Duration (Mins)</label>
                    <input
                      type="number"
                      className="form-control cinema-input"
                      value={movieForm.durationMinutes}
                      onChange={(e) => setMovieForm({ ...movieForm, durationMinutes: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Age Classification</label>
                    <select
                      className="form-select cinema-input"
                      value={movieForm.ageRating}
                      onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value })}
                    >
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="U/A">U/A</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Poster Image URL</label>
                  <input
                    type="url"
                    className="form-control cinema-input"
                    placeholder="https://images.unsplash.com/..."
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>YouTube Trailer Video ID</label>
                  <input
                    type="text"
                    className="form-control cinema-input"
                    placeholder="e.g. Way9Dexny3w"
                    value={movieForm.trailerYoutubeId}
                    onChange={(e) => setMovieForm({ ...movieForm, trailerYoutubeId: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Genres (Comma separated)</label>
                  <input
                    type="text"
                    className="form-control cinema-input"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                  />
                </div>

                <div className="form-check form-switch mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isNowShowingCheck"
                    checked={movieForm.isNowShowing}
                    onChange={(e) => setMovieForm({ ...movieForm, isNowShowing: e.target.checked })}
                  />
                  <label className="form-check-label small" htmlFor="isNowShowingCheck" style={{ color: 'var(--text-main)' }}>
                    Now Showing (Visible for ticket booking)
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-cinema-primary w-100 py-2 fw-bold"
                  disabled={savingMovie}
                >
                  {savingMovie ? 'Saving Movie...' : 'Save & Publish Movie'}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Movies Table */}
          <div className="col-lg-7">
            <div className="cinema-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Published Cinema Titles</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="border-bottom small" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th>Movie</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((m) => (
                      <tr key={m._id} className="border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={m.posterUrl}
                              alt={m.title}
                              className="rounded shadow-sm"
                              style={{ width: '36px', height: '50px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold small text-truncate" style={{ color: 'var(--text-heading)', maxWidth: '160px' }}>
                                {m.title}
                              </div>
                              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                {m.durationMinutes}m • {m.ageRating}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-rating small">★ {m.ratingScore?.toFixed(1)}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              m.isNowShowing ? 'bg-success' : 'bg-primary'
                            } text-uppercase`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {m.isNowShowing ? 'Now Showing' : 'Coming Soon'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-1"
                            onClick={() => handleDeleteMovie(m._id, m.title)}
                            title="Delete Movie"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Showtime Scheduling */}
      {activeTab === 'showtimes' && (
        <div className="row g-4">
          {/* Schedule Form */}
          <div className="col-lg-5">
            <div className="cinema-card p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <Calendar size={18} style={{ color: 'var(--accent-coral)' }} /> Schedule New Showtime
              </h5>

              <form onSubmit={handleCreateShowtime}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Target Movie</label>
                  <select
                    className="form-select cinema-input"
                    value={showtimeForm.movieId}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                    required
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.durationMinutes}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Multiplex Theatre</label>
                  <select
                    className="form-select cinema-input"
                    value={showtimeForm.theatreId}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, theatreId: e.target.value })}
                    required
                  >
                    {theatres.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Auditorium / Screen</label>
                    <input
                      type="text"
                      className="form-control cinema-input"
                      value={showtimeForm.screenName}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, screenName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Format</label>
                    <select
                      className="form-select cinema-input"
                      value={showtimeForm.screenFormat}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, screenFormat: e.target.value })}
                    >
                      <option value="Standard 2D">Standard 2D</option>
                      <option value="IMAX 3D">IMAX 3D</option>
                      <option value="Dolby Atmos">Dolby Atmos</option>
                      <option value="4DX">4DX</option>
                      <option value="VIP Lounge">VIP Lounge</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Screening Date & Start Time</label>
                  <input
                    type="datetime-local"
                    className="form-control cinema-input"
                    value={showtimeForm.startTime}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Base Ticket Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    className="form-control cinema-input"
                    value={showtimeForm.basePrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, basePrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  <div className="form-text small" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    Auto-creates 88-seat layout with Standard, Premium (+35%), and VIP (+80%) tiers.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-cinema-primary w-100 py-2 fw-bold"
                  disabled={savingShowtime}
                >
                  {savingShowtime ? 'Generating Schedule...' : 'Schedule & Generate Seats'}
                </button>
              </form>
            </div>
          </div>

          {/* Showtimes List */}
          <div className="col-lg-7">
            <div className="cinema-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Active Scheduled Showtimes</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="border-bottom small" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th>Movie & Theatre</th>
                      <th>Format</th>
                      <th>Date / Time</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showtimes.map((st) => (
                      <tr key={st._id} className="border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                        <td>
                          <div className="fw-bold small" style={{ color: 'var(--text-heading)' }}>{st.movie?.title}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {st.theatre?.name} • {st.screenName}
                          </div>
                        </td>
                        <td>
                          <span className="badge-format" style={{ fontSize: '0.65rem' }}>
                            {st.screenFormat}
                          </span>
                        </td>
                        <td>
                          <div className="small fw-bold" style={{ color: 'var(--accent-coral)' }}>
                            {new Date(st.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {new Date(st.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-1"
                            onClick={() => handleDeleteShowtime(st._id)}
                            title="Delete Showtime"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
