import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/client';
import {
  CheckCircle2,
  Printer,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { formatINR } from '../utils/currency';

const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/${bookingId}`);
          if (res.data.success) {
            setBooking(res.data.booking);
          }
        } catch (err) {
          setError(err.message || 'Unable to retrieve ticket details.');
        } finally {
          setLoading(false);
        }
      };

      fetchBooking();
    }
  }, [bookingId, booking]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    if (booking?.bookingReference) {
      navigator.clipboard.writeText(booking.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="cinema-card p-5 d-inline-block text-center" style={{ maxWidth: 500 }}>
          <h4 className="fw-bold text-white mb-2">Ticket Not Found</h4>
          <p className="text-muted small mb-4">{error || 'This booking could not be loaded.'}</p>
          <Link to="/" className="btn btn-cinema-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container py-5">
      {/* Success Heading */}
      <div className="text-center mb-5 no-print">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle text-white mb-3 shadow"
          style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-coral)' }}
        >
          <CheckCircle2 size={38} />
        </div>
        <h2 className="display-6 fw-black mb-1" style={{ color: 'var(--text-heading)' }}>Booking Confirmed!</h2>
        <p className="text-muted small" style={{ maxWidth: '480px', margin: '0 auto' }}>
          Your cinema seats have been officially reserved. Present your digital ticket code or QR upon entry to the theatre.
        </p>
      </div>

      {/* Printable Cinema Ticket Stub */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div
            className="cinema-card ticket-print-card p-4 p-md-5 position-relative overflow-hidden shadow-lg mb-4"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--border-subtle)',
              borderRadius: '20px',
            }}
          >
            {/* Top Bar with Cinema Brand & Booking Reference */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-4 border-bottom mb-4 gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <span className="badge text-uppercase fw-bold px-3 py-1 mb-1" style={{ backgroundColor: 'var(--accent-coral)', color: '#FFFFFF' }}>
                  OFFICIAL CINEMA PASS
                </span>
                <h4 className="fw-black mb-0 tracking-tight" style={{ color: 'var(--text-heading)' }}>THE IMOVIES</h4>
              </div>

              <div className="text-sm-end">
                <span className="small d-block" style={{ color: 'var(--text-dim)' }}>Booking Reference:</span>
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-5 fw-black font-monospace" style={{ color: 'var(--accent-coral)' }}>
                    {booking.bookingReference}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 no-print fw-semibold"
                    style={{ color: 'var(--text-heading)' }}
                    onClick={handleCopyRef}
                    title="Copy booking reference"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Body: Poster + Details */}
            <div className="row g-4 align-items-center mb-4">
              <div className="col-sm-4 text-center">
                <img
                  src={booking.movie?.posterUrl}
                  alt={booking.movie?.title}
                  className="rounded-3 shadow-sm w-100"
                  style={{ maxHeight: '220px', objectFit: 'cover' }}
                />
              </div>

              <div className="col-sm-8">
                <h3 className="fw-bold mb-2" style={{ color: 'var(--text-heading)' }}>{booking.movie?.title}</h3>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge-format">{booking.showtime?.screenFormat || 'Standard 2D'}</span>
                  <span className="badge-age">{booking.movie?.ageRating || 'PG-13'}</span>
                  <span className="text-muted small">{booking.movie?.durationMinutes} mins</span>
                </div>

                <div className="text-muted small d-flex flex-column gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-main)' }}>
                    <MapPin size={16} className="flex-shrink-0" style={{ color: 'var(--accent-coral)' }} />
                    <span className="fw-semibold">{booking.theatre?.name} • {booking.showtime?.screenName}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 fw-semibold" style={{ color: 'var(--text-heading)' }}>
                    <Calendar size={16} className="flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
                    <span>{booking.showtime && formatDate(booking.showtime.startTime)}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--text-heading)' }}>
                    <Clock size={16} className="flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
                    <span>{booking.showtime && formatTime(booking.showtime.startTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seats Banner */}
            <div className="p-3 rounded-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3" style={{ backgroundColor: 'var(--bg-surface-soft)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="small d-block fw-semibold" style={{ color: 'var(--text-muted)' }}>Reserved Seats ({booking.seats?.length}):</span>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {booking.seats?.map((s) => (
                    <span key={`${s.row}-${s.number}`} className="badge fw-bold fs-6 px-2 py-1" style={{ backgroundColor: 'var(--accent-coral)', color: '#FFFFFF' }}>
                      {s.row}{s.number}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm-end">
                <span className="small d-block" style={{ color: 'var(--text-dim)' }}>Confirmed Total:</span>
                <span className="fs-4 fw-black" style={{ color: 'var(--text-heading)' }}>{formatINR(booking.totalAmount)}</span>
              </div>
            </div>

            {/* Bottom Section: QR Representation + Security Stub */}
            <div className="pt-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
              {/* Visual QR Code Mockup */}
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-white p-2 rounded-2 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '80px', height: '80px', border: '1.5px solid var(--border-subtle)' }}
                >
                  <QrCode size={64} style={{ color: 'var(--text-main)' }} />
                </div>
                <div className="small">
                  <span className="fw-bold d-block" style={{ color: 'var(--text-heading)' }}>Scan at Turnstile</span>
                  <span className="small" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    Digital Token: {booking.bookingReference}
                  </span>
                </div>
              </div>

              <div className="small text-center text-sm-end" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <div>Verified & Authorized by The IMovies Cinema</div>
                <div>Status: <span className="text-success fw-bold text-uppercase">{booking.status}</span></div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Hidden on Print) */}
          <div className="d-flex flex-wrap justify-content-center gap-3 no-print">
            <button
              type="button"
              className="btn btn-cinema-primary py-2 px-4 fw-bold"
              onClick={handlePrint}
            >
              <Printer size={18} /> Print / Save Ticket
            </button>

            <Link
              to="/profile?tab=bookings"
              className="btn btn-cinema-outline py-2 px-4"
            >
              <Ticket size={18} /> View All Bookings
            </Link>

            <Link
              to="/"
              className="btn btn-cinema-gold py-2 px-4"
            >
              Discover More Films <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
