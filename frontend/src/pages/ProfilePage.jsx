import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
} from 'lucide-react';
import { formatINR } from '../utils/currency';

const ProfilePage = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'bookings'; // 'bookings' | 'settings'

  // Booking history state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Account Settings Form state
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Fetch user bookings
  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingError('');
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to load booking history.');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update profile handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileSaving(true);

    try {
      await updateProfile({
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setProfileMessage('Profile settings updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile settings.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Cancel booking handler
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released back to the public.')) {
      return;
    }

    setCancellingId(bookingId);
    setBookingMessage('');
    setBookingError('');

    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setBookingMessage('Booking cancelled successfully. Seats have been returned to inventory.');
        fetchBookings();
      }
    } catch (err) {
      setBookingError(err.message || 'Unable to cancel this booking.');
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

  return (
    <div className="container py-5">
      {/* Profile Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-4 mb-4 border-bottom gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle text-white fw-black fs-3 d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-coral)' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="fw-black mb-0" style={{ color: 'var(--text-heading)' }}>{user?.name}</h2>
            <div className="text-muted small">{user?.email}</div>
            {isAdmin && (
              <span className="badge mt-1" style={{ backgroundColor: 'var(--text-heading)', color: '#FFFFFF', fontSize: '0.7rem' }}>
                <Shield size={12} className="me-1" /> ADMINISTRATOR
              </span>
            )}
          </div>
        </div>

        {isAdmin && (
          <Link to="/admin" className="btn btn-cinema-outline">
            <Shield size={16} style={{ color: 'var(--accent-coral)' }} /> Open Admin Portal
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          type="button"
          className="btn pb-2 px-3 fw-bold border-0 rounded-0"
          style={{
            color: activeTab === 'bookings' ? 'var(--accent-coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'bookings' ? '2.5px solid var(--accent-coral)' : 'none',
          }}
          onClick={() => setSearchParams({ tab: 'bookings' })}
        >
          <Ticket size={18} className="me-2" /> My Cinema Bookings ({bookings.length})
        </button>

        <button
          type="button"
          className="btn pb-2 px-3 fw-bold border-0 rounded-0"
          style={{
            color: activeTab === 'settings' ? 'var(--accent-coral)' : 'var(--text-muted)',
            borderBottom: activeTab === 'settings' ? '2.5px solid var(--accent-coral)' : 'none',
          }}
          onClick={() => setSearchParams({ tab: 'settings' })}
        >
          <User size={18} className="me-2" /> Account Settings
        </button>
      </div>

      {/* Tab 1: Bookings List */}
      {activeTab === 'bookings' && (
        <div>
          {bookingMessage && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
              <CheckCircle2 size={20} />
              <div>{bookingMessage}</div>
            </div>
          )}

          {bookingError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
              <AlertCircle size={20} />
              <div>{bookingError}</div>
            </div>
          )}

          {bookingsLoading ? (
            <div className="py-5 text-center">
              <div className="spinner-border" role="status" style={{ color: 'var(--accent-coral)' }}>
                <span className="visually-hidden">Loading bookings...</span>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="cinema-card p-5 text-center my-4">
              <Ticket size={48} className="mb-3 mx-auto" style={{ color: 'var(--text-dim)' }} />
              <h5 className="fw-bold mb-2" style={{ color: 'var(--text-heading)' }}>No Bookings Yet</h5>
              <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                You haven't reserved any cinema tickets yet. Explore current releases and select your seats today!
              </p>
              <Link to="/" className="btn btn-cinema-primary">
                Browse Movies
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bookings.map((b) => {
                const canCancel = isCancellable(b);
                const isCancelled = b.status === 'cancelled';

                return (
                  <div
                    key={b._id}
                    className={`cinema-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 ${
                      isCancelled ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="d-flex gap-3 align-items-center">
                      <img
                        src={b.movie?.posterUrl}
                        alt={b.movie?.title}
                        className="rounded shadow-sm"
                        style={{ width: '70px', height: '100px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            className={`badge ${
                              isCancelled ? 'bg-danger' : 'bg-success'
                            } text-uppercase fw-bold`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {b.status}
                          </span>
                          <span className="small text-muted font-monospace">
                            REF: {b.bookingReference}
                          </span>
                        </div>

                        <h5 className="fw-bold mb-1" style={{ color: 'var(--text-heading)' }}>{b.movie?.title}</h5>

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
                        </div>

                        <div className="d-flex flex-wrap gap-1">
                          <span className="small me-1 fw-semibold" style={{ color: 'var(--text-dim)' }}>Seats:</span>
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

                    {/* Actions */}
                    <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mt-md-0">
                      <div className="text-md-end me-md-3">
                        <div className="small" style={{ color: 'var(--text-dim)' }}>Total Paid</div>
                        <div className="fs-5 fw-black" style={{ color: 'var(--text-heading)' }}>{formatINR(b.totalAmount)}</div>
                      </div>

                      <Link
                        to={`/booking-success/${b._id}`}
                        className="btn btn-sm btn-cinema-outline py-2 px-3"
                      >
                        View Pass
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
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Account Settings */}
      {activeTab === 'settings' && (
        <div className="row">
          <div className="col-lg-6">
            <div className="cinema-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Update Profile Credentials</h5>

              {profileMessage && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                  <CheckCircle2 size={18} />
                  <div>{profileMessage}</div>
                </div>
              )}

              {profileError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={18} />
                  <div>{profileError}</div>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Full Name</label>
                  <input
                    type="text"
                    className="form-control cinema-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Email (Read Only)</label>
                  <input
                    type="email"
                    className="form-control cinema-input"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                  <div className="form-text small" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    Email is permanently bound to your cinema account and verified tickets.
                  </div>
                </div>

                <hr className="my-4" style={{ borderColor: 'var(--border-subtle)' }} />
                <h6 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Change Password (Optional)</h6>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>Current Password</label>
                  <input
                    type="password"
                    className="form-control cinema-input"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>New Password</label>
                  <input
                    type="password"
                    className="form-control cinema-input"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-cinema-primary py-2 px-4 fw-bold"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving Updates...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
