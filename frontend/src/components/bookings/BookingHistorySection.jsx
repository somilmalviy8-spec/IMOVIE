import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';

const BookingHistorySection = ({ isFullPage = false }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'confirmed' | 'cancelled'
  const [cancellingId, setCancellingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const handleCopyRef = (ref, id) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this booking? Your seats will be released back to the public auditorium inventory.'
      )
    ) {
      return;
    }

    setCancellingId(bookingId);
    setError('');
    setSuccessMessage('');

    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setSuccessMessage('Booking cancelled successfully. Seats have been returned to public inventory.');
        fetchBookings();
      }
    } catch (err) {
      setError(err.message || 'Unable to cancel this booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const isCancellable = (booking) => {
    if (booking.status === 'cancelled') return false;
    const showTime = new Date(booking.showtime?.startTime).getTime();
    const twoHoursFromNow = Date.now() + 2 * 60 * 60 * 1000;
    return showTime > twoHoursFromNow;
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (statusFilter !== 'all') {
      if (b.status !== statusFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const movieMatch = b.movie?.title?.toLowerCase().includes(q);
      const refMatch = b.bookingReference?.toLowerCase().includes(q);
      const theatreMatch = b.theatre?.name?.toLowerCase().includes(q);
      return movieMatch || refMatch || theatreMatch;
    }

    return true;
  });

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // If Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className={`cinema-card p-5 text-center my-4 ${isFullPage ? 'py-5' : ''}`}>
        <div
          className="rounded-circle text-white mx-auto mb-3 d-flex align-items-center justify-content-center shadow"
          style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-coral)' }}
        >
          <Ticket size={32} />
        </div>
        <h3 className="fw-black mb-2" style={{ color: 'var(--text-heading)' }}>
          Ticket History & Past Bookings
        </h3>
        <p className="text-muted small mb-4" style={{ maxWidth: '440px', margin: '0 auto' }}>
          Please sign in to view your complete digital ticket archive, auditorium reservations, and demo payment receipts.
        </p>
        <button
          type="button"
          className="btn btn-cinema-primary px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
          onClick={() => openAuthModal('login')}
        >
          <LogIn size={18} /> Sign In to Access History
        </button>
      </div>
    );
  }

  return (
    <div className={isFullPage ? 'container py-4' : 'my-2'}>
      {/* Header & Metric Summary */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-black mb-0" style={{ color: 'var(--text-heading)' }}>
              Ticket Booking History
            </h3>
            <span className="badge bg-secondary font-monospace">
              {bookings.length} {bookings.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>
          <p className="text-muted small mb-0">
            Archive of all your reserved cinema screening tickets, seat assignments, and demo transactions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-cinema-outline d-inline-flex align-items-center gap-1 self-start"
          onClick={fetchBookings}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner-border spinner-border-sm' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      {bookings.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-sm-4">
            <div className="p-3 rounded-3 cinema-card border-start border-4 border-success">
              <span className="small text-muted d-block">Active Confirmed Tickets</span>
              <span className="fs-4 fw-black text-success">{confirmedCount}</span>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="p-3 rounded-3 cinema-card border-start border-4 border-primary">
              <span className="small text-muted d-block">Total Tickets Booked</span>
              <span className="fs-4 fw-black" style={{ color: 'var(--text-heading)' }}>
                {bookings.length}
              </span>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="p-3 rounded-3 cinema-card border-start border-4 border-warning">
              <span className="small text-muted d-block">Total Value (Demo Settled)</span>
              <span className="fs-4 fw-black" style={{ color: 'var(--accent-coral)' }}>
                {formatINR(totalSpent)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4 py-2">
          <CheckCircle2 size={18} className="text-success flex-shrink-0" />
          <div className="flex-grow-1 small">{successMessage}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 py-2">
          <AlertCircle size={18} className="text-danger flex-shrink-0" />
          <div className="flex-grow-1 small">{error}</div>
        </div>
      )}

      {/* Search & Filter Bar */}
      {bookings.length > 0 && (
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
          {/* Status Tabs */}
          <div className="d-flex gap-1 p-1 rounded-3 shadow-sm" style={{ background: '#DFD9CE', width: 'fit-content' }}>
            <button
              type="button"
              className={`btn btn-sm px-3 py-1 rounded-2 fw-semibold ${
                statusFilter === 'all' ? 'btn-cinema-primary text-white shadow-sm' : 'border-0 bg-transparent'
              }`}
              style={{ color: statusFilter === 'all' ? '#FFFFFF' : 'var(--text-heading)' }}
              onClick={() => setStatusFilter('all')}
            >
              All ({bookings.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm px-3 py-1 rounded-2 fw-semibold ${
                statusFilter === 'confirmed' ? 'btn-cinema-primary text-white shadow-sm' : 'border-0 bg-transparent'
              }`}
              style={{ color: statusFilter === 'confirmed' ? '#FFFFFF' : 'var(--text-heading)' }}
              onClick={() => setStatusFilter('confirmed')}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm px-3 py-1 rounded-2 fw-semibold ${
                statusFilter === 'cancelled' ? 'btn-cinema-primary text-white shadow-sm' : 'border-0 bg-transparent'
              }`}
              style={{ color: statusFilter === 'cancelled' ? '#FFFFFF' : 'var(--text-heading)' }}
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control form-control-sm border-start-0"
              placeholder="Search movie or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="py-5 text-center">
          <div className="spinner-border" role="status" style={{ color: 'var(--accent-coral)' }}>
            <span className="visually-hidden">Loading ticket history...</span>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <Ticket size={48} className="mb-3 mx-auto" style={{ color: 'var(--text-dim)' }} />
          <h5 className="fw-bold mb-2" style={{ color: 'var(--text-heading)' }}>
            {searchQuery || statusFilter !== 'all' ? 'No Matching Bookings Found' : 'No Booked Movie Tickets Yet'}
          </h5>
          <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search query or status filter to see other tickets.'
              : "You haven't reserved any cinema tickets yet. Explore Now Showing blockbusters and book your seats!"}
          </p>
          <Link to="/?status=now_showing" className="btn btn-cinema-primary">
            Browse Movies Now Showing
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map((b) => {
            const canCancel = isCancellable(b);
            const isCancelled = b.status === 'cancelled';
            const isCopied = copiedId === b._id;

            return (
              <div
                key={b._id}
                className={`cinema-card p-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 transition shadow-sm ${
                  isCancelled ? 'opacity-75' : ''
                }`}
                style={{
                  borderLeft: isCancelled
                    ? '4px solid #EF4444'
                    : '4px solid #10B981',
                }}
              >
                {/* Left: Movie Info */}
                <div className="d-flex gap-3 align-items-center">
                  <img
                    src={b.movie?.posterUrl}
                    alt={b.movie?.title}
                    className="rounded shadow-sm flex-shrink-0"
                    style={{ width: '75px', height: '110px', objectFit: 'cover' }}
                  />
                  <div>
                    {/* Status & Ref Header */}
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span
                        className={`badge ${
                          isCancelled ? 'bg-danger' : 'bg-success'
                        } text-uppercase fw-bold`}
                        style={{ fontSize: '0.68rem' }}
                      >
                        {b.status}
                      </span>

                      <div className="d-inline-flex align-items-center gap-1 font-monospace small bg-light px-2 py-0.5 rounded border">
                        <span className="text-muted">REF:</span>
                        <strong className="text-dark">{b.bookingReference}</strong>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          onClick={() => handleCopyRef(b.bookingReference, b._id)}
                          title="Copy reference"
                        >
                          {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>

                      {/* Payment Badge */}
                      <span
                        className="badge bg-warning-subtle text-dark border border-warning-subtle font-monospace d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.65rem' }}
                      >
                        <ShieldCheck size={12} className="text-success" />
                        {b.paymentDetails?.method ? b.paymentDetails.method.toUpperCase() : 'DEMO PAY'}
                        {b.paymentDetails?.maskedCardOrVpa && ` • ${b.paymentDetails.maskedCardOrVpa.slice(-8)}`}
                      </span>
                    </div>

                    <h5 className="fw-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                      {b.movie?.title}
                    </h5>

                    <div className="text-muted small d-flex flex-wrap align-items-center gap-2 mb-2">
                      <span className="d-flex align-items-center gap-1" style={{ color: 'var(--text-main)' }}>
                        <MapPin size={13} style={{ color: 'var(--accent-coral)' }} /> {b.theatre?.name}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1 fw-semibold" style={{ color: 'var(--text-heading)' }}>
                        <Calendar size={13} style={{ color: 'var(--accent-blue)' }} /> {b.showtime && formatDate(b.showtime.startTime)}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1 fw-semibold" style={{ color: 'var(--text-heading)' }}>
                        <Clock size={13} style={{ color: 'var(--accent-blue)' }} /> {b.showtime && formatTime(b.showtime.startTime)}
                      </span>
                      {b.showtime?.screenFormat && (
                        <>
                          <span>•</span>
                          <span className="badge-format" style={{ fontSize: '0.65rem' }}>
                            {b.showtime.screenFormat}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Seats List */}
                    <div className="d-flex flex-wrap align-items-center gap-1">
                      <span className="small me-1 fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>
                        Seats ({b.seats?.length}):
                      </span>
                      {b.seats?.map((s) => (
                        <span
                          key={`${s.row}-${s.number}`}
                          className="badge"
                          style={{
                            backgroundColor: 'var(--bg-surface-soft)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {s.row}{s.number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Price & Direct Actions */}
                <div className="d-flex flex-wrap align-items-center justify-content-between justify-content-lg-end gap-3 pt-3 pt-lg-0 border-top border-lg-0 w-100 w-lg-auto">
                  <div className="text-lg-end me-lg-3">
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Amount Settled</div>
                    <div className="fs-5 fw-black" style={{ color: 'var(--text-heading)' }}>
                      {formatINR(b.totalAmount)}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Link
                      to={`/booking-success/${b._id}`}
                      className="btn btn-sm btn-cinema-primary py-2 px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                    >
                      <Ticket size={15} /> View Digital Pass
                    </Link>

                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-2 px-3"
                        disabled={cancellingId === b._id}
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        {cancellingId === b._id ? (
                          <span className="spinner-border spinner-border-sm" role="status" />
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingHistorySection;
