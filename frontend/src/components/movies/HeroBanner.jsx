import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Star, Clock, Calendar, Film } from 'lucide-react';

const HeroBanner = ({ featuredMovie, onWatchTrailer }) => {
  if (!featuredMovie) return null;

  // Resolve initial image from featured movie data (prioritize posterUrl, fallback to backdropUrl)
  const initialImage = featuredMovie.posterUrl || featuredMovie.backdropUrl || '';
  const [displayImage, setDisplayImage] = useState(initialImage);
  const [imageError, setImageError] = useState(false);

  // Sync image source whenever featuredMovie changes
  useEffect(() => {
    setDisplayImage(featuredMovie.posterUrl || featuredMovie.backdropUrl || '');
    setImageError(false);
  }, [featuredMovie?.posterUrl, featuredMovie?.backdropUrl, featuredMovie?._id]);

  // Graceful fallback handler: if posterUrl fails, attempt backdropUrl before displaying icon fallback
  const handleImageError = () => {
    if (displayImage === featuredMovie.posterUrl && featuredMovie.backdropUrl) {
      setDisplayImage(featuredMovie.backdropUrl);
    } else {
      setImageError(true);
    }
  };

  return (
    <div
      className="position-relative rounded-4 overflow-hidden mb-5 cinema-card border-0 shadow-lg"
      style={{
        backgroundColor: '#153C5B',
        minHeight: '460px',
      }}
    >
      <div className="row g-0 align-items-stretch position-relative h-100" style={{ minHeight: '460px' }}>
        {/* Mobile/Tablet Cropped Top Image Header (Visible only on < lg screens) */}
        {displayImage && !imageError && (
          <div className="col-12 d-lg-none position-relative overflow-hidden" style={{ height: '220px' }}>
            <img
              src={displayImage}
              alt={`Featured movie banner for ${featuredMovie.title}`}
              className="w-100 h-100"
              style={{
                objectFit: 'cover',
                objectPosition: 'center 25%',
              }}
              loading="eager"
            />
            {/* Subtle bottom fade into the blue content section */}
            <div
              className="position-absolute bottom-0 start-0 w-100 h-100 pointer-events-none"
              style={{
                background:
                  'linear-gradient(0deg, #153C5B 0%, rgba(21, 60, 91, 0.75) 45%, rgba(21, 60, 91, 0.1) 100%)',
              }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Left Column: Movie Information, Details & Action Buttons */}
        <div className="col-12 col-lg-7 d-flex flex-column justify-content-center p-4 p-md-5 position-relative z-2">
          {/* Category Badges */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span
              className="badge text-uppercase fw-bold px-3 py-1 text-white shadow-sm"
              style={{ fontSize: '0.75rem', letterSpacing: '0.05em', backgroundColor: 'var(--accent-coral)' }}
            >
              FEATURED BLOCKBUSTER
            </span>
            <span className="badge-rating d-inline-flex align-items-center gap-1 shadow-sm">
              <Star size={12} fill="currentColor" /> {featuredMovie.ratingScore?.toFixed(1) || '8.8'} / 10
            </span>
            <span className="badge-format">IMAX 3D & DOLBY</span>
            <span className="badge-age">{featuredMovie.ageRating || 'PG-13'}</span>
          </div>

          {/* Film Title */}
          <h1 className="display-4 fw-black text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
            {featuredMovie.title}
          </h1>

          {/* Meta details row: duration, genre, release year */}
          <div className="d-flex align-items-center gap-3 small mb-3 flex-wrap" style={{ color: '#BACCDA' }}>
            <span className="d-flex align-items-center gap-1 text-white">
              <Clock size={14} style={{ color: 'var(--accent-coral)' }} /> {featuredMovie.durationMinutes} mins
            </span>
            <span>•</span>
            <span className="fw-bold" style={{ color: '#FCD4C3' }}>
              {Array.isArray(featuredMovie.genre) ? featuredMovie.genre.join(', ') : featuredMovie.genre}
            </span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1">
              <Calendar size={14} /> {new Date(featuredMovie.releaseDate).getFullYear()}
            </span>
          </div>

          {/* Synopsis */}
          <p className="lead fs-6 mb-4" style={{ lineHeight: '1.65', maxWidth: '600px', color: '#EAE6DE' }}>
            {featuredMovie.synopsis}
          </p>

          {/* Action CTAs */}
          <div className="d-flex flex-wrap align-items-center gap-3">
            {featuredMovie.isNowShowing ? (
              <Link
                to={`/movies/${featuredMovie.slug || featuredMovie._id}`}
                className="btn btn-cinema-primary px-4 py-3 fw-bold"
                aria-label={`Book tickets now for featured blockbuster ${featuredMovie.title}`}
              >
                <Ticket size={18} aria-hidden="true" />
                <span>Book Tickets Now</span>
              </Link>
            ) : (
              <Link
                to={`/movies/${featuredMovie.slug || featuredMovie._id}`}
                className="btn btn-cinema-gold px-4 py-3 fw-bold"
                aria-label={`View preview for upcoming release ${featuredMovie.title}`}
              >
                <span>View Preview</span>
              </Link>
            )}

            {featuredMovie.trailerYoutubeId && (
              <button
                type="button"
                className="btn px-4 py-3 fw-bold text-white shadow-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: '10px',
                }}
                onClick={() => onWatchTrailer(featuredMovie.trailerYoutubeId, featuredMovie.title)}
                aria-label={`Watch official trailer for ${featuredMovie.title}`}
              >
                <Play size={18} style={{ color: 'var(--accent-coral)' }} aria-hidden="true" />
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Featured Movie Image with Natural Left-Edge Gradient Blend (Desktop) */}
        <div
          className="col-12 col-lg-5 position-relative d-none d-lg-flex flex-column overflow-hidden"
          style={{ minHeight: '460px' }}
        >
          {displayImage && !imageError ? (
            <div className="position-relative w-100 flex-grow-1 h-100" style={{ minHeight: '460px' }}>
              <img
                src={displayImage}
                alt={`Official featured artwork for ${featuredMovie.title}`}
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                }}
                onError={handleImageError}
                loading="eager"
                fetchPriority="high"
              />

              {/* Natural Left-Edge Gradient Blend: Deep Editorial Blue (#153C5B) seamlessly fades into the photo */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, #153C5B 0%, rgba(21, 60, 91, 0.78) 14%, rgba(21, 60, 91, 0.3) 38%, rgba(21, 60, 91, 0) 70%)',
                }}
                aria-hidden="true"
              />

              {/* Subtle top & bottom vignette for premium cinematic contrast */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(21, 60, 91, 0.25) 0%, transparent 15%, transparent 85%, rgba(21, 60, 91, 0.35) 100%)',
                }}
                aria-hidden="true"
              />
            </div>
          ) : (
            /* Graceful Fallback if image fails or is unavailable */
            <div
              className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(34, 97, 146, 0.45) 0%, rgba(21, 60, 91, 0.85) 100%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                minHeight: '460px',
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'rgba(239, 133, 87, 0.15)',
                  color: 'var(--accent-coral)',
                  border: '1px solid rgba(239, 133, 87, 0.3)',
                }}
              >
                <Film size={32} aria-hidden="true" />
              </div>
              <h3 className="h6 text-white fw-bold mb-1">{featuredMovie.title}</h3>
              <p className="small mb-0" style={{ color: '#BACCDA' }}>
                {Array.isArray(featuredMovie.genre) ? featuredMovie.genre.join(', ') : featuredMovie.genre}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
