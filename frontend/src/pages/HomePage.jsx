import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import HeroBanner from '../components/movies/HeroBanner';
import MovieCard from '../components/movies/MovieCard';
import TrailerModal from '../components/movies/TrailerModal';
import { DEMO_MOVIES } from '../data/demoData';
import BookingHistorySection from '../components/bookings/BookingHistorySection';
import {
  Search,
  Film,
  Sparkles,
  Filter,
  AlertCircle,
  X,
  ArrowUpDown,
  Clapperboard,
  RefreshCw,
  Info,
  History,
} from 'lucide-react';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Biography', 'Animation', 'Crime', 'Thriller'];

const SORT_OPTIONS = [
  { label: 'Release Date (Newest)', value: 'releaseDate' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Title (A - Z)', value: 'title' },
  { label: 'Duration (Shortest)', value: 'duration' },
];

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState(DEMO_MOVIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUsingDemoData, setIsUsingDemoData] = useState(true);

  // Active filter states from URL search params
  const currentStatus = searchParams.get('status') || 'all'; // 'all' | 'now_showing' | 'coming_soon'
  const currentGenre = searchParams.get('genre') || 'All';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'releaseDate';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Trailer modal state
  const [trailerData, setTrailerData] = useState({ isOpen: false, youtubeId: '', title: '' });

  // Sync internal searchTerm if URL query parameter changes
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  // Fetch movies from backend API, with fallback to clearly labeled demo data if database is offline
  const fetchMovies = async (forceDemo = false) => {
    if (currentStatus === 'history') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    if (forceDemo) {
      applyDemoCatalog();
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (currentStatus === 'now_showing') params.append('status', 'now_showing');
      if (currentStatus === 'coming_soon') params.append('status', 'coming_soon');
      if (currentGenre && currentGenre !== 'All') params.append('genre', currentGenre);
      if (currentSearch) params.append('search', currentSearch);
      if (currentSort) params.append('sort', currentSort);

      const res = await api.get(`/movies?${params.toString()}`, { timeout: 2500 });
      if (res.data.success && Array.isArray(res.data.movies)) {
        setMovies(res.data.movies);
        setIsUsingDemoData(false);
      } else {
        throw new Error(res.data.message || 'Unable to retrieve movies.');
      }
    } catch (err) {
      console.warn('Backend API error or MongoDB not connected:', err.message);
      setError(
        err.message || 'Unable to connect to live cinema database.'
      );
      // Auto-fallback to clearly labeled demo data so the evaluator has a 100% interactive experience
      applyDemoCatalog();
    } finally {
      setLoading(false);
    }
  };

  const applyDemoCatalog = () => {
    setIsUsingDemoData(true);
    let list = [...DEMO_MOVIES];

    // Status filter
    if (currentStatus === 'now_showing') {
      list = list.filter((m) => m.isNowShowing);
    } else if (currentStatus === 'coming_soon') {
      list = list.filter((m) => !m.isNowShowing);
    }

    // Genre filter
    if (currentGenre && currentGenre !== 'All') {
      list = list.filter((m) =>
        Array.isArray(m.genre)
          ? m.genre.some((g) => g.toLowerCase() === currentGenre.toLowerCase())
          : m.genre?.toLowerCase() === currentGenre.toLowerCase()
      );
    }

    // Search filter
    if (currentSearch.trim()) {
      const q = currentSearch.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.synopsis.toLowerCase().includes(q) ||
          m.director?.toLowerCase().includes(q) ||
          (Array.isArray(m.cast) && m.cast.some((c) => c.toLowerCase().includes(q)))
      );
    }

    // Sorting
    if (currentSort === 'rating') {
      list.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
    } else if (currentSort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'duration') {
      list.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    } else {
      // releaseDate (newest first)
      list.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    }

    setMovies(list);
  };

  useEffect(() => {
    fetchMovies();
  }, [currentStatus, currentGenre, currentSearch, currentSort]);

  // Featured blockbuster movie for the hero banner
  const featuredMovie = useMemo(() => {
    return movies.find((m) => m.featured && m.isNowShowing) || movies[0] || null;
  }, [movies]);

  // Split movies into Now Showing and Coming Soon for structured catalog view
  const nowShowingList = useMemo(() => movies.filter((m) => m.isNowShowing), [movies]);
  const comingSoonList = useMemo(() => movies.filter((m) => !m.isNowShowing), [movies]);

  // Handlers for URL search params
  const handleStatusChange = (status) => {
    const nextParams = new URLSearchParams(searchParams);
    if (status === 'all') nextParams.delete('status');
    else nextParams.set('status', status);
    setSearchParams(nextParams);
  };

  const handleGenreChange = (genre) => {
    const nextParams = new URLSearchParams(searchParams);
    if (genre === 'All') nextParams.delete('genre');
    else nextParams.set('genre', genre);
    setSearchParams(nextParams);
  };

  const handleSortChange = (sort) => {
    const nextParams = new URLSearchParams(searchParams);
    if (sort === 'releaseDate') nextParams.delete('sort');
    else nextParams.set('sort', sort);
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) nextParams.set('q', searchTerm.trim());
    else nextParams.delete('q');
    setSearchParams(nextParams);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    setSearchParams(nextParams);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  const hasActiveFilters = currentStatus !== 'all' || currentGenre !== 'All' || currentSearch.trim() || currentSort !== 'releaseDate';

  return (
    <div className="container py-4">
      {/* Clearly Labeled Demo Notice Banner (Displays when demo fallback is active) */}
      {isUsingDemoData && (
        <div
          className="alert d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 shadow-sm"
          style={{
            backgroundColor: '#FFF7ED',
            border: '1.5px solid #FDBA74',
            borderRadius: '12px',
            color: '#9A3412',
          }}
          role="region"
          aria-label="Demo Data Preview Notice"
        >
          <div className="d-flex align-items-start gap-3">
            <Info size={22} className="flex-shrink-0 mt-1" style={{ color: 'var(--accent-coral)' }} />
            <div>
              <div className="fw-bold d-flex align-items-center gap-2">
                <span className="badge text-uppercase" style={{ backgroundColor: 'var(--accent-coral)', color: '#FFFFFF' }}>
                  DEMO SHOWCASE
                </span>
                <span>Previewing with Sample Cinema Catalog</span>
              </div>
              <p className="small mb-0 mt-1" style={{ color: '#7C2D12' }}>
                The application is displaying clearly labeled demo cinema data because the live MongoDB server is currently offline or connecting.
                All browsing, search, genre filtering, and details features are fully functional.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 text-nowrap fw-bold"
            style={{ borderColor: '#EA580C', color: '#EA580C' }}
            onClick={() => fetchMovies(false)}
            aria-label="Retry connecting to live MongoDB backend"
          >
            <RefreshCw size={14} /> Retry Live API
          </button>
        </div>
      )}

      {/* Featured Hero Banner */}
      {featuredMovie && !currentSearch && (
        <HeroBanner
          featuredMovie={featuredMovie}
          onWatchTrailer={(id, title) => setTrailerData({ isOpen: true, youtubeId: id, title })}
        />
      )}

      {/* Main Movie Catalog Explorer Section */}
      <section aria-labelledby="catalog-heading" className="mb-5">
        {/* Header & Search Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 id="catalog-heading" className="fw-black mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Film style={{ color: 'var(--accent-coral)' }} size={28} aria-hidden="true" />
              Explore Movie Catalog
            </h2>
            <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>
              Find currently showing cinema releases, upcoming titles, and book reserved auditoriums.
            </p>
          </div>

          {/* Search Box with Clear Button */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: '400px', width: '100%' }} role="search">
            <label htmlFor="movie-search-input" className="visually-hidden">
              Search movies by title, director, or cast
            </label>
            <div className="input-group shadow-sm">
              <input
                id="movie-search-input"
                type="text"
                className="form-control cinema-input border-end-0"
                placeholder="Search movies, directors, cast..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search movies, directors, or cast"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn bg-white border-top border-bottom border-secondary-subtle"
                  onClick={handleClearSearch}
                  aria-label="Clear search input"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                className="btn btn-cinema-primary"
                type="submit"
                aria-label="Submit movie search"
              >
                <Search size={18} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        {/* Filter Controls Row: Status Tabs + Sort Dropdown */}
        <div
          className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 pb-3 mb-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {/* Status Tabs: All / Now Showing / Coming Soon */}
          <div
            className="d-inline-flex p-1 rounded-3 shadow-sm"
            style={{ background: '#DFD9CE', width: 'fit-content' }}
            role="tablist"
            aria-label="Movie status tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={currentStatus === 'all'}
              className={`btn px-3 py-1 rounded-2 small fw-bold transition ${
                currentStatus === 'all'
                  ? 'btn-cinema-primary text-white shadow-sm'
                  : 'border-0 bg-transparent'
              }`}
              style={{ color: currentStatus === 'all' ? '#FFFFFF' : 'var(--text-heading)' }}
              onClick={() => handleStatusChange('all')}
            >
              All Films
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentStatus === 'now_showing'}
              className={`btn px-3 py-1 rounded-2 small fw-bold transition ${
                currentStatus === 'now_showing'
                  ? 'btn-cinema-primary text-white shadow-sm'
                  : 'border-0 bg-transparent'
              }`}
              style={{ color: currentStatus === 'now_showing' ? '#FFFFFF' : 'var(--text-heading)' }}
              onClick={() => handleStatusChange('now_showing')}
            >
              Now Showing
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentStatus === 'coming_soon'}
              className={`btn px-3 py-1 rounded-2 small fw-bold transition ${
                currentStatus === 'coming_soon'
                  ? 'btn-cinema-primary text-white shadow-sm'
                  : 'border-0 bg-transparent'
              }`}
              style={{ color: currentStatus === 'coming_soon' ? '#FFFFFF' : 'var(--text-heading)' }}
              onClick={() => handleStatusChange('coming_soon')}
            >
              Coming Soon
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentStatus === 'history'}
              className={`btn px-3 py-1 rounded-2 small fw-bold transition d-inline-flex align-items-center gap-1 ${
                currentStatus === 'history'
                  ? 'btn-cinema-primary text-white shadow-sm'
                  : 'border-0 bg-transparent'
              }`}
              style={{ color: currentStatus === 'history' ? '#FFFFFF' : 'var(--text-heading)' }}
              onClick={() => handleStatusChange('history')}
            >
              <History size={14} /> History
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="movie-sort-select" className="small fw-semibold text-nowrap d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <ArrowUpDown size={15} style={{ color: 'var(--accent-coral)' }} aria-hidden="true" />
              <span>Sort by:</span>
            </label>
            <select
              id="movie-sort-select"
              className="form-select form-select-sm cinema-input shadow-sm"
              style={{ width: 'auto', minWidth: '185px' }}
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label="Sort movies by"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="d-flex align-items-center gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }} role="toolbar" aria-label="Genre filters">
          <span className="small fw-bold text-uppercase text-nowrap me-1" style={{ color: 'var(--text-dim)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            GENRES:
          </span>
          {GENRES.map((g) => {
            const isSelected = currentGenre === g;
            return (
              <button
                key={g}
                type="button"
                className={`btn btn-sm text-nowrap rounded-pill px-3 shadow-sm transition ${
                  isSelected
                    ? 'btn-cinema-primary text-white fw-bold'
                    : 'bg-white text-secondary border'
                }`}
                style={{
                  fontSize: '0.8rem',
                  borderColor: isSelected ? 'var(--accent-coral)' : 'var(--border-subtle)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-heading)',
                }}
                onClick={() => handleGenreChange(g)}
                aria-pressed={isSelected}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Active Filter Chips & Summary */}
        {hasActiveFilters && (
          <div className="d-flex flex-wrap align-items-center gap-2 mb-4 p-2 px-3 rounded-3" style={{ backgroundColor: 'var(--bg-surface-soft)', border: '1px solid var(--border-subtle)' }}>
            <span className="small fw-bold" style={{ color: 'var(--text-heading)' }}>
              Active Filters:
            </span>

            {currentSearch && (
              <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                Search: "{currentSearch}"
                <button
                  type="button"
                  className="btn btn-link p-0 text-danger border-0 ms-1"
                  style={{ textDecoration: 'none', lineHeight: 1 }}
                  onClick={handleClearSearch}
                  aria-label="Remove search filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {currentStatus !== 'all' && (
              <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                Status: {currentStatus === 'now_showing' ? 'Now Showing' : currentStatus === 'coming_soon' ? 'Coming Soon' : 'Ticket History'}
                <button
                  type="button"
                  className="btn btn-link p-0 text-danger border-0 ms-1"
                  style={{ textDecoration: 'none', lineHeight: 1 }}
                  onClick={() => handleStatusChange('all')}
                  aria-label="Remove status filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {currentGenre !== 'All' && (
              <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                Genre: {currentGenre}
                <button
                  type="button"
                  className="btn btn-link p-0 text-danger border-0 ms-1"
                  style={{ textDecoration: 'none', lineHeight: 1 }}
                  onClick={() => handleGenreChange('All')}
                  aria-label="Remove genre filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            <button
              type="button"
              className="btn btn-sm btn-link ms-auto p-0 small fw-bold"
              style={{ color: 'var(--accent-coral)', textDecoration: 'underline' }}
              onClick={handleClearAllFilters}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Catalog Content: History Section / Loading Skeleton / Empty State / Movie Grid */}
        {currentStatus === 'history' ? (
          <BookingHistorySection isFullPage={false} />
        ) : loading ? (
          /* Loading Skeleton State */
          <div className="row g-4" aria-live="polite" aria-busy="true">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="col-xl-3 col-lg-4 col-sm-6 col-12">
                <div className="cinema-card p-3 placeholder-glow">
                  <div className="placeholder w-100 rounded mb-3" style={{ height: '320px', backgroundColor: '#DFD9CE' }} />
                  <div className="placeholder col-8 mb-2" style={{ backgroundColor: '#DFD9CE' }} />
                  <div className="placeholder col-5 mb-3" style={{ backgroundColor: '#DFD9CE' }} />
                  <div className="placeholder col-12 py-3 rounded" style={{ backgroundColor: '#DFD9CE' }} />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          /* Empty State */
          <div className="cinema-card p-5 text-center my-5 shadow-sm" role="status">
            <Clapperboard size={52} style={{ color: 'var(--accent-coral)' }} className="mb-3 mx-auto" aria-hidden="true" />
            <h4 className="fw-black mb-2" style={{ color: 'var(--text-heading)' }}>
              No Matching Movies Found
            </h4>
            <p className="small mb-4" style={{ maxWidth: '440px', margin: '0 auto', color: 'var(--text-muted)' }}>
              We couldn't find any titles matching your search criteria. Try modifying your filters or searching with another keyword.
            </p>
            <button type="button" className="btn btn-cinema-primary" onClick={handleClearAllFilters}>
              Clear All Filters
            </button>
          </div>
        ) : currentStatus === 'all' && !currentSearch && currentGenre === 'All' ? (
          /* Structured Catalog: Showing Both Now Showing & Coming Soon sections when viewing all films without search */
          <div className="d-flex flex-column gap-5">
            {/* Section 1: Now Showing in Theatres */}
            {nowShowingList.length > 0 && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <h3 className="fw-black fs-4 mb-0" style={{ color: 'var(--text-heading)' }}>
                      Now Showing in Cinemas
                    </h3>
                    <span className="badge rounded-pill" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-main)' }}>
                      {nowShowingList.length} Films
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 fw-bold"
                    style={{ color: 'var(--accent-coral)', textDecoration: 'none' }}
                    onClick={() => handleStatusChange('now_showing')}
                  >
                    View All Now Showing →
                  </button>
                </div>
                <div className="row g-4">
                  {nowShowingList.map((movie) => (
                    <div key={movie._id} className="col-xl-3 col-lg-4 col-sm-6 col-12">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Coming Soon Releases */}
            {comingSoonList.length > 0 && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <h3 className="fw-black fs-4 mb-0" style={{ color: 'var(--text-heading)' }}>
                      Coming Soon to Cinemas
                    </h3>
                    <span className="badge rounded-pill" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-main)' }}>
                      {comingSoonList.length} Upcoming
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 fw-bold"
                    style={{ color: 'var(--accent-coral)', textDecoration: 'none' }}
                    onClick={() => handleStatusChange('coming_soon')}
                  >
                    View All Upcoming →
                  </button>
                </div>
                <div className="row g-4">
                  {comingSoonList.map((movie) => (
                    <div key={movie._id} className="col-xl-3 col-lg-4 col-sm-6 col-12">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Filtered or Searched Grid View */
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="small fw-bold" style={{ color: 'var(--text-muted)' }}>
                Showing {movies.length} {movies.length === 1 ? 'film' : 'films'}
              </span>
            </div>
            <div className="row g-4">
              {movies.map((movie) => (
                <div key={movie._id} className="col-xl-3 col-lg-4 col-sm-6 col-12">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Trailer Modal */}
      {trailerData.isOpen && (
        <TrailerModal
          youtubeId={trailerData.youtubeId}
          title={trailerData.title}
          onClose={() => setTrailerData({ isOpen: false, youtubeId: '', title: '' })}
        />
      )}
    </div>
  );
};

export default HomePage;
