import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, ArrowRight, Eye } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const formatDuration = (mins) => {
    if (!mins) return 'N/A';
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`;
  };

  const movieDetailPath = `/movies/${movie.slug || movie._id}`;

  return (
    <article
      className="cinema-card h-100 d-flex flex-column position-relative group"
      aria-labelledby={`movie-title-${movie._id}`}
    >
      {/* Poster Image Container */}
      <div className="position-relative overflow-hidden" style={{ paddingTop: '142%' }}>
        <Link
          to={movieDetailPath}
          tabIndex={-1}
          aria-hidden="true"
          className="d-block position-absolute top-0 start-0 w-100 h-100"
        >
          <img
            src={movie.posterUrl}
            alt={`Promotional poster for ${movie.title}`}
            className="w-100 h-100"
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            loading="lazy"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </Link>

        {/* Overlay gradient for high contrast rating & age tags */}
        <div
          className="position-absolute bottom-0 start-0 w-100 p-3 d-flex justify-content-between align-items-end pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(21,60,91,0.92) 0%, rgba(21,60,91,0) 100%)',
          }}
        >
          <span className="badge-rating d-inline-flex align-items-center gap-1 shadow-sm" aria-label={`Rating ${movie.ratingScore || 8.5} out of 10`}>
            <Star size={12} fill="currentColor" aria-hidden="true" />
            <span>{movie.ratingScore ? movie.ratingScore.toFixed(1) : '8.5'}</span>
          </span>
          <span className="badge-age" aria-label={`Content classification ${movie.ageRating || 'PG-13'}`}>
            {movie.ageRating || 'PG-13'}
          </span>
        </div>

        {/* Coming Soon Ribbon */}
        {!movie.isNowShowing && (
          <div className="position-absolute top-0 end-0 m-2">
            <span
              className="badge fw-bold text-uppercase shadow-sm text-white"
              style={{
                fontSize: '0.65rem',
                backgroundColor: 'var(--accent-blue)',
                letterSpacing: '0.04em',
              }}
            >
              COMING SOON
            </span>
          </div>
        )}
      </div>

      {/* Card Content Surface (Clean White for optimal contrast & legibility) */}
      <div className="p-3 d-flex flex-column flex-grow-1" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={12} aria-hidden="true" /> {formatDuration(movie.durationMinutes)}
          </span>
          <span className="small text-secondary" aria-hidden="true">•</span>
          <span className="small text-truncate fw-bold" style={{ fontSize: '0.75rem', color: 'var(--accent-coral)' }}>
            {Array.isArray(movie.genre) ? movie.genre.slice(0, 2).join(' / ') : movie.genre}
          </span>
        </div>

        <h3 className="h6 fw-bold mb-2 text-truncate" id={`movie-title-${movie._id}`}>
          <Link
            to={movieDetailPath}
            className="text-decoration-none"
            style={{ color: 'var(--text-heading)' }}
            title={movie.title}
          >
            {movie.title}
          </Link>
        </h3>

        <p
          className="small text-truncate-2 flex-grow-1 mb-3"
          style={{
            fontSize: '0.8rem',
            minHeight: '2.4rem',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {movie.synopsis}
        </p>

        {movie.isNowShowing ? (
          <Link
            to={movieDetailPath}
            className="btn btn-cinema-primary w-100 py-2 small fw-bold mt-auto"
            aria-label={`Book tickets for ${movie.title}`}
          >
            <Ticket size={16} aria-hidden="true" />
            <span>Book Tickets</span>
          </Link>
        ) : (
          <Link
            to={movieDetailPath}
            className="btn btn-cinema-outline w-100 py-2 small fw-semibold mt-auto"
            aria-label={`View details for upcoming release ${movie.title}`}
          >
            <Eye size={16} aria-hidden="true" />
            <span>View Details</span>
          </Link>
        )}
      </div>
    </article>
  );
};

export default MovieCard;
