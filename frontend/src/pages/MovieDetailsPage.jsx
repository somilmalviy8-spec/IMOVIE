import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import DateSelector from '../components/showtimes/DateSelector';
import ShowtimeList from '../components/showtimes/ShowtimeList';
import TrailerModal from '../components/movies/TrailerModal';
import { DEMO_MOVIES, generateDemoShowtimesForMovie } from '../data/demoData';
import {
  Star,
  Clock,
  Calendar,
  Globe,
  Play,
  ChevronLeft,
  Film,
  AlertCircle,
  Clapperboard,
  Ticket,
  Info,
  RefreshCw,
  Users,
  Award,
} from 'lucide-react';

const MovieDetailsPage = () => {
  const { idOrSlug } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  // Showtimes state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);

  // Trailer modal state
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Fetch movie data from backend API with fallback to clearly labeled demo data
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError('');
      setIsUsingDemoData(false);

      try {
        const res = await api.get(`/movies/${idOrSlug}`);
        if (res.data.success && res.data.movie) {
          setMovie(res.data.movie);
        } else {
          throw new Error('Movie not found on server.');
        }
      } catch (err) {
        console.warn('API error, falling back to demo catalog check:', err.message);

        // Check if movie exists in DEMO_MOVIES by ID or slug
        const demoMatch = DEMO_MOVIES.find(
          (m) =>
            m._id === idOrSlug ||
            m.slug?.toLowerCase() === idOrSlug.toLowerCase()
        );

        if (demoMatch) {
          setMovie(demoMatch);
          setIsUsingDemoData(true);
        } else {
          setError(err.message || 'The requested film could not be loaded.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [idOrSlug]);

  // Fetch showtimes for selected date
  useEffect(() => {
    if (!movie?._id) return;

    // If coming soon, there are no live showtimes yet
    if (!movie.isNowShowing) {
      setShowtimes([]);
      return;
    }

    const fetchShowtimes = async () => {
      setShowtimesLoading(true);

      if (isUsingDemoData) {
        // Generate realistic demo showtimes for this demo movie on the selected date
        const demoSts = generateDemoShowtimesForMovie(movie._id, selectedDate);
        setShowtimes(demoSts);
        setShowtimesLoading(false);
        return;
      }

      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await api.get(`/showtimes?movieId=${movie._id}&date=${dateStr}`);
        if (res.data.success && Array.isArray(res.data.showtimes)) {
          setShowtimes(res.data.showtimes);
        } else {
          setShowtimes([]);
        }
      } catch (err) {
        console.warn('Error fetching live showtimes, generating demo preview showtimes:', err.message);
        const fallbackShowtimes = generateDemoShowtimesForMovie(movie._id, selectedDate);
        setShowtimes(fallbackShowtimes);
      } finally {
        setShowtimesLoading(false);
      }
    };

    fetchShowtimes();
  }, [movie?._id, movie?.isNowShowing, selectedDate, isUsingDemoData]);

  const formatDuration = (mins) => {
    if (!mins) return 'N/A';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '65vh' }} role="status">
        <div className="spinner-border" style={{ color: 'var(--accent-coral)' }} role="status">
          <span className="visually-hidden">Loading movie details...</span>
        </div>
        <p className="text-muted small mt-3">Loading cinematic details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '65vh' }} role="alert">
        <div className="cinema-card p-5 d-inline-block text-center shadow-sm" style={{ maxWidth: 500 }}>
          <AlertCircle size={48} className="text-danger mb-3 mx-auto" />
          <h4 className="fw-bold mb-2" style={{ color: 'var(--text-heading)' }}>
            Movie Not Found
          </h4>
          <p className="small mb-4" style={{ color: 'var(--text-muted)' }}>
            {error || 'We could not locate this title in our cinema database.'}
          </p>
          <Link to="/" className="btn btn-cinema-primary">
            <ChevronLeft size={16} /> Back to Movie Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Demo Data Notice Banner */}
      {isUsingDemoData && (
        <div
          className="container pt-3"
          role="region"
          aria-label="Demo Data Notice"
        >
          <div
            className="alert d-flex align-items-center gap-2 mb-0 shadow-sm"
            style={{
              backgroundColor: '#FFF7ED',
              border: '1.5px solid #FDBA74',
              borderRadius: '10px',
              color: '#9A3412',
              fontSize: '0.85rem',
            }}
          >
            <Info size={18} className="flex-shrink-0" style={{ color: 'var(--accent-coral)' }} />
            <div>
              <strong>DEMO SHOWCASE:</strong> Showing demo movie details and sample showtimes because the local MongoDB server is offline.
            </div>
          </div>
        </div>
      )}

      {/* Movie Hero Header with Editorial Blue Backdrop */}
      <section
        aria-labelledby="movie-details-title"
        className="position-relative py-5 border-bottom"
        style={{
          backgroundColor: '#164366',
          backgroundImage: `linear-gradient(to bottom, rgba(22, 67, 102, 0.90) 0%, rgba(14, 42, 64, 0.98) 100%), url(${
            movie.backdropUrl || movie.posterUrl
          })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <Link
              to="/"
              className="btn btn-sm d-inline-flex align-items-center gap-1 rounded-3 fw-bold"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                backdropFilter: 'blur(4px)',
              }}
              aria-label="Return to movie catalog"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span>Back to Movie Catalog</span>
            </Link>
          </nav>

          <div className="row g-4 align-items-center">
            {/* Poster Card */}
            <div className="col-lg-3 col-md-4 col-sm-6 mx-auto text-center">
              <div
                className="cinema-card overflow-hidden shadow-lg border-0"
                style={{ borderRadius: '16px', maxWidth: '300px', margin: '0 auto' }}
              >
                <img
                  src={movie.posterUrl}
                  alt={`Official theatrical poster for ${movie.title}`}
                  className="w-100 h-auto d-block"
                  style={{ objectFit: 'cover', minHeight: '380px' }}
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            </div>

            {/* Movie Info Container */}
            <div className="col-lg-9 col-md-8">
              {/* Badges & Classification */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span
                  className="badge-rating d-inline-flex align-items-center gap-1 shadow-sm"
                  aria-label={`Rating ${movie.ratingScore?.toFixed(1) || '8.5'} out of 10`}
                >
                  <Star size={14} fill="currentColor" aria-hidden="true" />{' '}
                  <span className="fw-bold">{movie.ratingScore?.toFixed(1) || '8.5'}</span>
                  <span className="small text-muted">/ 10</span>
                </span>

                {movie.votesCount && (
                  <span className="small text-white-50" style={{ fontSize: '0.8rem' }}>
                    ({movie.votesCount.toLocaleString()} votes)
                  </span>
                )}

                <span className="badge-age" aria-label={`Age rating: ${movie.ageRating || 'PG-13'}`}>
                  {movie.ageRating || 'PG-13'}
                </span>

                {movie.isNowShowing ? (
                  <span
                    className="badge fw-bold text-uppercase"
                    style={{ backgroundColor: 'var(--accent-coral)', color: '#FFFFFF' }}
                  >
                    NOW SHOWING
                  </span>
                ) : (
                  <span
                    className="badge fw-bold text-uppercase"
                    style={{ backgroundColor: '#226192', color: '#FFFFFF' }}
                  >
                    COMING SOON
                  </span>
                )}
              </div>

              {/* Movie Title */}
              <h1
                id="movie-details-title"
                className="display-5 fw-black text-white mb-3"
                style={{ letterSpacing: '-0.02em' }}
              >
                {movie.title}
              </h1>

              {/* Metadata Badges */}
              <div
                className="d-flex flex-wrap align-items-center gap-3 small mb-4"
                style={{ color: '#EAE6DE' }}
              >
                <span className="d-flex align-items-center gap-1 text-white">
                  <Clock size={16} style={{ color: 'var(--accent-coral)' }} aria-hidden="true" />
                  <span>{formatDuration(movie.durationMinutes)}</span>
                </span>
                <span>•</span>
                <span className="fw-semibold" style={{ color: 'var(--accent-coral)' }}>
                  {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <Globe size={16} aria-hidden="true" />
                  <span>{movie.language}</span>
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <Calendar size={16} aria-hidden="true" />
                  <span>
                    {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </div>

              {/* Synopsis */}
              <p
                className="lead text-white opacity-90 fs-6 mb-4"
                style={{ lineHeight: '1.75', maxWidth: '780px' }}
              >
                {movie.synopsis}
              </p>

              {/* Cast & Director */}
              <div className="row g-3 small mb-4" style={{ color: '#CBD7E2' }}>
                {movie.director && (
                  <div className="col-sm-6">
                    <span className="text-white-50 fw-semibold">Director:</span>{' '}
                    <span className="text-white fw-bold">{movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="col-sm-12">
                    <span className="text-white-50 fw-semibold">Starring:</span>{' '}
                    <span className="text-white">
                      {Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3">
                {movie.trailerYoutubeId && (
                  <button
                    type="button"
                    className="btn py-2 px-4 rounded-3 d-inline-flex align-items-center gap-2 fw-semibold shadow-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                    }}
                    onClick={() => setTrailerOpen(true)}
                    aria-label={`Watch official trailer for ${movie.title}`}
                  >
                    <Play size={18} style={{ color: 'var(--accent-coral)' }} aria-hidden="true" />
                    <span>Watch Official Trailer</span>
                  </button>
                )}

                {movie.isNowShowing ? (
                  <a
                    href="#showtimes-section"
                    className="btn btn-cinema-primary py-2 px-4 fw-bold"
                    aria-label="Jump to available showtimes and select seats"
                  >
                    <Ticket size={18} aria-hidden="true" />
                    <span>View Available Showtimes</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="btn py-2 px-4 fw-bold text-white rounded-3 shadow-sm"
                    style={{ backgroundColor: 'var(--accent-blue)', border: 'none' }}
                    disabled
                  >
                    Coming Soon to Theatres
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes & Booking Section */}
      <section id="showtimes-section" aria-labelledby="showtimes-heading" className="container py-5">
        <div className="mb-4">
          <h2
            id="showtimes-heading"
            className="fw-black mb-1 d-flex align-items-center gap-2 fs-3"
            style={{ color: 'var(--text-heading)' }}
          >
            <Film style={{ color: 'var(--accent-coral)' }} size={26} aria-hidden="true" />
            {movie.isNowShowing ? 'Auditorium Showtimes & Venues' : 'Advance Screening Information'}
          </h2>
          <p className="text-muted small mb-4">
            {movie.isNowShowing
              ? 'Select your preferred calendar date, multiplex theatre, and auditorium screen format.'
              : 'This title is scheduled for upcoming release. Advance tickets and reservations will open closer to the premiere.'}
          </p>

          {movie.isNowShowing ? (
            <>
              {/* Date Selector */}
              <DateSelector
                selectedDate={selectedDate}
                onSelectDate={(newDate) => setSelectedDate(newDate)}
              />

              {/* Showtimes Grouped List */}
              <ShowtimeList
                showtimes={showtimes}
                loading={showtimesLoading}
                onSelectDateTomorrow={() => {
                  const tmrw = new Date();
                  tmrw.setDate(tmrw.getDate() + 1);
                  setSelectedDate(tmrw);
                }}
              />
            </>
          ) : (
            <div className="cinema-card p-5 text-center my-4 shadow-sm">
              <Clapperboard
                size={44}
                style={{ color: 'var(--accent-coral)' }}
                className="mb-3 mx-auto"
                aria-hidden="true"
              />
              <h4 className="fw-black mb-2" style={{ color: 'var(--text-heading)' }}>
                Advance Tickets Opening Soon
              </h4>
              <p
                className="small mb-4"
                style={{ maxWidth: '440px', margin: '0 auto', color: 'var(--text-muted)' }}
              >
                "{movie.title}" is scheduled to release on{' '}
                <strong>
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
                . Check back soon for ticket presales and premiere showtimes!
              </p>
              <Link to="/?status=now_showing" className="btn btn-cinema-primary">
                Explore Now Showing Movies
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trailer Modal */}
      {trailerOpen && (
        <TrailerModal
          youtubeId={movie.trailerYoutubeId}
          title={movie.title}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </div>
  );
};

export default MovieDetailsPage;
