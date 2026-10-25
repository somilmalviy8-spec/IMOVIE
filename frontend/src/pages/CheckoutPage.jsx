import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Info,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/currency';

const CheckoutPage = () => {
  const { showtimeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const passedState = location.state || {};
  const [showtime, setShowtime] = useState(passedState.showtime || null);
  const [selectedSeats, setSelectedSeats] = useState(passedState.selectedSeats || []);
  const [heldUntil, setHeldUntil] = useState(passedState.heldUntil || null);

  const [loadingShowtime, setLoadingShowtime] = useState(!passedState.showtime);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Remaining hold time in seconds
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 mins default

  // If page was loaded directly without navigation state, fetch showtime
  useEffect(() => {
    if (!showtime) {
      const fetchShowtime = async () => {
        try {
          const res = await api.get(`/showtimes/${showtimeId}/seats`);
          if (res.data.success) {
            setShowtime(res.data.showtime);
            // Grab any seats held by current user
            const myHeld = res.data.seats.filter((s) => s.isMyHold);
            if (myHeld.length > 0) {
              setSelectedSeats(myHeld);
              if (myHeld[0].heldUntil) {
                setHeldUntil(myHeld[0].heldUntil);
              }
            } else {
              setError('No active seat hold found. Please select your seats again.');
            }
          }
        } catch (err) {
          setError(err.message || 'Failed to load showtime.');
        } finally {
          setLoadingShowtime(false);
        }
      };

      fetchShowtime();
    }
  }, [showtimeId, showtime]);

  // Live countdown timer for the seat hold
  useEffect(() => {
    if (!heldUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(heldUntil).getTime();
      const diffSecs = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeftSeconds(diffSecs);

      if (diffSecs <= 0) {
        clearInterval(interval);
        setError('Your 10-minute seat hold has expired. Please return to seat selection.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [heldUntil]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // Confirm Booking Action (Direct confirmation, NO payment forms)
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      setError('No seats selected.');
      return;
    }
    if (timeLeftSeconds <= 0) {
      setError('Your seat hold has expired. Please select seats again.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/bookings', {
        showtimeId,
        seats: selectedSeats.map((s) => ({ row: s.row, number: s.number })),
      });

      if (res.data.success && res.data.booking) {
        // Successfully booked! Navigate to confirmation page
        navigate(`/booking-success/${res.data.booking._id}`, {
          state: { booking: res.data.booking },
        });
      }
    } catch (err) {
      setError(err.message || 'Booking confirmation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingShowtime) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading checkout...</span>
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
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <Link
          to={`/seat-selection/${showtimeId}`}
          className="btn btn-sm btn-cinema-outline mb-3"
        >
          <ChevronLeft size={16} /> Back to Seat Selection
        </Link>
        <h2 className="fw-black mb-1" style={{ color: 'var(--text-heading)' }}>Review & Confirm Booking</h2>
        <p className="text-muted small">
          Please review your screening details and seat selection before final confirmation.
        </p>
      </div>

      {/* Seat Hold Countdown Banner */}
      <div
        className={`alert ${
          timeLeftSeconds <= 120 ? 'alert-danger' : 'alert-warning'
        } d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4`}
      >
        <div className="d-flex align-items-center gap-2">
          <Clock size={20} className="flex-shrink-0" />
          <div>
            <strong>Temporary Seat Hold Active:</strong> Seats will be reserved for you for{' '}
            <span className="fw-black fs-6">{formatCountdown(timeLeftSeconds)}</span>.
          </div>
        </div>
        <span className="small text-muted">
          Auto-releases upon expiry
        </span>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div className="flex-grow-1">{error}</div>
          {timeLeftSeconds <= 0 && (
            <Link to={`/seat-selection/${showtimeId}`} className="btn btn-sm btn-danger ms-auto">
              Reselect Seats
            </Link>
          )}
        </div>
      )}

      <div className="row g-4">
        {/* Left: Order Summary & Film Info */}
        <div className="col-lg-7">
          <div className="cinema-card p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Ticket size={20} style={{ color: 'var(--accent-coral)' }} />
              Screening Summary
            </h5>

            <div className="d-flex gap-3 pb-3 border-bottom mb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <img
                src={showtime?.movie?.posterUrl}
                alt={showtime?.movie?.title}
                className="rounded-3 shadow-sm"
                style={{ width: '80px', height: '115px', objectFit: 'cover' }}
              />
              <div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--text-heading)' }}>{showtime?.movie?.title}</h5>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="badge-format">{showtime?.screenFormat}</span>
                  <span className="badge-age">{showtime?.movie?.ageRating || 'PG-13'}</span>
                  <span className="text-muted small">{showtime?.movie?.durationMinutes} mins</span>
                </div>
                <div className="text-muted small d-flex align-items-center gap-1">
                  <MapPin size={14} style={{ color: 'var(--accent-coral)' }} />
                  {showtime?.theatre?.name} ({showtime?.theatre?.city})
                </div>
              </div>
            </div>

            {/* Date & Time details */}
            <div className="row g-3 small text-muted mb-3">
              <div className="col-sm-6">
                <span className="d-block small" style={{ color: 'var(--text-dim)' }}>Screening Date:</span>
                <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>
                  {showtime && formatDate(showtime.startTime)}
                </span>
              </div>
              <div className="col-sm-6">
                <span className="d-block small" style={{ color: 'var(--text-dim)' }}>Showtime & Screen:</span>
                <span className="fw-bold" style={{ color: 'var(--text-heading)' }}>
                  {showtime && formatTime(showtime.startTime)} • {showtime?.screenName}
                </span>
              </div>
            </div>

            {/* Selected Seats Chips */}
            <div className="pt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="d-block small mb-2" style={{ color: 'var(--text-dim)' }}>Selected Seats ({selectedSeats.length}):</span>
              <div className="d-flex flex-wrap gap-2">
                {selectedSeats.map((s) => (
                  <div
                    key={`${s.row}-${s.number}`}
                    className="p-2 rounded-2 small d-flex align-items-center gap-2"
                    style={{
                      backgroundColor: 'var(--bg-surface-soft)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <span className="fw-black" style={{ color: 'var(--text-heading)' }}>
                      Row {s.row} - Seat {s.number}
                    </span>
                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {s.tier}
                    </span>
                    <span className="text-muted">{formatINR(s.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="cinema-card p-4">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Customer Information</h5>
            <div className="row g-3 small">
              <div className="col-sm-6">
                <span className="d-block small" style={{ color: 'var(--text-dim)' }}>Full Name:</span>
                <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>{user?.name}</span>
              </div>
              <div className="col-sm-6">
                <span className="d-block small" style={{ color: 'var(--text-dim)' }}>Email Address:</span>
                <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Price Breakdown & Direct Confirmation Action */}
        <div className="col-lg-5">
          <div className="cinema-card p-4 position-sticky" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Order Total</h5>

            <div className="d-flex justify-content-between text-muted small mb-2">
              <span>Standard / Tiered Tickets ({selectedSeats.length})</span>
              <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>{formatINR(totalPrice)}</span>
            </div>

            <div className="d-flex justify-content-between text-muted small mb-2">
              <span>Convenience Booking Fee</span>
              <span className="text-success fw-semibold">WAIVED ({formatINR(0, { showDecimals: true })})</span>
            </div>

            <div className="d-flex justify-content-between text-muted small mb-3">
              <span>Auditorium Facility Surcharge</span>
              <span className="text-success fw-semibold">INCLUDED</span>
            </div>

            <div className="border-top pt-3 d-flex justify-content-between align-items-center mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="fs-5 fw-bold" style={{ color: 'var(--text-heading)' }}>Total Amount</span>
              <span className="fs-3 fw-black" style={{ color: 'var(--accent-coral)' }}>{formatINR(totalPrice)}</span>
            </div>

            {/* Explicit Out-of-Scope Payment Notice */}
            <div className="p-3 rounded-3 mb-4" style={{ background: 'var(--bg-surface-soft)', border: '1px solid var(--border-subtle)' }}>
              <div className="d-flex align-items-center gap-2 small fw-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                <Info size={16} style={{ color: 'var(--accent-coral)' }} /> Direct Confirmation (No Payment Required)
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                Payment processing is out of scope for this cinema platform. You will not be charged or asked for card details. Confirming will directly generate your verified digital ticket.
              </p>
            </div>

            {/* Terms checkbox */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="termsCheck"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label className="form-check-label text-muted small" htmlFor="termsCheck">
                I understand that cancellation is available up to 2 hours prior to the showtime start.
              </label>
            </div>

            {/* Confirm Booking Button */}
            <button
              type="button"
              className="btn btn-cinema-primary w-100 py-3 fs-6 fw-bold shadow"
              disabled={submitting || timeLeftSeconds <= 0 || !termsAccepted || selectedSeats.length === 0}
              onClick={handleConfirmBooking}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Validating & Confirming Tickets...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} /> Confirm Booking Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
