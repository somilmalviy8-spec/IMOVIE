import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/seats/SeatMap';
import { ChevronLeft, Clock, MapPin, Ticket, AlertCircle, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/currency';

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState('');

  // Fetch showtime details and seat map
  const fetchSeatMap = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/showtimes/${showtimeId}/seats`);
      if (res.data.success) {
        setShowtime(res.data.showtime);
        setSeats(res.data.seats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load auditorium seating.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatMap();
  }, [showtimeId]);

  // Handle seat click toggle
  const handleToggleSeat = (seat) => {
    setError('');
    const exists = selectedSeats.some(
      (s) => s.row === seat.row && s.number === seat.number
    );

    if (exists) {
      setSelectedSeats(selectedSeats.filter(
        (s) => !(s.row === seat.row && s.number === seat.number)
      ));
    } else {
      if (selectedSeats.length >= 8) {
        setError('Maximum 8 seats can be selected per booking.');
        return;
      }
      setSelectedSeats([
        ...selectedSeats,
        {
          row: seat.row,
          number: seat.number,
          tier: seat.tier,
          price: seat.price,
        },
      ]);
    }
  };

  // Calculate total price
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // Proceed to hold seats & checkout
  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat to proceed.');
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setHolding(true);
    setError('');
    try {
      const res = await api.post(`/showtimes/${showtimeId}/hold-seats`, {
        seats: selectedSeats.map((s) => ({ row: s.row, number: s.number })),
      });

      if (res.data.success) {
        // Seat hold acquired! Navigate to checkout
        navigate(`/checkout/${showtimeId}`, {
          state: {
            showtime,
            selectedSeats: res.data.heldSeats || selectedSeats,
            heldUntil: res.data.heldUntil,
            totalPrice,
          },
        });
      }
    } catch (err) {
      setError(err.message || 'Unable to hold seats. Someone may have just reserved them.');
      // Refresh seat map to reflect newest states
      fetchSeatMap();
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading auditorium layout...</span>
        </div>
        <p className="text-muted small mt-2">Connecting to cinema seat map...</p>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="cinema-card p-5 d-inline-block text-center" style={{ maxWidth: 500 }}>
          <AlertCircle size={48} className="text-danger mb-3" />
          <h4 className="fw-bold text-white mb-2">Showtime Unavailable</h4>
          <p className="text-muted small mb-4">{error || 'This screening is no longer active.'}</p>
          <Link to="/" className="btn btn-cinema-primary">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container py-4 pb-5">
      {/* Back button and Screening Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <button
            type="button"
            className="btn btn-sm btn-cinema-outline mb-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} /> Choose Another Showtime
          </button>
          <h3 className="fw-black mb-1" style={{ color: 'var(--text-heading)' }}>
            {showtime.movie?.title}
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-2 small" style={{ color: 'var(--text-muted)' }}>
            <span className="fw-semibold d-flex align-items-center gap-1" style={{ color: 'var(--text-main)' }}>
              <MapPin size={14} style={{ color: 'var(--accent-coral)' }} /> {showtime.theatre?.name}
            </span>
            <span>•</span>
            <span className="badge-format">{showtime.screenFormat}</span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1 fw-semibold" style={{ color: 'var(--text-heading)' }}>
              <Clock size={14} style={{ color: 'var(--accent-coral)' }} /> {formatDate(showtime.startTime)}, {formatTime(showtime.startTime)}
            </span>
          </div>
        </div>

        <div className="text-md-end">
          <span
            className="badge px-3 py-2 small"
            style={{
              backgroundColor: 'var(--bg-surface-soft)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Screen: <strong style={{ color: 'var(--text-heading)' }}>{showtime.screenName}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Visual Seat Map */}
      <div className="cinema-card p-3 p-md-4 mb-5">
        <SeatMap
          seats={seats}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
          tierPricing={showtime.tierPricing}
        />
      </div>

      {/* Floating / Sticky Bottom Summary Bar */}
      <div
        className="fixed-bottom cinema-glass py-3 shadow-lg"
        style={{ zIndex: 900, borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          {/* Selected Seat Count & Labels */}
          <div>
            <div className="small fw-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Selected Seats ({selectedSeats.length} / 8 max):
            </div>
            {selectedSeats.length === 0 ? (
              <span className="small fst-italic" style={{ color: 'var(--text-dim)' }}>Tap available seats on the map above</span>
            ) : (
              <div className="d-flex flex-wrap gap-1">
                {selectedSeats.map((s) => (
                  <span
                    key={`${s.row}-${s.number}`}
                    className="badge fw-bold"
                    style={{
                      backgroundColor: 'var(--accent-coral)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                    }}
                  >
                    {s.row}{s.number} ({formatINR(s.price)})
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Proceed Button */}
          <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-4">
            <div className="text-end">
              <div className="small" style={{ color: 'var(--text-muted)' }}>Total Ticket Price</div>
              <div className="fs-4 fw-black" style={{ color: 'var(--accent-coral)' }}>
                {formatINR(totalPrice)}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-cinema-primary py-2 px-4 fw-bold"
              disabled={selectedSeats.length === 0 || holding}
              onClick={handleProceedToCheckout}
            >
              {holding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Holding Seats...
                </>
              ) : (
                <>
                  <Ticket size={18} /> Proceed to Review & Pay
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
