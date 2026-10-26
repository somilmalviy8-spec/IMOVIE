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
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  Sparkles,
  QrCode,
  Zap,
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import DemoPaymentModal from '../components/payment/DemoPaymentModal';

const PRESET_CARDS = [
  {
    name: 'Demo Visa Premium',
    number: '4532 0150 9920 9010',
    expiry: '08/29',
    cvv: '821',
    type: 'Visa',
    brand: 'visa',
  },
  {
    name: 'Demo Mastercard Platinum',
    number: '5412 7520 8821 8888',
    expiry: '12/28',
    cvv: '394',
    type: 'Mastercard',
    brand: 'mastercard',
  },
  {
    name: 'Demo RuPay Cinema Pass',
    number: '6071 8200 4410 1122',
    expiry: '05/30',
    cvv: '512',
    type: 'RuPay',
    brand: 'rupay',
  },
];

const NET_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra', code: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National', code: 'PNB' },
];

const WALLETS = [
  { id: 'paytm', name: 'Paytm Wallet', balance: 2500 },
  { id: 'phonepe', name: 'PhonePe Wallet', balance: 1800 },
  { id: 'amazonpay', name: 'Amazon Pay Balance', balance: 3200 },
];

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

  // Demo Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'wallet'
  const [cardNumber, setCardNumber] = useState('4532 0150 9920 9010');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Somil Malviy');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('821');

  // UPI State
  const [upiId, setUpiId] = useState(`${user?.email ? user.email.split('@')[0] : 'demo'}@okhdfcbank`);
  const [upiMode, setUpiMode] = useState('qr'); // 'qr' | 'id'

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Sync default cardholder name when user loads
  useEffect(() => {
    if (user?.name && cardHolder === 'Somil Malviy') {
      setCardHolder(user.name);
    }
  }, [user, cardHolder]);

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

  // Format Card Number with automatic space separation
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiration with MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Quick fill preset card
  const handleAutofillCard = (preset) => {
    setCardNumber(preset.number);
    setCardExpiry(preset.expiry);
    setCardCvv(preset.cvv);
  };

  // Prepare method metadata for modal
  const getMethodData = () => {
    switch (paymentMethod) {
      case 'upi':
        return {
          provider: upiMode === 'qr' ? 'UPI Dynamic QR (PhonePe/GPay)' : 'UPI Direct VPA',
          masked: upiMode === 'qr' ? 'Dynamic QR Code' : upiId,
        };
      case 'netbanking': {
        const bank = NET_BANKS.find((b) => b.id === selectedBank);
        return {
          provider: `${bank?.name || 'Demo Bank'} NetBanking`,
          masked: `Account ID: ••••${Math.floor(1000 + Math.random() * 9000)}`,
        };
      }
      case 'wallet': {
        const wallet = WALLETS.find((w) => w.id === selectedWallet);
        return {
          provider: wallet?.name || 'Digital Wallet',
          masked: `Linked: +91 98*** **421`,
        };
      }
      case 'card':
      default: {
        const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '9010';
        return {
          provider: cardNumber.startsWith('4') ? 'Visa Credit Card' : cardNumber.startsWith('5') ? 'Mastercard Debit' : 'RuPay Card',
          masked: `•••• •••• •••• ${last4}`,
        };
      }
    }
  };

  // Initiate Demo Payment Dialog
  const handleInitiatePayment = (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      setError('No seats selected.');
      return;
    }
    if (timeLeftSeconds <= 0) {
      setError('Your seat hold has expired. Please select seats again.');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setError('Please enter a valid 16-digit card number or use a demo preset.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setError('Please provide card expiry date (MM/YY).');
        return;
      }
    }

    if (paymentMethod === 'upi' && upiMode === 'id' && !upiId.includes('@')) {
      setError('Please provide a valid UPI ID (e.g. name@upi).');
      return;
    }

    setError('');
    setIsModalOpen(true);
  };

  // Final confirmation when DemoPaymentModal authorizes successfully
  const handlePaymentSuccess = async (paymentDetails) => {
    setIsModalOpen(false);
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/bookings', {
        showtimeId,
        seats: selectedSeats.map((s) => ({ row: s.row, number: s.number })),
        paymentDetails,
      });

      if (res.data.success && res.data.booking) {
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
        <div className="spinner-border" style={{ color: 'var(--accent-coral)' }} role="status">
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
          className="btn btn-sm btn-cinema-outline mb-3 d-inline-flex align-items-center gap-1"
        >
          <ChevronLeft size={16} /> Back to Seat Selection
        </Link>
        <h2 className="fw-black mb-1" style={{ color: 'var(--text-heading)' }}>
          Review & Demo Payment
        </h2>
        <p className="text-muted small">
          Review your auditorium screening details and complete the simulated educational payment procedure.
        </p>
      </div>

      {/* Seat Hold Countdown Banner */}
      <div
        className={`alert ${
          timeLeftSeconds <= 120 ? 'alert-danger' : 'alert-warning'
        } d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4 shadow-sm`}
      >
        <div className="d-flex align-items-center gap-2">
          <Clock size={20} className="flex-shrink-0" />
          <div>
            <strong>Temporary Seat Hold Active:</strong> Seats reserved for you for{' '}
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
        {/* Left Column: Screening Summary & Payment Method Selector */}
        <div className="col-lg-7">
          {/* Screening Summary Box */}
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
              <span className="d-block small mb-2" style={{ color: 'var(--text-dim)' }}>
                Selected Seats ({selectedSeats.length}):
              </span>
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

          {/* Educational Demo Payment Gateway Selector */}
          <div className="cinema-card p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <ShieldCheck size={20} style={{ color: 'var(--accent-coral)' }} />
                Demo Payment Procedure
              </h5>
              <span className="badge bg-warning text-dark d-flex align-items-center gap-1 font-monospace">
                <Sparkles size={12} /> Sandbox Mode
              </span>
            </div>

            <p className="text-muted small mb-4">
              Select any demo payment instrument below to simulate realistic transaction processing, 3D-Secure authorization, and instant ticket issuance.
            </p>

            {/* Payment Tabs */}
            <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 ${
                  paymentMethod === 'card' ? 'btn-cinema-primary shadow-sm' : 'btn-cinema-outline'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={16} /> Credit / Debit Card
              </button>
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 ${
                  paymentMethod === 'upi' ? 'btn-cinema-primary shadow-sm' : 'btn-cinema-outline'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <Smartphone size={16} /> UPI & QR Code
              </button>
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 ${
                  paymentMethod === 'netbanking' ? 'btn-cinema-primary shadow-sm' : 'btn-cinema-outline'
                }`}
                onClick={() => setPaymentMethod('netbanking')}
              >
                <Building2 size={16} /> Net Banking
              </button>
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3 ${
                  paymentMethod === 'wallet' ? 'btn-cinema-primary shadow-sm' : 'btn-cinema-outline'
                }`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <Wallet size={16} /> Wallets
              </button>
            </div>

            {/* TAB 1: CARD */}
            {paymentMethod === 'card' && (
              <div>
                {/* Preset Autofill Chips */}
                <div className="mb-3">
                  <span className="d-block small text-muted mb-2">⚡ Quick Autofill Test Cards:</span>
                  <div className="d-flex flex-wrap gap-2">
                    {PRESET_CARDS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => handleAutofillCard(preset)}
                      >
                        <Zap size={13} className="text-warning" />
                        {preset.type} ({preset.number.slice(-4)})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>
                      Card Number
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <CreditCard size={18} style={{ color: 'var(--accent-coral)' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control font-monospace border-start-0"
                        placeholder="4532 0150 9920 9010"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Full Name as on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>
                      Expiration Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold d-flex justify-content-between" style={{ color: 'var(--text-main)' }}>
                      <span>CVV / CVC</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Any 3 digits</span>
                    </label>
                    <input
                      type="password"
                      className="form-control font-monospace"
                      placeholder="821"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: UPI */}
            {paymentMethod === 'upi' && (
              <div>
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className={`btn btn-sm ${upiMode === 'qr' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setUpiMode('qr')}
                  >
                    <QrCode size={14} className="me-1 inline" /> Scan Dynamic QR
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${upiMode === 'id' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setUpiMode('id')}
                  >
                    <Smartphone size={14} className="me-1 inline" /> Enter UPI ID
                  </button>
                </div>

                {upiMode === 'qr' ? (
                  <div className="p-4 rounded-3 text-center border bg-light">
                    <div
                      className="p-3 bg-white d-inline-block rounded-3 shadow-sm border mb-3"
                      style={{ maxWidth: '200px' }}
                    >
                      {/* Stylized QR Representation */}
                      <div
                        className="d-flex flex-column align-items-center justify-content-center p-3 rounded"
                        style={{ background: '#153C5B', color: '#FFFFFF', width: '150px', height: '150px' }}
                      >
                        <QrCode size={96} className="text-white" />
                        <span className="font-monospace mt-1 fw-bold" style={{ fontSize: '0.65rem' }}>
                          THE IMOVIES PAY
                        </span>
                      </div>
                    </div>
                    <div className="fw-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                      Scan & Pay {formatINR(totalPrice)}
                    </div>
                    <p className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>
                      Simulated QR for Google Pay, PhonePe, Paytm & BHIM UPI.
                    </p>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">
                      Ready for Demo Scan • Instant Approval
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-main)' }}>
                      Virtual Payment Address (UPI ID)
                    </label>
                    <div className="input-group mb-2">
                      <span className="input-group-text bg-white border-end-0">
                        <Smartphone size={18} style={{ color: 'var(--accent-coral)' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 font-monospace"
                        placeholder="username@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setUpiId('somil@okhdfcbank')}
                      >
                        ⚡ somil@okhdfcbank
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setUpiId('demo.cinema@paytm')}
                      >
                        ⚡ demo.cinema@paytm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {paymentMethod === 'netbanking' && (
              <div>
                <span className="d-block small text-muted mb-3">Select your bank for demo sandbox login:</span>
                <div className="row g-2">
                  {NET_BANKS.map((b) => (
                    <div key={b.id} className="col-sm-6">
                      <div
                        className={`p-3 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition ${
                          selectedBank === b.id ? 'border-primary bg-primary-subtle' : 'bg-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedBank(b.id)}
                      >
                        <Building2 size={18} className={selectedBank === b.id ? 'text-primary' : 'text-muted'} />
                        <span className="small fw-semibold">{b.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WALLETS */}
            {paymentMethod === 'wallet' && (
              <div>
                <span className="d-block small text-muted mb-3">Select your demo linked wallet:</span>
                <div className="d-flex flex-column gap-2">
                  {WALLETS.map((w) => (
                    <div
                      key={w.id}
                      className={`p-3 rounded-3 border d-flex justify-content-between align-items-center cursor-pointer transition ${
                        selectedWallet === w.id ? 'border-primary bg-primary-subtle' : 'bg-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedWallet(w.id)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Wallet size={18} className={selectedWallet === w.id ? 'text-primary' : 'text-muted'} />
                        <span className="small fw-bold">{w.name}</span>
                      </div>
                      <span className="badge bg-secondary font-monospace">
                        Demo Balance: {formatINR(w.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Card Preview, Price Breakdown & Proceed Action */}
        <div className="col-lg-5">
          <div className="cinema-card p-4 position-sticky" style={{ top: '90px' }}>
            {/* Interactive Visual Cinema Card Preview (when Card selected) */}
            {paymentMethod === 'card' && (
              <div
                className="p-4 rounded-4 text-white mb-4 shadow position-relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #153C5B 0%, #226192 60%, #EF8557 100%)',
                  minHeight: '190px',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-1 font-monospace fw-black small tracking-wider">
                    <span>THE IMOVIES</span>
                    <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.6rem' }}>DEMO</span>
                  </div>
                  <span className="fw-bold fs-6 font-monospace">
                    {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'Mastercard' : 'RuPay'}
                  </span>
                </div>

                {/* EMV Chip Representation */}
                <div
                  className="rounded-2 mb-3"
                  style={{
                    width: '38px',
                    height: '28px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                    border: '1px solid rgba(0,0,0,0.2)',
                  }}
                />

                <div className="fs-5 font-monospace fw-bold mb-3 tracking-widest text-shadow">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="d-flex justify-content-between align-items-end small text-white-50">
                  <div>
                    <span className="d-block" style={{ fontSize: '0.65rem' }}>CARDHOLDER</span>
                    <span className="fw-bold text-white text-uppercase">{cardHolder || user?.name || 'GUEST USER'}</span>
                  </div>
                  <div>
                    <span className="d-block" style={{ fontSize: '0.65rem' }}>EXPIRES</span>
                    <span className="fw-bold text-white font-monospace">{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>
            )}

            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-heading)' }}>Order Summary</h5>

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

            {/* Educational Demo Notice */}
            <div className="p-3 rounded-3 mb-4" style={{ background: 'var(--bg-surface-soft)', border: '1px solid var(--border-subtle)' }}>
              <div className="d-flex align-items-center gap-2 small fw-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-coral)' }} /> Educational Sandbox Active
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                This demo payment simulates banking handshakes, 3D-Secure OTP validation, and immediate digital ticket generation without charging real financial funds.
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

            {/* Proceed to Demo Payment Button */}
            <button
              type="button"
              className="btn btn-cinema-primary w-100 py-3 fs-6 fw-bold shadow d-flex align-items-center justify-content-center gap-2"
              disabled={submitting || timeLeftSeconds <= 0 || !termsAccepted || selectedSeats.length === 0}
              onClick={handleInitiatePayment}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Finalizing Tickets...
                </>
              ) : (
                <>
                  <Lock size={18} /> Pay {formatINR(totalPrice)} (Demo Mode)
                </>
              )}
            </button>

            <div className="text-center mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={13} className="text-success me-1 inline" />
              Simulated 256-bit encryption • Instant Ticket Confirmation
            </div>
          </div>
        </div>
      </div>

      {/* Demo Payment Processing Modal */}
      <DemoPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalPrice}
        selectedMethod={paymentMethod}
        methodData={getMethodData()}
        movieTitle={showtime?.movie?.title || 'Cinema Screening'}
        seatCount={selectedSeats.length}
      />
    </div>
  );
};

export default CheckoutPage;
